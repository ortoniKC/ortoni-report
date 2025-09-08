import { TestResultData } from "../types/testResults";
import { groupResults } from "../utils/groupProjects";
import { OrtoniReportConfig } from "../types/reporterConfig";
import { DatabaseManager } from "./databaseManager";

export class HTMLGenerator {
  private ortoniConfig: OrtoniReportConfig;
  private dbManager: DatabaseManager;
  constructor(ortoniConfig: OrtoniReportConfig, dbManager: DatabaseManager) {
    this.ortoniConfig = ortoniConfig;
    this.dbManager = dbManager;
  }

  async generateFinalReport(
    filteredResults: TestResultData[],
    totalDuration: number,
    results: TestResultData[],
    projectSet: Set<string>
  ) {
    const data = await this.prepareReportData(
      filteredResults,
      totalDuration,
      results,
      projectSet
    );
    return data;
  }

  async getReportData() {
    return {
      summary: await this.dbManager.getSummaryData(),
      trends: await this.dbManager.getTrends(),
      flakyTests: await this.dbManager.getFlakyTests(),
      slowTests: await this.dbManager.getSlowTests(),
    };
  }

  private async prepareReportData(
    filteredResults: TestResultData[],
    totalDuration: number,
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
    const lastRunDate = new Date().toLocaleString();
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
      summary: {
        overAllResult: {
          pass: passedTests,
          fail: failed,
          skip: results.filter((r) => r.status === "skipped").length,
          retry: results.filter((r) => r.retryAttemptCount).length,
          flaky: flakyTests,
          total: filteredResults.length,
        },
        successRate,
        lastRunDate,
        totalDuration,
        stats: this.extractProjectStats(projectResults),
      },
      testResult: {
        tests: groupResults(this.ortoniConfig, results),
        testHistories,
        allTags: Array.from(allTags),
        set: projectSet,
      },
      userConfig: {
        projectName: this.ortoniConfig.projectName,
        authorName: this.ortoniConfig.authorName,
        type: this.ortoniConfig.testType,
        title: this.ortoniConfig.title,
      },
      userMeta: {
        meta: this.ortoniConfig.meta,
      },
      preferences: {
        logo: this.ortoniConfig.logo || undefined,
        showProject: this.ortoniConfig.showProject || false,
      },
      analytics: {
        reportData: await this.getReportData(),
      },
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
        retryTests: allProjectTests.filter((r) => r.retryAttemptCount).length,
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
}
