import { prisma } from "../src/lib/prisma";
import { POST as sendOtpHandler } from "../src/app/api/auth/verify-email/send-otp/route";
import { POST as verifyHandler } from "../src/app/api/auth/verify-email/verify/route";
import { POST as loginHandler } from "../src/app/api/auth/login/route";
import { POST as registerHandler } from "../src/app/api/auth/register/route";
import { NextRequest } from "next/server";
import { issueOtpRecord, hashOtp } from "../src/lib/otp";

async function runApiTests() {
  console.log("==================================================");
  console.log("TESTING API ENDPOINTS END-TO-END");
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

  function mockRequest(url: string, body: any, headers: Record<string, string> = {}): NextRequest {
    return new NextRequest(new URL(url, "http://localhost:3000"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "198.51.100.42",
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }

  // 1. Duplicate active account prevention
  console.log("--- 1. Duplicate Active Account Prevention ---");
  // Find an existing active user from DB
  const existingUser = await prisma.user.findFirst({
    where: { status: "ACTIVE" },
  });

  if (existingUser) {
    const req1 = mockRequest("http://localhost:3000/api/auth/verify-email/send-otp", {
      email: existingUser.email,
      name: "Duplicate User",
      password: "password123",
    });
    const res1 = await sendOtpHandler(req1);
    const data1 = await res1.json();

    assert(res1.status === 400, "Send OTP returns 400 on duplicate active email");
    assert(data1.error.includes("already exists"), "Returns clear already exists message");
  }

  // 2. Invalid email format
  console.log("\n--- 2. Invalid Email Format Handling ---");
  const req2 = mockRequest("http://localhost:3000/api/auth/verify-email/send-otp", {
    email: "not-an-email",
    password: "password123",
  });
  const res2 = await sendOtpHandler(req2);
  const data2 = await res2.json();
  assert(res2.status === 400, "Send OTP returns 400 on invalid email syntax");
  assert(data2.error.includes("valid email"), "Returns clear error for invalid email");

  // 3. Short password handling
  console.log("\n--- 3. Short Password Handling ---");
  const req3 = mockRequest("http://localhost:3000/api/auth/verify-email/send-otp", {
    email: "valid.candidate@university.edu",
    password: "123",
  });
  const res3 = await sendOtpHandler(req3);
  const data3 = await res3.json();
  assert(res3.status === 400, "Send OTP returns 400 on password < 6 chars");
  assert(data3.error.includes("6 characters"), "Returns clear error for password length");

  // 4. Verify endpoint: Wrong OTP attempt counter
  console.log("\n--- 4. Verify Endpoint: Wrong OTP & Remaining Attempts ---");
  const testEmail = "test_candidate_" + Date.now() + "@nimblux.test";
  const realOtp = "381942";

  // Pre-seed an OTP record
  await issueOtpRecord({
    normalizedEmail: testEmail,
    otp: realOtp,
    clientIp: "198.51.100.42",
  });

  // Create pending user
  await prisma.user.create({
    data: {
      name: "Candidate Test",
      email: testEmail,
      status: "PENDING_VERIFICATION",
      emailVerified: false,
    },
  });

  // Submit wrong code
  const reqWrong = mockRequest("http://localhost:3000/api/auth/verify-email/verify", {
    email: testEmail,
    otp: "000000",
  });
  const resWrong = await verifyHandler(reqWrong);
  const dataWrong = await resWrong.json();

  assert(resWrong.status === 400, "Wrong code returns 400");
  assert(dataWrong.remainingAttempts === 4, "Remaining attempts decremented to 4");
  assert(dataWrong.error.includes("4 attempts remaining"), "Returns formatted remaining attempts message");

  // 5. Verify endpoint: Correct OTP verification & account activation
  console.log("\n--- 5. Verify Endpoint: Correct OTP & Account Activation ---");
  const reqCorrect = mockRequest("http://localhost:3000/api/auth/verify-email/verify", {
    email: testEmail,
    otp: realOtp,
  });
  const resCorrect = await verifyHandler(reqCorrect);
  const dataCorrect = await resCorrect.json();

  assert(resCorrect.status === 200, "Correct code returns 200");
  assert(dataCorrect.success === true, "Response reports success = true");
  assert(dataCorrect.user?.emailVerified === true, "User returned with emailVerified = true");

  const activatedUserInDb = await prisma.user.findUnique({
    where: { email: testEmail },
  });
  assert(activatedUserInDb?.status === "ACTIVE", "User status in database updated to ACTIVE");
  assert(activatedUserInDb?.emailVerified === true, "User emailVerified in database is true");
  assert(Boolean(activatedUserInDb?.emailVerifiedAt), "emailVerifiedAt is recorded in database");

  // Check auth session cookie
  const setCookie = resCorrect.headers.get("set-cookie") || "";
  assert(setCookie.includes("nimblux_session"), "Session cookie 'nimblux_session' issued upon verification");

  // 6. Replay attack prevention on verify endpoint
  console.log("\n--- 6. Replay Attack Prevention on Verify Endpoint ---");
  const reqReplay = mockRequest("http://localhost:3000/api/auth/verify-email/verify", {
    email: testEmail,
    otp: realOtp,
  });
  const resReplay = await verifyHandler(reqReplay);
  const dataReplay = await resReplay.json();

  assert(resReplay.status === 400, "Replaying already-used code is rejected with 400");
  assert(dataReplay.error.includes("No active verification code"), "Replay attempt blocked: no active code");

  // Cleanup test user and verifications
  await prisma.user.delete({ where: { email: testEmail } }).catch(() => {});
  await prisma.emailVerification.deleteMany({ where: { email: testEmail } }).catch(() => {});

  console.log("\n==================================================");
  console.log(`API TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runApiTests().catch((e) => {
  console.error("Fatal API test error:", e);
  process.exit(1);
});
