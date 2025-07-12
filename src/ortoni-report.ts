import { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult, TestError } from "@playwright/test/reporter";
import { FileManager } from "./helpers/fileManager";
import { HTMLGenerator } from "./helpers/HTMLGenerator";
import { TestResultProcessor } from "./helpers/resultProcessor ";
import { ServerManager } from "./helpers/serverManager";
import { OrtoniReportConfig } from "./types/reporterConfig";
import { TestResultData } from "./types/testResults";
import { ensureHtmlExtension, isTraceDisabled, msToTime } from "./utils/utils";
import { DatabaseManager } from "./helpers/databaseManager";
import path from "path";
import { TraceMode } from "playwright/types/test";

export default class OrtoniReport implements Reporter {
  private testResultProcessor: TestResultProcessor;
  private htmlGenerator: HTMLGenerator;
  private fileManager: FileManager;
  private serverManager: ServerManager;
  private results: TestResultData[] = [];
  private projectSet = new Set<string>();
  private overAllStatus: "failed" | "passed" | "interrupted" | "timedout" | undefined;
  private folderPath: string;
  private outputFilename: string;
  private outputPath: string | undefined;
  private dbManager: DatabaseManager;
  private shouldGenerateReport: boolean = true;
  private showConsoleLogs: boolean | undefined = true;
  private skipTraceViewer: boolean = false;

  constructor(private ortoniConfig: OrtoniReportConfig = {}) {
    this.folderPath = ortoniConfig.folderPath || 'ortoni-report';
    this.outputFilename = ensureHtmlExtension(ortoniConfig.filename || "ortoni-report.html");
    this.dbManager = new DatabaseManager();
    this.htmlGenerator = new HTMLGenerator(ortoniConfig, this.dbManager);
    this.fileManager = new FileManager(this.folderPath);
    this.serverManager = new ServerManager(ortoniConfig);
    this.testResultProcessor = new TestResultProcessor("");
    this.showConsoleLogs = ortoniConfig.stdIO !== false;
  }

  private reportsCount: number = 0;

  async onBegin(config: FullConfig, _suite: Suite) {
    this.skipTraceViewer = config.projects.every(project => {
      const trace = project.use?.trace as TraceMode | undefined;
      return trace === undefined || trace === 'off';
    });
    this.reportsCount = config.reporter.length;
    this.results = [];
    this.testResultProcessor = new TestResultProcessor(config.rootDir);
    this.fileManager.ensureReportDirectory();
    await this.dbManager.initialize(path.join(this.folderPath, 'ortoni-data-history.sqlite'));
  }

  onStdOut(chunk: string | Buffer, _test: void | TestCase, _result: void | TestResult): void {
    if (this.reportsCount == 1 && this.showConsoleLogs) {
      console.log(chunk.toString().trim());
    }
  }
  onTestEnd(test: TestCase, result: TestResult) {
    try {
      const testResult = this.testResultProcessor.processTestResult(test, result, this.projectSet, this.ortoniConfig);
      this.results.push(testResult);
    } catch (error) {
      console.error("OrtoniReport: Error processing test end:", error);
    }
  }

  printsToStdio(): boolean {
    return true;
  }

  onError(error: TestError): void {
    if (error.location === undefined) {
      this.shouldGenerateReport = false;
    }
  }

  async onEnd(result: FullResult) {
    try {
      this.overAllStatus = result.status;
      if (this.shouldGenerateReport) {
        const filteredResults = this.results.filter((r) => r.status !== "skipped" && !r.isRetry);
        const totalDuration = msToTime(result.duration);
        const cssContent = this.fileManager.readCssContent();
        const runId = await this.dbManager.saveTestRun();
        if (runId !== null) {
          await this.dbManager.saveTestResults(runId, this.results);
          const html = await this.htmlGenerator.generateHTML(filteredResults, totalDuration, cssContent, this.results, this.projectSet);
          this.outputPath = this.fileManager.writeReportFile(this.outputFilename, html);
        } else {
          console.error("OrtoniReport: Error saving test run to database");
        }
      } else {
        console.error("OrtoniReport: Report generation skipped due to error in Playwright worker!");
      }
    } catch (error) {
      this.shouldGenerateReport = false;
      console.error("OrtoniReport: Error generating report:", error);
    }
  }

  async onExit() {
    try {
      await this.dbManager.close();
      if (this.shouldGenerateReport) {
        console.log(this.skipTraceViewer)
        this.fileManager.copyTraceViewerAssets(this.skipTraceViewer);
        console.info(`Ortoni HTML report generated at ${this.outputPath}`);
        this.serverManager.startServer(this.folderPath, this.outputFilename, this.overAllStatus);
        await new Promise(_resolve => { });
      }
    } catch (error) {
      console.error("OrtoniReport: Error in onExit:", error);
    }
  }
}

export { OrtoniReport };
export { OrtoniReportConfig };
