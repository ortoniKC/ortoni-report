import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
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
  escapeHtml,
  formatDate,
  msToTime,
  normalizeFilePath,
  safeStringify,
} from "./utils/utils";
// import WebSocketHelper from "./utils/webSocketHelper";
import AnsiToHtml from 'ansi-to-html';
import { startReportServer } from "./utils/expressServer";
import AttachFiles from "./utils/attachFiles";

class OrtoniReport implements Reporter {
  private ansiToHtml = new AnsiToHtml({
    fg: "var(--snippet-color)",
  });
  private projectRoot: string = "";
  private results: TestResultData[] = [];
  private groupedResults: Record<string, any> = {};
  private suiteName: string | undefined;
  private config: OrtoniReportConfig;
  private projectSet = new Set<string>();
  private folderPath: string;
  // private wsHelper: WebSocketHelper;
  constructor(config: OrtoniReportConfig = {}, private attachFiles: AttachFiles) {
    this.attachFiles = new AttachFiles();
    this.config = config;
    this.folderPath = config.folderPath || 'playwright-report';
    // this.wsHelper = new WebSocketHelper(config?.port || 4000);
    // this.wsHelper.setupWebSocket();
    // this.wsHelper.setupCleanup();
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.results = [];
    this.projectRoot = config.rootDir;
    if (!fs.existsSync(this.folderPath)) {
      fs.mkdirSync(this.folderPath, { recursive: true });
    }
    // this.wsHelper.broadcastUpdate(this.results);
  }

  onTestBegin(test: TestCase, result: TestResult) {
    // this.wsHelper.broadcastUpdate(this.results);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    try {
      const status = test.outcome() === "flaky" ? "flaky" : result.status;
      const projectName = test.titlePath()[1];
      this.projectSet.add(projectName);
      const location = test.location;
      const filePath = normalizeFilePath(test.titlePath()[2]);
      const tagPattern = /@[\w]+/g;
      const title = test.title.replace(tagPattern, "").trim();
      const suite = test.titlePath()[3].replace(tagPattern, "").trim();

      const testResult: TestResultData = {
        annotations: test.annotations,
        testTags: test.tags,
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
          this.ansiToHtml.toHtml(escapeHtml(e.stack || e.toString()))
        ),
        steps: result.steps.map((step) => {
          const stepLocation = step.location
            ? `${path.relative(this.projectRoot, step.location.file)}:${step.location.line
            }:${step.location.column}`
            : "";
          return {
            snippet: this.ansiToHtml.toHtml(escapeHtml(step.error?.snippet || "")),
            title: step.title,
            location: step.error ? stepLocation : "",
          };
        }),
        logs: this.ansiToHtml.toHtml(
          escapeHtml(result.stdout
            .concat(result.stderr)
            .map((log) => log)
            .join("\n"))
        ),
        filePath: filePath,
        filters: this.projectSet,
        base64Image: this.config.base64Image,
      };
      this.attachFiles.attachFiles(result, testResult, this.config);
      this.results.push(testResult);
      // this.wsHelper.broadcastUpdate(this.results);
    } catch (error) {
      console.error("OrtoniReport: Error processing test end:", error);
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
      Handlebars.registerHelper("gr", (count) => count > 0);
      const cssContent = fs.readFileSync(
        path.resolve(__dirname, "style", "main.css"),
        "utf-8"
      );
      this.registerPartial("navbar");
      this.registerPartial("testStatus");
      this.registerPartial("testPanel");
      this.registerPartial("summaryCard");
      this.registerPartial("userInfo");
      this.registerPartial("project");
      const outputFilename = ensureHtmlExtension(
        this.config.filename || "ortoni-report.html"
      );
      if (!fs.existsSync(this.folderPath)) {
        fs.mkdirSync(this.folderPath, { recursive: true });
      }
      const html = this.generateHTML(filteredResults, totalDuration, cssContent);
      const outputPath = path.join(process.cwd(), this.folderPath, outputFilename);
      fs.writeFileSync(outputPath, html);
      console.log(`Ortoni HTML report generated at ${outputPath}`);
      startReportServer(this.folderPath, outputFilename);
      // if (this.wsHelper) {
      //   this.wsHelper.testComplete();
      // }
    } catch (error) {
      console.error("OrtoniReport: Error generating report:", error);
    }
  }
  async onExit() {
    try {
      const outputFilename = ensureHtmlExtension(
        this.config.filename || "ortoni-report.html"
      );
      startReportServer(this.folderPath, outputFilename);
      console.log('OrtoniReport: Server is running. Press Ctrl+C to stop.');
      await new Promise(resolve => { });
    } catch (error) {
      console.error("OrtoniReport: Error in onExit:", error);
    }
  }

  private registerPartial(name: string) {
    Handlebars.registerPartial(name, fs.readFileSync(
      path.resolve(__dirname, "views", name + ".hbs"),
      "utf-8"
    ));
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

  generateHTML(filteredResults: TestResultData[], totalDuration: string, cssContent: string) {
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
        path.resolve(__dirname, "views", "main.hbs"),
        "utf-8"
      );
      const template = Handlebars.compile(templateSource);
      const logo = this.config.logo
        ? path.resolve(this.config.logo)
        : undefined;

      const allTags = new Set();
      this.results.forEach(result => {
        result.testTags.forEach(tag => allTags.add(tag));
      });
      const projectResults = Array.from(this.projectSet).map((projectName) => {
        const projectTests = filteredResults.filter(r => r.projectName === projectName);
        const passedTests = projectTests.filter(r => r.status === "passed").length;
        const failedTests = projectTests.filter(r => r.status === "failed").length + projectTests.filter(r => r.status === "timedOut").length;
        const skippedTests = this.results.filter(r => r.projectName === projectName).filter(r => r.status === "skipped").length;
        const retryTests = this.results.filter(r => r.projectName === projectName).filter(r => r.status === "flaky").length;
        return {
          projectName: projectName,
          passedTests: passedTests,
          failedTests: failedTests,
          skippedTests: skippedTests,
          retryTests: retryTests,
          totalTests: projectTests.length
        };
      });
      const projectNames = projectResults.map(result => result.projectName);
      const projectTotalTests = projectResults.map(result => result.totalTests);
      const projectPassedTests = projectResults.map(result => result.passedTests);
      const projectailedTests = projectResults.map(result => result.failedTests);
      const projectSkippedTests = projectResults.map(result => result.skippedTests);
      const projectRetryTests = projectResults.map(result => result.retryTests);

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
        projectNames: projectNames,
        totalTests: projectTotalTests,
        passedTests: projectPassedTests,
        failedTests: projectailedTests,
        skippedTests: projectSkippedTests,
        retryTests: projectRetryTests
      };
      return template({ ...data, inlineCss: cssContent });
    } catch (error: any) {
      console.error("OrtoniReport: Error generating HTML:", error);
      return `<html><body><h1>Report generation failed</h1><pre>${error.stack}</pre></body></html>`;
    }
  }
}
export { OrtoniReport as default };
export { OrtoniReportConfig };