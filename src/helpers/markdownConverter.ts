import fs from "fs";
import { marked } from "marked";
import { Steps } from "../types/testResults";

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

  // Step snippets
  const stepsHtml = stepsError
    .filter((step) => step.snippet?.trim())
    .map(
      (step: Steps) => `
        <div class="text-xs">
          <pre>${step.snippet ?? ""}</pre>
          ${step.location ? `<em>Location: ${step.location}</em>` : ""}
        </div>`
    )
    .join("\n");

  // Error blocks
  const errorHtml = resultError
    .map((error: string) => `<div class="text-xs"><pre>${error}</pre></div>`)
    .join("\n");

  const drawerHtml = `
    <div>
      <h2 class="text-lg font-bold">Instructions</h2>
      <ul class="list-disc list-inside space-y-0 px-4">
        <li>Following Playwright test failed.</li>
        <li>Explain why, be concise, respect Playwright best practices.</li>
        <li>Provide a snippet of code with the fix, if possible.</li>
      </ul>
      <h2 class="text-lg font-bold">Error Details</h2>
      ${
        errorHtml.trim() ||
        '<p class="text-muted-foreground">No errors found.</p>'
      }
      <h2 class="text-lg font-bold">Step Details</h2>
      ${
        stepsHtml.trim() ||
        '<p class="text-muted-foreground">No step data available.</p>'
      }
      ${markdownHtml || ""}
    </div>
  `;

  fs.writeFileSync(htmlOutputPath, drawerHtml.trim(), "utf-8");

  if (hasMarkdown) {
    fs.unlinkSync(markdownPath);
  }
}
