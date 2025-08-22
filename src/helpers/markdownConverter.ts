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

  const errorHtml = resultError
    .map(
      (error: string) => `
      <pre class="bg-destructive/10 text-destructive p-3 rounded-md overflow-x-auto text-sm mb-2">
        <code>${error}</code>
      </pre>`
    )
    .join("\n");

  const fullHtml = `
    <div id="markdownContent" class="space-y-6">
      <h1 class="text-xl font-bold">Instructions</h1>
      <ul class="list-disc list-inside space-y-1">
        <li>Following Playwright test failed.</li>
        <li>Explain why, be concise, respect Playwright best practices.</li>
        <li>Provide a snippet of code with the fix, if possible.</li>
      </ul>

      <h1 class="text-xl font-bold">Error Details</h1>
      ${errorHtml || '<p class="text-muted-foreground">No errors found.</p>'}
      ${
        stepsHtml ||
        '<p class="text-muted-foreground">No step data available.</p>'
      }
      ${markdownHtml || ""}
    </div>
  `;

  fs.writeFileSync(htmlOutputPath, fullHtml, "utf-8");
  if (hasMarkdown) {
    fs.unlinkSync(markdownPath);
  }
}
