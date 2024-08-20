import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import colors from "colors/safe";
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import { OrtoniReportConfig } from "./types/reporterConfig";
import { TestResultData } from "./types/testResults";
import {
  ensureHtmlExtension,
  formatDate,
  msToTime,
  normalizeFilePath,
  safeStringify,
} from "./utils/utils";

class OrtoniReport implements Reporter {
  private projectRoot: string = "";
  private results: TestResultData[] = [];
  private groupedResults: Record<string, any> = {};
  private suiteName: string | undefined;
  private config: OrtoniReportConfig;
  private projectSet = new Set<string>();
  private tagsSet = new Set<string>();

  constructor(config: OrtoniReportConfig = {}) {
    this.config = config;
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.results = [];
    this.projectRoot = config.rootDir;
  }

  onTestBegin(test: TestCase, result: TestResult) { }

  onTestEnd(test: TestCase, result: TestResult) {
    try {
      const status = test.outcome() === "flaky" ? "flaky" : result.status;
      const projectName = test.titlePath()[1];
      this.projectSet.add(projectName);
      const location = test.location;
      const filePath = normalizeFilePath(test.titlePath()[2]);
      const tagPattern = /@[\w]+/g;
      const testTags = test.title.match(tagPattern) || [];
      const title = test.title.replace(tagPattern, "").trim();
      const suiteTags = test.titlePath()[3].match(tagPattern) || [];
      const suite = test.titlePath()[3].replace(tagPattern, "").trim();

      const testResult: TestResultData = {
        suiteTags: suiteTags,
        testTags: testTags,
        location: `${filePath}:${location.line}:${location.column}`,
        retry: result.retry > 0 ? "retry" : "",
        isRetry: result.retry,
        projectName: projectName,
        suite: suite,
        title: title,
        status: status,
        flaky: test.outcome(),
        duration: msToTime(result.duration),
        errors: result.errors.map((e) =>
          colors.strip(e.message || e.toString())
        ),
        steps: result.steps.map((step) => {
          const stepLocation = step.location
            ? `${path.relative(this.projectRoot, step.location.file)}:${step.location.line
            }:${step.location.column}`
            : "";
          return {
            snippet: colors.strip(step.error?.snippet || ""),
            title: step.title,
            location: step.error ? stepLocation : "",
          };
        }),
        logs: colors.strip(
          result.stdout
            .concat(result.stderr)
            .map((log) => log)
            .join("\n")
        ),
        filePath: filePath,
        filters: this.projectSet,
        base64Image: this.config.base64Image,
      };
      this.attachFiles(result, testResult);
      this.results.push(testResult);
    } catch (error) {
      console.error("OrtoniReport: Error processing test end:", error);
    }
  }

  private attachFiles(result: TestResult, testResult: TestResultData) {
    console.log(result.attachments);
    if (result.attachments) {
      const { base64Image } = this.config;
      testResult.screenshots = [];
      result.attachments.forEach((attachment) => {
        if (attachment.contentType === "image/png") {
          let screenshotPath = "";
          if (attachment.path) {
            try {
              const screenshotContent = fs.readFileSync(
                attachment.path,
                base64Image ? "base64" : undefined
              );
              screenshotPath = base64Image
                ? `data:image/png;base64,${screenshotContent}`
                : path.resolve(attachment.path);
            } catch (error) {
              console.error(
                `OrtoniReport: Failed to read screenshot file: ${attachment.path}`,
                error
              );
            }
          } else if (attachment.body) {
            screenshotPath = `data:image/png;base64,${attachment.body.toString('base64')}`;
          }
          if (screenshotPath) {
            testResult.screenshots?.push(screenshotPath);
          }
        }
        if (attachment.name === "video" && attachment.path) {
          testResult.videoPath = path.resolve(__dirname, attachment.path);
        }
      });
    }
  }



