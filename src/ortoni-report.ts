import { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult } from "@playwright/test/reporter";
import { FileManager } from "./helpers/fileManager";
import { HTMLGenerator } from "./helpers/HTMLGenerator";
import { TestResultProcessor } from "./helpers/resultProcessor ";
import { ServerManager } from "./helpers/serverManager";
import { OrtoniReportConfig } from "./types/reporterConfig";
import { TestResultData } from "./types/testResults";
import { ensureHtmlExtension, msToTime } from "./utils/utils";
// import WebSocketHelper from "./helpers/webSockeManager";

export default class OrtoniReport implements Reporter {
  private testResultProcessor: TestResultProcessor;
  private htmlGenerator: HTMLGenerator;
  private fileManager: FileManager;
  private serverManager: ServerManager;
  // private wsHelper: WebSocketHelper;
  private results: TestResultData[] = [];
  private projectSet = new Set<string>();
  private overAllStatus: "failed" | "passed" | "interrupted" | "timedout" | undefined;
  private folderPath: string;
  private outputFilename: string;
  private outputPath: string | undefined;

  constructor(private ortoniConfig: OrtoniReportConfig = {}) {
    this.folderPath = ortoniConfig.folderPath || 'playwright-report';
    this.outputFilename = ensureHtmlExtension(ortoniConfig.filename || "ortoni-report.html");
    // this.wsHelper = new WebSocketHelper(4000);
    // this.wsHelper.setupWebSocket();
    // this.wsHelper.setupCleanup();
    this.htmlGenerator = new HTMLGenerator(ortoniConfig);
    this.fileManager = new FileManager(this.folderPath);
    this.serverManager = new ServerManager(ortoniConfig);
    this.testResultProcessor = new TestResultProcessor("");
  }

  onBegin(config: FullConfig, _suite: Suite) {
    this.results = [];
    this.testResultProcessor = new TestResultProcessor(config.rootDir);
    this.fileManager.ensureReportDirectory();
    // this.wsHelper.broadcastUpdate(this.results);
  }

  onTestBegin(_test: TestCase, _result: TestResult) {
    // this.wsHelper.broadcastUpdate(this.results);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    try {
      const testResult = this.testResultProcessor.processTestResult(test, result, this.projectSet, this.ortoniConfig);
      this.results.push(testResult);
      // this.wsHelper.broadcastUpdate(this.results);
    } catch (error) {
      console.error("OrtoniReport: Error processing test end:", error);
    }
  }

  onEnd(result: FullResult) {
    try {
      this.overAllStatus = result.status;
      const filteredResults = this.results.filter((r) => r.status !== "skipped" && !r.isRetry);
      const totalDuration = msToTime(result.duration);
      const cssContent = this.fileManager.readCssContent();

      const html = this.htmlGenerator.generateHTML(filteredResults, totalDuration, cssContent, this.results, this.projectSet);
      this.outputPath = this.fileManager.writeReportFile(this.outputFilename, html);
      // this.wsHelper.testComplete();
    } catch (error) {
      this.outputPath = undefined;
      console.error("OrtoniReport: Error generating report:", error);
    }
  }

  async onExit() {
    try {
      this.fileManager.copyTraceViewerAssets();

      if (this.outputPath) {
        console.log(`Ortoni HTML report generated at ${this.outputPath}`);
      }

      this.serverManager.startServer(this.folderPath, this.outputFilename, this.overAllStatus);
      await new Promise(_resolve => { });
    } catch (error) {
      console.error("OrtoniReport: Error in onExit:", error);
    }
  }
}

export { OrtoniReport };
export { OrtoniReportConfig };