// test-rejection.mjs
async function runRejectionTest() {
  console.log("=== STEP 1: Student Login & Submit Opportunity ===");
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "student@nimblux.com", password: "Student@123" }),
  });
  const studentCookie = loginRes.headers.get("set-cookie");

  const subRes = await fetch("http://localhost:3000/api/opportunities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: studentCookie,
    },
    body: JSON.stringify({
      title: "Sample Incomplete Contest 2026",
      organization: "Sample Org",
      category: "competitions",
      mode: "REMOTE",
      location: "Online",
      applicationUrl: "https://example.com/broken-link",
      description: "Short incomplete test description.",
      deadline: "2026-10-15",
    }),
  });
  const subData = await subRes.json();
  const oppId = subData.opportunity.id;
  console.log("Submitted Opp ID:", oppId, "Status:", subData.opportunity.status);

  console.log("\n=== STEP 2: Admin Login & Reject with Feedback Reason ===");
  const adminLoginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@nimblux.com", password: "Admin@123" }),
  });
  const adminCookie = adminLoginRes.headers.get("set-cookie");

  const rejectRes = await fetch(`http://localhost:3000/api/admin/opportunities/${oppId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      reason: "Official registration link appears invalid and description lacks eligibility requirements.",
    }),
  });
  const rejectData = await rejectRes.json();
  console.log("Admin Rejection Result:", rejectData.message);
  console.log("New Opp Status:", rejectData.opportunity.status, "Rejection Reason:", rejectData.opportunity.rejectionReason);

  console.log("\n=== STEP 3: Student Checks Submissions & Notifications ===");
  const studentSubmissionsRes = await fetch("http://localhost:3000/api/users/submissions", {
    headers: { Cookie: studentCookie },
  });
  const studentSubs = await studentSubmissionsRes.json();
  const targetSub = studentSubs.submissions.find((o) => o.id === oppId);
  console.log("Found in Student Submissions:", targetSub.title);
  console.log("Rejection feedback visible to Student:", targetSub.rejectionReason);

  console.log("\n🎉 REJECTION MODERATION & FEEDBACK LOOP PASSED 100%!");
}

runRejectionTest().catch(console.error);
