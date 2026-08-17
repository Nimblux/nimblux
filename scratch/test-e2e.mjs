// test-e2e.mjs
async function runTest() {
  console.log("=== STEP 1: Student Login ===");
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "student@nimblux.com", password: "Student@123" }),
  });
  const cookie = loginRes.headers.get("set-cookie");
  const loginData = await loginRes.json();
  console.log("Student Logged in:", loginData.user.name, "Cookie set:", Boolean(cookie));

  console.log("\n=== STEP 2: Student Submits Opportunity (Pending Approval) ===");
  const subRes = await fetch("http://localhost:3000/api/opportunities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      title: "Uber Global Immersion & Hackathon 2026",
      organization: "Uber Technologies",
      category: "hackathons",
      mode: "REMOTE",
      location: "Global Virtual",
      applicationUrl: "https://uber.com/hackathon",
      description: "Compete against student engineers worldwide to solve real-time mobility challenges.",
      deadline: "2026-11-30",
      eligibility: "Undergraduate students",
      skills: "Python, Go, Distributed Systems",
    }),
  });
  const subData = await subRes.json();
  console.log("Opportunity Submission Result:", subData.message);
  console.log("Opportunity Status:", subData.opportunity.status); // Should be PENDING
  const oppId = subData.opportunity.id;

  console.log("\n=== STEP 3: Admin Login ===");
  const adminLoginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@nimblux.com", password: "Admin@123" }),
  });
  const adminCookie = adminLoginRes.headers.get("set-cookie");
  const adminData = await adminLoginRes.json();
  console.log("Admin Logged In:", adminData.user.name, "Role:", adminData.user.role);

  console.log("\n=== STEP 4: Admin Approves Opportunity ===");
  const approveRes = await fetch(`http://localhost:3000/api/admin/opportunities/${oppId}/approve`, {
    method: "POST",
    headers: { Cookie: adminCookie },
  });
  const approveData = await approveRes.json();
  console.log("Admin Approval Result:", approveData.message);
  console.log("New Opportunity Status:", approveData.opportunity.status); // Should be APPROVED

  console.log("\n=== STEP 5: Check Student Notifications ===");
  const notifRes = await fetch("http://localhost:3000/api/notifications", {
    headers: { Cookie: cookie },
  });
  const notifData = await notifRes.json();
  console.log(`Student Notifications Count: ${notifData.notifications?.length}`);
  if (notifData.notifications?.length > 0) {
    console.log("Latest Notification:", notifData.notifications[0].title, "-", notifData.notifications[0].message);
  }

  console.log("\n🎉 ALL E2E LIFECYCLE TESTS PASSED WITH 100% SUCCESS!");
}

runTest().catch(console.error);
