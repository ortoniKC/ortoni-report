import AnsiToHtml from "ansi-to-html";
import { TestCase, TestResult } from "@playwright/test/reporter";
import path from "path";
import { TestResultData } from "../types/testResults";
import { attachFiles } from "../utils/attachFiles";
import { normalizeFilePath, escapeHtml, extractSuites } from "../utils/utils";
import { OrtoniReportConfig } from "../types/reporterConfig";

export class TestResultProcessor {
  private ansiToHtml: AnsiToHtml;
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.ansiToHtml = new AnsiToHtml({ fg: "var(--snippet-color)" });
    this.projectRoot = projectRoot;
  }

  processTestResult(
    test: TestCase,
    result: TestResult,
    projectSet: Set<string>,
    ortoniConfig: OrtoniReportConfig
  ): TestResultData {
    const status = test.outcome() === "flaky" ? "flaky" : result.status;
    const projectName = test.titlePath()[1];
    projectSet.add(projectName);
    const location = test.location;
    const filePath = normalizeFilePath(test.titlePath()[2]);
    const tagPattern = /@[\w]+/g;
    const title = test.title.replace(tagPattern, "").trim();
    const suite = test.titlePath()[3].replace(tagPattern, "").trim();
    const suiteAndTitle = extractSuites(test.titlePath());
    const suiteHierarchy = suiteAndTitle.hierarchy;

    const testResult: TestResultData = {
      suiteHierarchy,
      key: test.id,
      annotations: test.annotations,
      testTags: test.tags,
      location: `${filePath}:${location.line}:${location.column}`,
      retryAttemptCount: result.retry,
      projectName: projectName,
      suite,
      title,
      status,
      flaky: test.outcome(),
      duration: result.duration,
      errors: result.errors.map((e) =>
        this.ansiToHtml.toHtml(escapeHtml(e.stack || e.toString()))
      ),
      steps: this.processSteps(result.steps),
      logs: this.ansiToHtml.toHtml(
        escapeHtml(
          result.stdout
            .concat(result.stderr)
            .map((log) => log)
            .join("\n")
        )
      ),
      filePath: filePath,
      filters: projectSet,
      base64Image: ortoniConfig.base64Image,
      testId: `${filePath}:${projectName}:${title}`,
    };

    attachFiles(
      path.join(test.id, `retry-${result.retry}`),
      result,
      testResult,
      ortoniConfig,
      testResult.steps,
      testResult.errors
    );
    return testResult;
  }

  private processSteps(steps: any[]): any[] {
    return steps.map((step) => {
      const stepLocation = step.location
        ? `${path.relative(this.projectRoot, step.location.file)}:${
            step.location.line
          }:${step.location.column}`
        : "";
      return {
        snippet: this.ansiToHtml.toHtml(escapeHtml(step.error?.snippet || "")),
        title: step.title,
        location: step.error ? stepLocation : "",
        duration: step.duration,
        status: step.error ? "failed" : "passed",
        category: step.category,
        steps: this.processSteps(step.steps || []),
      };
    });
  }
}
