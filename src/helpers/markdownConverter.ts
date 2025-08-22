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
        <section class="mb-4">
          <pre class="bg-muted p-3 rounded-md overflow-x-auto text-sm">
            <code>${step.snippet ?? ""}</code>
          </pre>
          ${
            step.location
              ? `<p class="text-xs text-muted-foreground mt-1">
                  <em>Location: ${step.location}</em>
                 </p>`
              : ""
          }
        </section>`
    )
    .join("\n");

  // Error blocks
  const errorHtml = resultError
    .map(
      (error: string) => `
        <pre class="bg-destructive/10 text-destructive p-3 rounded-md overflow-x-auto text-sm mb-2">
          <code>${error}</code>
        </pre>`
    )
    .join("\n");

  // Drawer-compatible fragment
  const drawerHtml = `
    <div class="space-y-6">
      <h2 class="text-xl font-bold">Instructions</h2>
      <ul class="list-disc list-inside space-y-1">
        <li>Following Playwright test failed.</li>
        <li>Explain why, be concise, respect Playwright best practices.</li>
        <li>Provide a snippet of code with the fix, if possible.</li>
      </ul>
      <h2 class="text-xl font-bold">Error Details</h2>
      ${
        errorHtml.trim() ||
        '<p class="text-muted-foreground">No errors found.</p>'
      }
      <h2 class="text-xl font-bold">Step Details</h2>
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
