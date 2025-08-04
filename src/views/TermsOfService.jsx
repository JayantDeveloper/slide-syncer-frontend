import React from "react";

export default function TermsOfService() {
  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}>
        Terms of Service
      </h1>

      <p style={{ marginBottom: "16px" }}>
        By using CodeKiwi, you agree to the following simple terms.
      </p>

      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginTop: "20px" }}>1. Educational Use</h2>
      <p style={{ marginBottom: "16px" }}>
        CodeKiwi is designed for teachers and students to use in a classroom or learning environment.
        It may not be used for commercial training programs or resold in any form without permission.
      </p>

      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginTop: "20px" }}>2. No Warranty</h2>
      <p style={{ marginBottom: "16px" }}>
        CodeKiwi is provided "as is." We are not responsible for any data loss, system errors, or any
        consequences resulting from using the platform. Always review your materials before using them in class.
      </p>

      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginTop: "20px" }}>3. Privacy</h2>
      <p style={{ marginBottom: "16px" }}>
        We do not sell or share personal data. Some data may be used to improve platform performance or fix bugs.
        For details, see our <a href="/privacy" style={{ color: "#6b8f2b" }}>Privacy Policy</a>.
      </p>

      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginTop: "20px" }}>4. Respectful Use</h2>
      <p style={{ marginBottom: "16px" }}>
        Please use CodeKiwi responsibly. Don’t attempt to break the system, spam users, or misuse it for anything
        other than educational activities.
      </p>

      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginTop: "20px" }}>5. Ownership</h2>
      <p style={{ marginBottom: "16px" }}>
        The CodeKiwi platform, design, and features are the intellectual property of its creator. Please don’t copy,
        redistribute, or clone the platform without permission.
      </p>

      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginTop: "20px" }}>6. Updates</h2>
      <p style={{ marginBottom: "16px" }}>
        We may update these terms occasionally. Continued use of the platform means you agree to the updated terms.
      </p>

      <p style={{ fontSize: "0.875rem", color: "gray", marginTop: "40px" }}>Last updated: August 2, 2025</p>
    </div>
  );
}
