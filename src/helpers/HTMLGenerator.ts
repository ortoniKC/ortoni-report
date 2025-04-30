import path from "path";
import { TestResultData } from "../types/testResults";
import { groupResults } from "../utils/groupProjects";
import {
  formatDate,
  formatDateLocal,
  formatDateUTC,
  safeStringify,
} from "../utils/utils";
import fs from "fs";
import Handlebars from "handlebars";
import { OrtoniReportConfig } from "../types/reporterConfig";
import { DatabaseManager } from "./databaseManager";

export class HTMLGenerator {
  private ortoniConfig: OrtoniReportConfig;
  private dbManager: DatabaseManager;
  constructor(ortoniConfig: OrtoniReportConfig, dbManager: DatabaseManager) {
    this.ortoniConfig = ortoniConfig;
    this.registerHandlebarsHelpers();
    this.registerPartials();
    this.dbManager = dbManager;
  }

  async generateHTML(
    filteredResults: TestResultData[],
    totalDuration: string,
    cssContent: string,
    results: TestResultData[],
    projectSet: Set<string>
  ) {
    const data = await this.prepareReportData(
      filteredResults,
      totalDuration,
      results,
      projectSet
    );
    const templateSource = fs.readFileSync(
      path.resolve(__dirname, "views", "main.hbs"),
      "utf-8"
    );
    const template = Handlebars.compile(templateSource);
    return template({ ...data, inlineCss: cssContent });
  }

  async getReportData() {
    return {
      summary: await this.dbManager.getSummaryData(),
      trends: await this.dbManager.getTrends(),
      flakyTests: await this.dbManager.getFlakyTests(),
      slowTests: await this.dbManager.getSlowTests(),
    };
  }
  async chartTrendData() {
    return {
      labels: (await this.getReportData()).trends.map(t => t.run_date),
      passed: (await this.getReportData()).trends.map(t => t.passed),
      failed: (await this.getReportData()).trends.map(t => t.failed),
      avgDuration: (await this.getReportData()).trends.map(t => t.avg_duration),
    }
  };

  private async prepareReportData(
    filteredResults: TestResultData[],
    totalDuration: string,
    results: TestResultData[],
    projectSet: Set<string>
  ) {
    const totalTests = filteredResults.length;
    const passedTests = results.filter((r) => r.status === "passed").length;
    const flakyTests = results.filter((r) => r.status === "flaky").length;
    const failed = filteredResults.filter(
      (r) => r.status === "failed" || r.status === "timedOut"
    ).length;
    const successRate = (
      ((passedTests + flakyTests) / totalTests) *
      100
    ).toFixed(2);

    const allTags = new Set();
    results.forEach((result) =>
      result.testTags.forEach((tag) => allTags.add(tag))
    );

    const projectResults = this.calculateProjectResults(
      filteredResults,
      results,
      projectSet
    );
    const utcRunDate = formatDateUTC(new Date());
    const localRunDate = formatDateLocal(utcRunDate);
    const testHistories = await Promise.all(
      results.map(async (result) => {
        const testId = `${result.filePath}:${result.projectName}:${result.title}`;
        const history = await this.dbManager.getTestHistory(testId);
        return {
          testId: testId,
          history: history,
        };
      })
    );
    return {
      utcRunDate: utcRunDate,
      localRunDate: localRunDate,
      testHistories: testHistories,
      logo: this.ortoniConfig.logo || undefined,
      totalDuration: totalDuration,
      results: results,
      retryCount: results.filter((r) => r.isRetry).length,
      passCount: passedTests,
      failCount: failed,
      skipCount: results.filter((r) => r.status === "skipped").length,
      flakyCount: flakyTests,
      totalCount: filteredResults.length,
      groupedResults: groupResults(this.ortoniConfig, results),
      projectName: this.ortoniConfig.projectName,
      authorName: this.ortoniConfig.authorName,
      meta: this.ortoniConfig.meta,
      testType: this.ortoniConfig.testType,
      preferredTheme: this.ortoniConfig.preferredTheme,
      successRate: successRate,
      lastRunDate: formatDate(new Date()),
      projects: projectSet,
      allTags: Array.from(allTags),
      showProject: this.ortoniConfig.showProject || false,
      title: this.ortoniConfig.title || "Ortoni Playwright Test Report",
      chartType: this.ortoniConfig.chartType || "pie",
      reportAnalyticsData: await this.getReportData(),
      chartData: await this.chartTrendData(),
      ...this.extractProjectStats(projectResults),
    };
  }

  private calculateProjectResults(
    filteredResults: TestResultData[],
    results: TestResultData[],
    projectSet: Set<string>
  ) {
    return Array.from(projectSet).map((projectName) => {
      const projectTests = filteredResults.filter(
        (r) => r.projectName === projectName
      );
      const allProjectTests = results.filter(
        (r) => r.projectName === projectName
      );
      return {
        projectName,
        passedTests: projectTests.filter((r) => r.status === "passed").length,
        failedTests: projectTests.filter(
          (r) => r.status === "failed" || r.status === "timedOut"
        ).length,
        skippedTests: allProjectTests.filter((r) => r.status === "skipped")
          .length,
        retryTests: allProjectTests.filter((r) => r.isRetry).length,
        flakyTests: allProjectTests.filter((r) => r.status === "flaky").length,
        totalTests: projectTests.length,
      };
    });
  }

  private extractProjectStats(
    projectResults: ReturnType<HTMLGenerator["calculateProjectResults"]>
  ) {
    return {
      projectNames: projectResults.map((result) => result.projectName),
      totalTests: projectResults.map((result) => result.totalTests),
      passedTests: projectResults.map((result) => result.passedTests),
      failedTests: projectResults.map((result) => result.failedTests),
      skippedTests: projectResults.map((result) => result.skippedTests),
      retryTests: projectResults.map((result) => result.retryTests),
      flakyTests: projectResults.map((result) => result.flakyTests),
    };
  }

  private registerHandlebarsHelpers() {
    Handlebars.registerHelper("joinWithSpace", (array) => array.join(" "));
    Handlebars.registerHelper("json", (context) => safeStringify(context));
    Handlebars.registerHelper(
      "eq",
      (actualStatus, expectedStatus) => actualStatus === expectedStatus
    );
    Handlebars.registerHelper(
      "includes",
      (actualStatus: string, expectedStatus: string) =>
        actualStatus.includes(expectedStatus)
    );
    Handlebars.registerHelper("gr", (count) => count > 0);
    Handlebars.registerHelper("or", function (a, b) {
      return a || b;
    });
    Handlebars.registerHelper("concat", function (...args) {
      args.pop();
      return args.join("");
    });
  }

  private registerPartials() {
    [
      "head",
      "sidebar",
      "testPanel",
      "summaryCard",
      "userInfo",
      "project",
      "testStatus",
      "testIcons",
      "analytics",
    ].forEach((partialName) => {
      Handlebars.registerPartial(
        partialName,
        fs.readFileSync(
          path.resolve(__dirname, "views", `${partialName}.hbs`),
          "utf-8"
        )
      );
    });
  }
}
