// src/ortoni-report.ts
import fs from "fs";
import path2 from "path";
import Handlebars from "handlebars";
import colors from "colors/safe";

// src/utils/utils.ts
import path from "path";
function msToTime(duration) {
  const milliseconds = Math.floor(duration % 1e3);
  const seconds = Math.floor(duration / 1e3 % 60);
  const minutes = Math.floor(duration / (1e3 * 60) % 60);
  const hours = Math.floor(duration / (1e3 * 60 * 60) % 24);
  let result = "";
  if (hours > 0) {
    result += `${hours}h:`;
  }
  if (minutes > 0 || hours > 0) {
    result += `${minutes < 10 ? "0" + minutes : minutes}m:`;
  }
  if (seconds > 0 || minutes > 0 || hours > 0) {
    result += `${seconds < 10 ? "0" + seconds : seconds}s`;
  }
  if (milliseconds > 0 && !(seconds > 0 || minutes > 0 || hours > 0)) {
    result += `${milliseconds}ms`;
  } else if (milliseconds > 0) {
    result += `:${milliseconds < 100 ? "0" + milliseconds : milliseconds}ms`;
  }
  return result;
}
function normalizeFilePath(filePath) {
  const normalizedPath = path.normalize(filePath);
  return path.basename(normalizedPath);
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
    this.projectSet = /* @__PURE__ */ new Set();
    this.config = config;
  }
  onBegin(config, suite) {
    this.results = [];
  }
  onTestBegin(test, result) {
  }
  onTestEnd(test, result) {
    let status = result.status;
    if (test.outcome() === "flaky") {
      status = "flaky";
    }
    this.projectSet.add(test.titlePath()[1]);
    const testResult = {
      retry: result.retry > 0 ? "retry" : "",
      isRetry: result.retry,
      projectName: test.titlePath()[1],
      suite: test.titlePath()[3],
      title: test.title,
      status,
      flaky: test.outcome(),
      duration: msToTime(result.duration),
      errors: result.errors.map((e) => colors.strip(e.message || e.toString())),
      steps: result.steps.map((step) => ({
        titlePath: step.titlePath,
        category: step.category,
        duration: step.duration,
        error: step.error,
        location: step.location,
        parent: step.parent,
        startTime: step.startTime,
        steps: step.steps,
        title: step.title
      })),
      logs: colors.strip(result.stdout.concat(result.stderr).map((log) => log).join("\n")),
      screenshotPath: null,
      filePath: normalizeFilePath(test.titlePath()[2]),
      projects: this.projectSet
    };
    if (result.attachments) {
      const screenshot = result.attachments.find((attachment) => attachment.name === "screenshot");
      if (screenshot && screenshot.path) {
        const screenshotContent = fs.readFileSync(screenshot.path, "base64");
        testResult.screenshotPath = screenshotContent;
      }
    }
    this.results.push(testResult);
  }
  onEnd(result) {
    const filteredResults = this.results.filter((r) => r.status !== "skipped" && !r.isRetry);
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
    Handlebars.registerHelper("json", function(context) {
      return safeStringify(context);
    });
    Handlebars.registerHelper("eq", function(actualStatus, expectedStatus) {
      return actualStatus === expectedStatus;
    });
    Handlebars.registerHelper("or", () => {
      var args = Array.prototype.slice.call(arguments);
      var options = args.pop();
      for (var i = 0; i < args.length; i++) {
        if (args[i]) {
          return options.fn(this);
        }
      }
      return options.inverse(this);
    });
    Handlebars.registerHelper("gt", function(a, b) {
      return a > b;
    });
    const html = this.generateHTML(filteredResults, totalDuration);
    const outputPath = path2.resolve(process.cwd(), "ortoni-report.html");
    fs.writeFileSync(outputPath, html);
    console.log(`Ortoni HTML report generated at ${outputPath}`);
  }
  generateHTML(filteredResults, totalDuration) {
    const totalTests = filteredResults.length;
    const passedTests = this.results.filter((r) => r.status === "passed").length;
    const flakyTests = this.results.filter((r) => r.flaky === "flaky").length;
    const failed = filteredResults.filter((r) => r.status === "failed" || r.status === "timedOut").length;
    const successRate = ((passedTests + flakyTests) / totalTests * 100).toFixed(2);
    const templateSource = fs.readFileSync(path2.resolve(__dirname, "report-template.hbs"), "utf-8");
    const template = Handlebars.compile(templateSource);
    const data = {
      totalDuration,
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
      successRate,
      lastRunDate: formatDate(/* @__PURE__ */ new Date()),
      projects: this.projectSet
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
export {
  OrtoniReport as default
};
