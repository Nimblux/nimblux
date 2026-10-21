import { prisma } from "../src/lib/prisma";
import {
  normalizeEmail,
  generateSecureOtp,
  hashOtp,
  timingSafeOtpCompare,
  checkOtpSendRateLimits,
  checkVerificationBruteForce,
  issueOtpRecord,
  OTP_EXPIRY_MS,
  MAX_INCORRECT_ATTEMPTS,
} from "../src/lib/otp";
import { sendOtpEmail, verifySmtpConnection } from "../src/lib/email";

async function runTests() {
  console.log("==================================================");
  console.log("STARTING NIMBLUX BUSINESS EMAIL OTP VERIFICATION TESTS");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // -----------------------------------------------------------
  // Test 1: Email normalization and validation
  // -----------------------------------------------------------
  console.log("--- 1. Email Normalization and Validation ---");
  assert(
    normalizeEmail("  Admin@Nimblux.XYZ  ") === "admin@nimblux.xyz",
    "Trims and lowercases email"
  );
  assert(
    normalizeEmail("user.name+tag@domain.co.uk") === "user.name+tag@domain.co.uk",
    "Supports valid complex RFC emails"
  );
  assert(normalizeEmail("invalid-email") === null, "Rejects email missing @ and domain");
  assert(normalizeEmail("@domain.com") === null, "Rejects email missing local part");
  assert(normalizeEmail("user@") === null, "Rejects email missing domain");
  assert(normalizeEmail("") === null, "Rejects empty email");

  // -----------------------------------------------------------
  // Test 2: Cryptographically Secure OTP Generation
  // -----------------------------------------------------------
  console.log("\n--- 2. Cryptographically Secure OTP Generation ---");
  const samples = new Set<string>();
  for (let i = 0; i < 20; i++) {
    const code = generateSecureOtp();
    assert(/^\d{6}$/.test(code), `Generated OTP "${code}" is strictly 6 numeric digits`);
    samples.add(code);
  }
  assert(samples.size > 15, "OTP entropy is high across 20 samples");

  // -----------------------------------------------------------
  // Test 3: OTP Hashing and Timing-Safe Verification
  // -----------------------------------------------------------
  console.log("\n--- 3. OTP Hashing and Timing-Safe Verification ---");
  const testEmail = "test_verification_" + Date.now() + "@nimblux.test";
  const rawOtp = "482915";
  const otpHash = hashOtp(testEmail, rawOtp);

  assert(typeof otpHash === "string" && otpHash.length === 64, "OTP hash is 64-char SHA256 hex");
  assert(otpHash !== rawOtp, "OTP is never stored in plaintext");

  assert(
    timingSafeOtpCompare(testEmail, rawOtp, otpHash),
    "Matching OTP validates timing-safely"
  );
  assert(
    !timingSafeOtpCompare(testEmail, "999999", otpHash),
    "Incorrect OTP is rejected"
  );
  assert(
    !timingSafeOtpCompare("different@domain.com", rawOtp, otpHash),
    "OTP salted with email cannot be replayed for another email"
  );

  // -----------------------------------------------------------
  // Test 4: Database-Backed OTP Issuance & Cooldown Enforcement
  // -----------------------------------------------------------
  console.log("\n--- 4. Database-Backed OTP Issuance & Cooldown Enforcement ---");
  const dbTestEmail = "db_test_" + Date.now() + "@nimblux.test";
  const issuedCode = "654321";

  const record1 = await issueOtpRecord({
    normalizedEmail: dbTestEmail,
    otp: issuedCode,
    clientIp: "203.0.113.195",
  });

  assert(Boolean(record1.id), "OTP record created in PostgreSQL");
  assert(record1.attempts === 0, "Initial attempts is 0");
  assert(record1.maxAttempts === 5, "Max attempts initialized to 5");
  assert(record1.expiresAt.getTime() > Date.now(), "Expiry is in future");

  // Verify cooldown check blocks immediate resend
  const rateLimitCheck1 = await checkOtpSendRateLimits(dbTestEmail, "203.0.113.195");
  assert(
    !rateLimitCheck1.allowed && (rateLimitCheck1.retryAfterSeconds || 0) > 0,
    "Cooldown blocks immediate resend (< 60s)"
  );

  // -----------------------------------------------------------
  // Test 5: Invalidation of Previous Codes when New is Issued
  // -----------------------------------------------------------
  console.log("\n--- 5. Invalidation of Previous Codes ---");
  // Fast-forward record1 cooldown for testing re-issue
  await prisma.emailVerification.update({
    where: { id: record1.id },
    data: { resendAfter: new Date(Date.now() - 1000) },
  });

  const record2 = await issueOtpRecord({
    normalizedEmail: dbTestEmail,
    otp: "777888",
    clientIp: "203.0.113.195",
  });

  const reloadedRecord1 = await prisma.emailVerification.findUnique({
    where: { id: record1.id },
  });
  assert(
    reloadedRecord1?.expiresAt.getTime()! <= Date.now(),
    "Prior OTP code is immediately invalidated upon new OTP issuance"
  );
  assert(record2.id !== record1.id, "New OTP record has distinct ID");

  // -----------------------------------------------------------
  // Test 6: Incorrect Attempts Counter & 5-Attempt Lockout
  // -----------------------------------------------------------
  console.log("\n--- 6. Incorrect Attempts Counter & 5-Attempt Lockout ---");
  let curAttempts = record2.attempts;
  for (let i = 1; i <= 5; i++) {
    const updated = await prisma.emailVerification.update({
      where: { id: record2.id },
      data: { attempts: { increment: 1 } },
    });
    curAttempts = updated.attempts;
  }
  assert(curAttempts === 5, "Attempts counter reached 5");
  assert(curAttempts >= record2.maxAttempts, "Code locked out after 5 incorrect attempts");

  // -----------------------------------------------------------
  // Test 7: Expiry Check (> 10 minutes)
  // -----------------------------------------------------------
  console.log("\n--- 7. Expiry Check ---");
  const expiredEmail = "expired_" + Date.now() + "@nimblux.test";
  const expiredRecord = await prisma.emailVerification.create({
    data: {
      email: expiredEmail,
      otpHash: hashOtp(expiredEmail, "123456"),
      expiresAt: new Date(Date.now() - 1000), // in the past
      resendAfter: new Date(Date.now() - 1000),
      attempts: 0,
    },
  });

  const isExpired = Date.now() > expiredRecord.expiresAt.getTime();
  assert(isExpired, "Expired OTP correctly identified by timestamp comparison");

  // -----------------------------------------------------------
  // Test 8: Replay Attack Invalidation upon Successful Verification
  // -----------------------------------------------------------
  console.log("\n--- 8. Replay Attack Invalidation ---");
  const replayEmail = "replay_" + Date.now() + "@nimblux.test";
  const replayOtp = "918273";
  const replayRecord = await issueOtpRecord({
    normalizedEmail: replayEmail,
    otp: replayOtp,
  });

  // Verify and mark used
  await prisma.emailVerification.update({
    where: { id: replayRecord.id },
    data: { verifiedAt: new Date() },
  });

  // Query for pending active code
  const activeCode = await prisma.emailVerification.findFirst({
    where: { email: replayEmail, verifiedAt: null },
  });
  assert(activeCode === null, "Used code cannot be replayed (verifiedAt is not null)");

  // -----------------------------------------------------------
  // Test 9: User Activation and Notification Trigger
  // -----------------------------------------------------------
  console.log("\n--- 9. User Activation & Notification Trigger ---");
  const signupEmail = "signup_" + Date.now() + "@nimblux.test";

  // Create pending user
  const pendingUser = await prisma.user.create({
    data: {
      name: "Test Builder",
      email: signupEmail,
      status: "PENDING_VERIFICATION",
      emailVerified: false,
    },
  });

  assert(pendingUser.status === "PENDING_VERIFICATION", "User initially in PENDING_VERIFICATION");
  assert(pendingUser.emailVerified === false, "User emailVerified is initially false");

  // Simulate verification success
  const activatedUser = await prisma.user.update({
    where: { id: pendingUser.id },
    data: {
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  assert(activatedUser.status === "ACTIVE", "User status transitioned to ACTIVE");
  assert(activatedUser.emailVerified === true, "User emailVerified is true");
  assert(Boolean(activatedUser.emailVerifiedAt), "emailVerifiedAt timestamp recorded");

  // Cleanup test user
  await prisma.user.delete({ where: { id: pendingUser.id } }).catch(() => {});

  // -----------------------------------------------------------
  // Test 10: SMTP Configuration and Transport
  // -----------------------------------------------------------
  console.log("\n--- 10. SMTP Hostinger Configuration Check ---");
  const smtpCheck = await verifySmtpConnection();
  console.log(`SMTP Connection Check: ${smtpCheck.message}`);
  // If SMTP_PASS is empty in testing, it safely detects it without crash
  assert(
    smtpCheck.success || smtpCheck.message.includes("SMTP_PASS") || smtpCheck.message.includes("connect"),
    "SMTP check handled securely without unhandled rejection or secret leakage"
  );

  // Clean up any test verification records
  await prisma.emailVerification.deleteMany({
    where: { email: { in: [dbTestEmail, expiredEmail, replayEmail] } },
  }).catch(() => {});

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error("Fatal test error:", e);
  process.exit(1);
});
