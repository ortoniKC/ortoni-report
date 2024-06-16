// src/ortoni-report.ts
import fs from "fs";
import path2 from "path";
import Handlebars from "handlebars";
import colors from "colors/safe";

// src/utils/time.ts
import path from "path";
function msToTime(duration) {
  const seconds = Math.floor(duration / 1e3 % 60);
  const minutes = Math.floor(duration / (1e3 * 60) % 60);
  const hours = Math.floor(duration / (1e3 * 60 * 60) % 24);
  const parts = [];
  if (hours > 0)
    parts.push(hours + "h");
  if (minutes > 0)
    parts.push(minutes + "m");
  if (seconds > 0 || parts.length === 0)
    parts.push(seconds + "s");
  return parts.join(" ");
}
function normalizeFilePath(filePath) {
  const normalizedPath = path.normalize(filePath);
  return path.basename(normalizedPath);
}

// src/ortoni-report.ts
var OrtoniReport = class {
  constructor(config = {}) {
    this.results = [];
    this.config = config;
  }
  onBegin(config, suite) {
    this.results = [];
    const screenshotsDir = path2.resolve(process.cwd(), "screenshots");
    if (fs.existsSync(screenshotsDir)) {
      fs.rmSync(screenshotsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  onTestBegin(test, result) {
  }
  onTestEnd(test, result) {
    const testResult = {
      totalDuration: "",
      projectName: test.titlePath()[1],
      // Get the project name
      suite: test.titlePath()[3],
      // Adjust the index based on your suite hierarchy
      title: test.title,
      status: result.status,
      flaky: test.outcome(),
      duration: msToTime(result.duration),
      errors: result.errors.map((e) => colors.strip(e.message || e.toString())),
      steps: result.steps.map((step) => ({
        title: step.title,
        category: step.category,
        duration: step.duration,
        status: result.status
      })),
      logs: colors.strip(result.stdout.concat(result.stderr).map((log) => log).join("\n")),
      screenshotPath: null,
      filePath: normalizeFilePath(test.titlePath()[2])
    };
    if (result.attachments) {
      const screenshotsDir = path2.resolve(process.cwd(), "screenshots", test.id);
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }
      const screenshot = result.attachments.find((attachment) => attachment.name === "screenshot");
      if (screenshot && screenshot.path) {
        const screenshotContent = fs.readFileSync(screenshot.path, "base64");
        const screenshotFileName = path2.join("screenshots", test.id, path2.basename(screenshot.path));
        fs.writeFileSync(path2.resolve(process.cwd(), screenshotFileName), screenshotContent, "base64");
        testResult.screenshotPath = screenshotFileName;
      }
    }
    this.results.push(testResult);
  }
  onEnd(result) {
    this.results[0].totalDuration = msToTime(result.duration);
    this.groupedResults = this.results.reduce((acc, result2, index) => {
      const filePath = result2.filePath;
      const suiteName = result2.suite;
      const projectName = result2.projectName;
      if (!acc[filePath]) {
        acc[filePath] = {};
      }
      if (!acc[filePath][suiteName]) {
        acc[filePath][suiteName] = {};
      }
      if (!acc[filePath][suiteName][projectName]) {
        acc[filePath][suiteName][projectName] = [];
      }
      acc[filePath][suiteName][projectName].push({ ...result2, index });
      return acc;
    }, {});
    Handlebars.registerHelper("json", function(context) {
      return safeStringify(context);
    });
    const html = this.generateHTML();
    const outputPath = path2.resolve(process.cwd(), "ortoni-report.html");
    fs.writeFileSync(outputPath, html);
    console.log(`Ortoni HTML report generated at ${outputPath}`);
  }
  generateHTML() {
    const templateSource = fs.readFileSync(path2.resolve(__dirname, "report-template.hbs"), "utf-8");
    const template = Handlebars.compile(templateSource);
    const data = {
      totalDuration: this.results[0].totalDuration,
      suiteName: this.suiteName,
      results: this.results,
      passCount: this.results.filter((r) => r.status === "passed").length,
      failCount: this.results.filter((r) => r.status === "failed").length,
      skipCount: this.results.filter((r) => r.status === "skipped").length,
      flakyCount: this.results.filter((r) => r.flaky === "flaky").length,
      totalCount: this.results.length,
      groupedResults: this.groupedResults,
      projectName: this.config.projectName,
      // Include project name
      authorName: this.config.authorName,
      // Include author name
      testType: this.config.testType
      // Include test type
    };
    return template(data);
  }
};
function safeStringify(obj, indent = 2) {
  const cache = /* @__PURE__ */ new Set();
  const json = JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (cache.has(value)) {
        return;
      }
      cache.add(value);
    }
    return value;
  }, indent);
  cache.clear();
  return json;
}
var ortoni_report_default = OrtoniReport;
export {
  ortoni_report_default as default
};
