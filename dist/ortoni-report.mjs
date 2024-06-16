// src/ortoni-report.ts
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import colors from "colors/safe";
var OrtoniReport = class {
  constructor() {
    this.results = [];
  }
  onBegin(config, suite) {
    this.results = [];
    const screenshotsDir = path.join(process.cwd(), "screenshots");
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }
  }
  onTestBegin(test, result) {
  }
  onTestEnd(test, result) {
    const testResult = {
      projectName: test.titlePath()[1],
      // Get the project name
      suite: test.titlePath()[3],
      // Adjust the index based on your suite hierarchy
      title: test.title,
      status: result.status,
      duration: result.duration,
      errors: result.errors.map((e) => colors.strip(e.message || e.toString())),
      steps: result.steps.map((step) => ({
        title: step.title,
        category: step.category,
        duration: step.duration,
        status: result.status
      })),
      logs: colors.strip(result.stdout.concat(result.stderr).map((log) => log).join("\n")),
      screenshotPath: null,
      filePath: test.titlePath()[2]
    };
    if (result.attachments) {
      const screenshotsDir = path.join(process.cwd(), "screenshots\\" + test.id);
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
      }
      const screenshot = result.attachments.find((attachment) => attachment.name === "screenshot");
      if (screenshot && screenshot.path) {
        const screenshotContent = fs.readFileSync(screenshot.path, "base64");
        const screenshotFileName = `screenshots/${test.id}/${path.basename(screenshot.path)}`;
        fs.writeFileSync(path.join(process.cwd(), screenshotFileName), screenshotContent, "base64");
        testResult.screenshotPath = screenshotFileName;
      }
    }
    this.results.push(testResult);
  }
  onEnd(result) {
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
    Handlebars.registerHelper("splitSuiteName", function(suiteName) {
      return suiteName.split(" - ");
    });
    const html = this.generateHTML();
    const outputPath = path.join(process.cwd(), "ortoni-report.html");
    fs.writeFileSync(outputPath, html);
    console.log(`Ortoni HTML report generated at ${outputPath}`);
  }
  generateHTML() {
    const templateSource = fs.readFileSync(path.join(__dirname, "report-template.hbs"), "utf-8");
    const template = Handlebars.compile(templateSource);
    const data = {
      suiteName: this.suiteName,
      results: this.results,
      passCount: this.results.filter((r) => r.status === "passed").length,
      failCount: this.results.filter((r) => r.status === "failed").length,
      skipCount: this.results.filter((r) => r.status === "skipped").length,
      retryCount: this.results.filter((r) => r.status === "retry").length,
      totalCount: this.results.length,
      groupedResults: this.groupedResults
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