  onEnd(result: FullResult) {
    try {
      const filteredResults: TestResultData[] = this.results.filter(
        (r) => r.status !== "skipped" && !r.isRetry
      );
      const totalDuration = msToTime(result.duration);
      this.groupResults();

      Handlebars.registerHelper('joinWithSpace', (array) => array.join(' '));
      Handlebars.registerHelper("json", (context) => safeStringify(context));
      Handlebars.registerHelper(
        "eq",
        (actualStatus, expectedStatus) => actualStatus === expectedStatus
      );
      const outputFilename = ensureHtmlExtension(
        this.config.filename || "ortoni-report.html"
      );
      const html = this.generateHTML(filteredResults, totalDuration);
      const outputPath = path.resolve(process.cwd(), outputFilename);
      fs.writeFileSync(outputPath, html);
      console.log(`Ortoni HTML report generated at ${outputPath}`);
    } catch (error) {
      console.error("OrtoniReport: Error generating report:", error);
    }
  }

  private groupResults() {
    if (this.config.showProject) {
      // Group by filePath, suite, and projectName
      this.groupedResults = this.results.reduce((acc: any, result, index) => {
        const { filePath, suite, projectName } = result;
        acc[filePath] = acc[filePath] || {};
        acc[filePath][suite] = acc[filePath][suite] || {};
        acc[filePath][suite][projectName] =
          acc[filePath][suite][projectName] || [];
        acc[filePath][suite][projectName].push({ ...result, index });
        return acc;
      }, {});
    } else {
      // Group by filePath and suite, ignoring projectName
      this.groupedResults = this.results.reduce((acc: any, result, index) => {
        const { filePath, suite } = result;
        acc[filePath] = acc[filePath] || {};
        acc[filePath][suite] = acc[filePath][suite] || [];
        acc[filePath][suite].push({ ...result, index });
        return acc;
      }, {});
    }
  }

  generateHTML(filteredResults: TestResultData[], totalDuration: string) {
    try {
      const totalTests = filteredResults.length;
      const passedTests = this.results.filter(
        (r) => r.status === "passed"
      ).length;
      const flakyTests = this.results.filter((r) => r.flaky === "flaky").length;
      const failed = filteredResults.filter(
        (r) => r.status === "failed" || r.status === "timedOut"
      ).length;
      const successRate = (
        ((passedTests + flakyTests) / totalTests) *
        100
      ).toFixed(2);
      const templateSource = fs.readFileSync(
        path.resolve(__dirname, "report-template.hbs"),
        "utf-8"
      );
      const template = Handlebars.compile(templateSource);
      const logo = this.config.logo
        ? path.resolve(this.config.logo)
        : undefined;

      const allTags = new Set();
      this.results.forEach(result => {
        result.suiteTags.forEach(tag => allTags.add(tag));
        result.testTags.forEach(tag => allTags.add(tag));
      });

      const data = {
        logo: logo,
        totalDuration: totalDuration,
        suiteName: this.suiteName,
        results: this.results,
        retryCount: this.results.filter((r) => r.isRetry).length,
        passCount: passedTests,
        failCount: failed,
        skipCount: this.results.filter((r) => r.status === "skipped").length,
        flakyCount: flakyTests,
        totalCount: filteredResults.length,
        groupedResults: this.groupedResults,
        projectName: this.config.projectName,
        authorName: this.config.authorName,
        testType: this.config.testType,
        preferredTheme: this.config.preferredTheme,
        successRate: successRate,
        lastRunDate: formatDate(new Date()),
        projects: this.projectSet,
        allTags: Array.from(allTags),
        showProject: this.config.showProject || false,
        title: this.config.title || "Ortoni Playwright Test Report",
      };
      return template(data);
    } catch (error: any) {
      console.error("OrtoniReport: Error generating HTML:", error);
      return `<html><body><h1>Report generation failed</h1><pre>${error.stack}</pre></body></html>`;
    }
  }
}
export { OrtoniReport as default };
export { OrtoniReportConfig };