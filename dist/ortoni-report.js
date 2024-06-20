"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/ortoni-report.ts
var ortoni_report_exports = {};
__export(ortoni_report_exports, {
  default: () => ortoni_report_default
});
module.exports = __toCommonJS(ortoni_report_exports);
var import_fs = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
var import_handlebars = __toESM(require("handlebars"));
var import_safe = __toESM(require("colors/safe"));

// src/utils/utils.ts
var import_path = __toESM(require("path"));
function msToTime(duration) {
  const milliseconds = Math.floor(duration % 1e3);
  const seconds = Math.floor(duration / 1e3 % 60);
  const minutes = Math.floor(duration / (1e3 * 60) % 60);
  const hours = Math.floor(duration / (1e3 * 60 * 60) % 24);
  const hoursStr = hours < 10 ? "0" + hours : hours;
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;
  const secondsStr = seconds < 10 ? "0" + seconds : seconds;
  const millisecondsStr = milliseconds < 100 ? "0" + milliseconds : milliseconds;
  return `${hoursStr}:${minutesStr}:${secondsStr}.${millisecondsStr}`;
}
function normalizeFilePath(filePath) {
  const normalizedPath = import_path.default.normalize(filePath);
  return import_path.default.basename(normalizedPath);
}
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString();
  return `${day}-${month}-${year} ${time}`;
}

// src/ortoni-report.ts
var OrtoniReport = class {
  constructor(config = {}) {
    this.results = [];
    this.config = config;
  }
  onBegin(config, suite) {
    this.results = [];
    const screenshotsDir = import_path2.default.resolve(process.cwd(), "screenshots");
    if (import_fs.default.existsSync(screenshotsDir)) {
      import_fs.default.rmSync(screenshotsDir, { recursive: true, force: true });
    }
    import_fs.default.mkdirSync(screenshotsDir, { recursive: true });
  }
  onTestBegin(test, result) {
  }
  onTestEnd(test, result) {
    let status = result.status;
    if (test.outcome() === "flaky") {
      status = "flaky";
    }
    const testResult = {
      isRetry: result.retry,
      projectName: test.titlePath()[1],
      // Get the project name
      suite: test.titlePath()[3],
      // Adjust the index based on your suite hierarchy
      title: test.title,
      status,
      flaky: test.outcome(),
      duration: msToTime(result.duration),
      errors: result.errors.map((e) => import_safe.default.strip(e.message || e.toString())),
      steps: result.steps.map((step) => ({
        title: step.title,
        category: step.category,
        duration: step.duration,
        status: result.status
      })),
      logs: import_safe.default.strip(result.stdout.concat(result.stderr).map((log) => log).join("\n")),
      screenshotPath: null,
      filePath: normalizeFilePath(test.titlePath()[2])
    };
    if (result.attachments) {
      const screenshotsDir = import_path2.default.resolve(process.cwd(), "screenshots", test.id);
      if (!import_fs.default.existsSync(screenshotsDir)) {
        import_fs.default.mkdirSync(screenshotsDir, { recursive: true });
      }
      const screenshot = result.attachments.find((attachment) => attachment.name === "screenshot");
      if (screenshot && screenshot.path) {
        const screenshotContent = import_fs.default.readFileSync(screenshot.path, "base64");
        const screenshotFileName = import_path2.default.join("screenshots", test.id, import_path2.default.basename(screenshot.path));
        import_fs.default.writeFileSync(import_path2.default.resolve(process.cwd(), screenshotFileName), screenshotContent, "base64");
        testResult.screenshotPath = screenshotFileName;
      }
    }
    this.results.push(testResult);
  }
  onEnd(result) {
    const filteredResults = this.results.filter((r) => r.status !== "skipped" && !r.isRetry);
    const successRate = (filteredResults.filter((r) => r.status === "passed").length / filteredResults.length * 100).toFixed(2);
    const totalDuration = msToTime(result.duration);
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
    import_handlebars.default.registerHelper("json", function(context) {
      return safeStringify(context);
    });
    import_handlebars.default.registerHelper("eq", function(actualStatus, expectedStatus) {
      return actualStatus === expectedStatus;
    });
    import_handlebars.default.registerHelper("or", () => {
      var args = Array.prototype.slice.call(arguments);
      var options = args.pop();
      for (var i = 0; i < args.length; i++) {
        if (args[i]) {
          return options.fn(this);
        }
      }
      return options.inverse(this);
    });
    import_handlebars.default.registerHelper("gt", function(a, b) {
      return a > b;
    });
    const html = this.generateHTML(filteredResults, totalDuration, successRate);
    const outputPath = import_path2.default.resolve(process.cwd(), "ortoni-report.html");
    import_fs.default.writeFileSync(outputPath, html);
    console.log(`Ortoni HTML report generated at ${outputPath}`);
  }
  generateHTML(filteredResults, totalDuration, successRate) {
    const templateSource = import_fs.default.readFileSync(import_path2.default.resolve(__dirname, "report-template.hbs"), "utf-8");
    const template = import_handlebars.default.compile(templateSource);
    const data = {
      totalDuration,
      suiteName: this.suiteName,
      results: this.results,
      retryCount: this.results.filter((r) => r.isRetry).length,
      passCount: this.results.filter((r) => r.status === "passed").length,
      failCount: filteredResults.filter((r) => r.status === "failed" || r.status === "timedOut").length,
      skipCount: this.results.filter((r) => r.status === "skipped").length,
      flakyCount: this.results.filter((r) => r.flaky === "flaky").length,
      totalCount: filteredResults.length,
      groupedResults: this.groupedResults,
      projectName: this.config.projectName,
      authorName: this.config.authorName,
      testType: this.config.testType,
      successRate,
      lastRunDate: formatDate(/* @__PURE__ */ new Date())
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
