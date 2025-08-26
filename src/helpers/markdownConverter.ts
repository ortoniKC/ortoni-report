import fs from "fs";
import { marked } from "marked";
import { Steps } from "../types/testResults";

export function convertMarkdownToHtml(
  markdownPath: string,
  htmlOutputPath: string
) {
  const hasMarkdown = fs.existsSync(markdownPath);
  const markdownContent = hasMarkdown
    ? fs.readFileSync(markdownPath, "utf-8")
    : "";
  const markdownHtml = hasMarkdown ? marked(markdownContent) : "";

  const drawerHtml = `${markdownHtml || ""}`;

  fs.writeFileSync(htmlOutputPath, drawerHtml.trim(), "utf-8");

  if (hasMarkdown) {
    fs.unlinkSync(markdownPath);
  }
}
