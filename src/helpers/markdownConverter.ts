import fs from "fs";
import { marked } from "marked";
import { Steps } from "../types/testResults";
import { escapeHtml } from "../utils/utils";

export function convertMarkdownToHtml(
  markdownPath: string,
  htmlOutputPath: string,
  stepsError: Steps[],
  resultError: string[]
) {
  const hasMarkdown = fs.existsSync(markdownPath);
  const markdownContent = hasMarkdown
    ? fs.readFileSync(markdownPath, "utf-8")
    : "";
  const markdownHtml = hasMarkdown ? marked(markdownContent) : "";

  const stepsHtml = stepsError
    .filter((step) => step.snippet?.trim())
    .map(
      (step: Steps) => `
      <div>
        <pre><code>${step.snippet}</code></pre>
        ${
          step.location
            ? `<p><em>Location: ${escapeHtml(step.location)}</em></p>`
            : ""
        }
      </div>`
    )
    .join("\n");

  const errorHtml = resultError
    .map((error: string) => `<pre><code>${error}</code></pre>`)
    .join("\n");

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Ortoni Error Report</title>
      <style>
        body { font-family: sans-serif; padding: 2rem; line-height: 1.6; max-width: 900px; margin: auto; }
        code, pre { background: #f4f4f4; padding: 0.5rem; border-radius: 5px; display: block; overflow-x: auto; }
        h1, h2, h3 { color: #444; }
        hr { margin: 2em 0; }
        #copyBtn {
          background-color: #007acc;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          margin-bottom: 1rem;
          border-radius: 5px;
          cursor: pointer;
        }
        #copyBtn:hover {
          background-color: #005fa3;
        }
      </style>
    </head>
    <body>
      <button id="copyBtn">📋 Copy All</button>
      <script>
        document.getElementById("copyBtn").addEventListener("click", () => {
          const content = document.getElementById("markdownContent").innerText;
          navigator.clipboard.writeText(content).then(() => {
            // change button text to indicate success
            const button = document.getElementById("copyBtn");
            button.textContent = "✅ Copied!";
            setTimeout(() => {
              button.textContent = "📋 Copy All"
              }, 2000);
          }).catch(err => {
            console.error("Failed to copy text: ", err);
            alert("Failed to copy text. Please try manually.");   
          });
        });
      </script>
      <div id="markdownContent">
      <h1>Instructions</h1>
      <ul>
        <li>Following Playwright test failed.</li>
        <li>Explain why, be concise, respect Playwright best practices.</li>
        <li>Provide a snippet of code with the fix, if possible.</li>
      </ul>
      <h1>Error Details</h1>
      ${errorHtml || "<p>No errors found.</p>"}
      ${stepsHtml || "<p>No step data available.</p>"}
      ${markdownHtml || ""}
      </div>
    </body>
    </html>
  `;

  fs.writeFileSync(htmlOutputPath, fullHtml, "utf-8");
  if (hasMarkdown) {
    fs.unlinkSync(markdownPath);
  }
}
