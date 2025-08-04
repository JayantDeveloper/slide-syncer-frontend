import React from "react";

export default function Support() {
  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}>
        Support
      </h1>
      <p style={{ marginBottom: "16px" }}>
        If you need help using CodeKiwi or encounter any issues, feel free to reach out:
      </p>
      <ul style={{ marginBottom: "16px" }}>
        <li>Email: <a href="mailto:jaymaheshwari2603@gmail.com">jaymaheshwari2603@gmail.com</a></li>
      </ul>
      <p style={{ marginBottom: "16px" }}>
        Common fixes:
      </p>
      <ul>
        <li>Refresh the Slides Add-on sidebar if it doesn’t load properly</li>
        <li>Make sure you’re using a Google Slides file, not a PDF</li>
        <li>Ensure you granted all requested permissions</li>
      </ul>
      <p style={{ fontSize: "0.875rem", color: "gray" }}>Last updated: August 2, 2025</p>
    </div>
  );
}
