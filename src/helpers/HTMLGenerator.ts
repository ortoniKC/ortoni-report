import path from "path";
import { TestResultData } from "../types/testResults";
import { groupResults } from "../utils/groupProjects";
import { formatDate, safeStringify } from "../utils/utils";
import fs from "fs";
import Handlebars from "handlebars";
import { OrtoniReportConfig } from "../types/reporterConfig";

export class HTMLGenerator {
  private ortoniConfig: OrtoniReportConfig;

  constructor(ortoniConfig: OrtoniReportConfig) {
    this.ortoniConfig = ortoniConfig;
    this.registerHandlebarsHelpers();
    this.registerPartials();
  }

  generateHTML(filteredResults: TestResultData[], totalDuration: string, cssContent: string, results: TestResultData[], projectSet: Set<string>) {
    const data = this.prepareReportData(filteredResults, totalDuration, results, projectSet);
    const templateSource = fs.readFileSync(path.resolve(__dirname, "views", "main.hbs"), "utf-8");
    const template = Handlebars.compile(templateSource);
    return template({ ...data, inlineCss: cssContent });
  }

  private prepareReportData(filteredResults: TestResultData[], totalDuration: string, results: TestResultData[], projectSet: Set<string>) {
    const totalTests = filteredResults.length;
    const passedTests = results.filter((r) => r.status === "passed").length;
    const flakyTests = results.filter((r) => r.flaky === "flaky").length;
    const failed = filteredResults.filter((r) => r.status === "failed" || r.status === "timedOut").length;
    const successRate = (((passedTests + flakyTests) / totalTests) * 100).toFixed(2);

    const allTags = new Set();
    results.forEach(result => result.testTags.forEach(tag => allTags.add(tag)));

    const projectResults = this.calculateProjectResults(filteredResults, results, projectSet);

    return {
      logo: this.ortoniConfig.logo ? path.resolve(this.ortoniConfig.logo) : undefined,
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
      testType: this.ortoniConfig.testType,
      preferredTheme: this.ortoniConfig.preferredTheme,
      successRate: successRate,
      lastRunDate: formatDate(new Date()),
      projects: projectSet,
      allTags: Array.from(allTags),
      showProject: this.ortoniConfig.showProject || false,
      title: this.ortoniConfig.title || "Ortoni Playwright Test Report",
      ...this.extractProjectStats(projectResults)
    };
  }

  private calculateProjectResults(filteredResults: TestResultData[], results: TestResultData[], projectSet: Set<string>) {
    return Array.from(projectSet).map((projectName) => {
      const projectTests = filteredResults.filter(r => r.projectName === projectName);
      const allProjectTests = results.filter(r => r.projectName === projectName);
      return {
        projectName,
        passedTests: projectTests.filter(r => r.status === "passed").length,
        failedTests: projectTests.filter(r => r.status === "failed" || r.status === "timedOut").length,
        skippedTests: allProjectTests.filter(r => r.status === "skipped").length,
        retryTests: allProjectTests.filter(r => r.status === "flaky").length,
        totalTests: projectTests.length
      };
    });
  }

  private extractProjectStats(projectResults: ReturnType<HTMLGenerator['calculateProjectResults']>) {
    return {
      projectNames: projectResults.map(result => result.projectName),
      totalTests: projectResults.map(result => result.totalTests),
      passedTests: projectResults.map(result => result.passedTests),
      failedTests: projectResults.map(result => result.failedTests),
      skippedTests: projectResults.map(result => result.skippedTests),
      retryTests: projectResults.map(result => result.retryTests)
    };
  }

  private registerHandlebarsHelpers() {
    Handlebars.registerHelper('joinWithSpace', (array) => array.join(' '));
    Handlebars.registerHelper("json", (context) => safeStringify(context));
    Handlebars.registerHelper("eq", (actualStatus, expectedStatus) => actualStatus === expectedStatus);
    Handlebars.registerHelper("gr", (count) => count > 0);
  }

  private registerPartials() {
    ['navbar', 'testStatus', 'testPanel', 'summaryCard', 'userInfo', 'project'].forEach(partialName => {
      Handlebars.registerPartial(partialName, fs.readFileSync(
        path.resolve(__dirname, "views", `${partialName}.hbs`),
        "utf-8"
      ));
    });
  }
}