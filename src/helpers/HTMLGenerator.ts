import { TestResultData } from "../types/testResults";
import { groupResults } from "../utils/groupProjects";
import { OrtoniReportConfig } from "../types/reporterConfig";
import { formatDateLocal } from "../utils/utils";
import { DatabaseManager } from "./databaseManager";

export class HTMLGenerator {
  private ortoniConfig: OrtoniReportConfig;
  private dbManager?: DatabaseManager;

  constructor(ortoniConfig: OrtoniReportConfig, dbManager?: DatabaseManager) {
    this.ortoniConfig = ortoniConfig;
    this.dbManager = dbManager; // may be undefined in CI or when saveHistory=false
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

  /**
   * Return safe analytics/report data.
   * If no dbManager is provided, return empty defaults and a note explaining why.
   */
  async getReportData() {
    if (!this.dbManager) {
      return {
        summary: {},
        trends: {},
        flakyTests: [],
        slowTests: [],
        note: "Test history/trends are unavailable (saveHistory disabled or DB not initialized).",
      };
    }

    try {
      const [summary, trends, flakyTests, slowTests] = await Promise.all([
        this.dbManager.getSummaryData
          ? this.dbManager.getSummaryData()
          : Promise.resolve({}),
        this.dbManager.getTrends
          ? this.dbManager.getTrends()
          : Promise.resolve({}),
        this.dbManager.getFlakyTests
          ? this.dbManager.getFlakyTests()
          : Promise.resolve([]),
        this.dbManager.getSlowTests
          ? this.dbManager.getSlowTests()
          : Promise.resolve([]),
      ]);

      return {
        summary: summary ?? {},
        trends: trends ?? {},
        flakyTests: flakyTests ?? [],
        slowTests: slowTests ?? [],
      };
    } catch (err) {
      console.warn(
        "HTMLGenerator: failed to read analytics from DB, continuing without history.",
        err
      );
      return {
        summary: {},
        trends: {},
        flakyTests: [],
        slowTests: [],
        note: "Test history/trends could not be loaded due to a DB error.",
      };
    }
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
    const successRate =
      totalTests === 0
        ? "0.00"
        : (((passedTests + flakyTests) / totalTests) * 100).toFixed(2);

    const allTags = new Set<string>();
    results.forEach((result) =>
      (result.testTags || []).forEach((tag) => allTags.add(tag))
    );

    const projectResults = this.calculateProjectResults(
      filteredResults,
      results,
      projectSet
    );
    const lastRunDate = formatDateLocal(new Date());

    // Fetch per-test histories only if DB manager exists; otherwise return empty history arrays.
    const testHistories = await Promise.all(
      results.map(async (result) => {
        const testId = `${result.filePath}:${result.projectName}:${result.title}`;
        if (!this.dbManager || !this.dbManager.getTestHistory) {
          return {
            testId,
            history: [],
          };
        }
        try {
          const history = await this.dbManager.getTestHistory(testId);
          return {
            testId,
            history: history ?? [],
          };
        } catch (err) {
          // If a single test history fails, return empty history for that test and continue
          console.warn(
            `HTMLGenerator: failed to read history for ${testId}`,
            err
          );
          return {
            testId,
            history: [],
          };
        }
      })
    );

    // Fetch analytics/reportData using the safe getter (this will handle missing DB)
    const reportData = await this.getReportData();

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
        reportData: reportData,
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
