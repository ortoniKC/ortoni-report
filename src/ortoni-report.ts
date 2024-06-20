import fs from 'fs';
import path from 'path';
import Handlebars from "handlebars";
import colors from 'colors/safe';
import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { ReporterConfig } from './types/reporterConfig';
import { TestResultData } from './types/testResults';
import { formatDate, msToTime, normalizeFilePath } from './utils/utils';

class OrtoniReport implements Reporter {
    private results: TestResultData[] = [];
    private groupedResults: any;
    private suiteName: string | undefined | TestCase[];
    private config: ReporterConfig;

    constructor(config: ReporterConfig = {}) {
        this.config = config;
    }
    onBegin(config: FullConfig, suite: Suite) {
        this.results = [];
        const screenshotsDir = path.resolve(process.cwd(), 'screenshots');
        if (fs.existsSync(screenshotsDir)) {
            fs.rmSync(screenshotsDir, { recursive: true, force: true });
        }
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    onTestBegin(test: TestCase, result: TestResult) { }

    onTestEnd(test: TestCase, result: TestResult) {
        let status: any = result.status;
        if (test.outcome() === 'flaky') {
            status = 'flaky';
        }
        
        const testResult: TestResultData = {
            isRetry: result.retry,
            projectName: test.titlePath()[1], // Get the project name
            suite: test.titlePath()[3], // Adjust the index based on your suite hierarchy
            title: test.title,
            status: status,
            flaky: test.outcome(),
            duration: msToTime(result.duration),
            errors: result.errors.map(e => colors.strip(e.message || e.toString())),
            steps: result.steps.map(step => ({
                title: step.title,
                category: step.category,
                duration: step.duration,
                status: result.status
            })),
            logs: colors.strip(result.stdout.concat(result.stderr).map(log => log).join('\n')),
            screenshotPath: null,
            filePath: normalizeFilePath(test.titlePath()[2]),
        };

        if (result.attachments) {
            const screenshotsDir = path.resolve(process.cwd(), 'screenshots', test.id);
            if (!fs.existsSync(screenshotsDir)) {
                fs.mkdirSync(screenshotsDir, { recursive: true });
            }
            const screenshot = result.attachments.find(attachment => attachment.name === 'screenshot');
            if (screenshot && screenshot.path) {
                const screenshotContent = fs.readFileSync(screenshot.path, 'base64');
                const screenshotFileName = path.join('screenshots', test.id, path.basename(screenshot.path));
                fs.writeFileSync(path.resolve(process.cwd(), screenshotFileName), screenshotContent, 'base64');
                testResult.screenshotPath = screenshotFileName;
            }
        }

        this.results.push(testResult);
    }
    onEnd(result: FullResult) {
        const filteredResults: TestResultData[] = this.results.filter(r => r.status !== 'skipped' && !r.isRetry);
        const successRate: string = ((filteredResults.filter(r => r.status === 'passed').length / filteredResults.length) * 100).toFixed(2);
        const totalDuration = msToTime(result.duration);
        this.groupedResults = this.results.reduce((acc: any, result, index) => {
            const filePath = result.filePath;
            const suiteName = result.suite;
            const projectName = result.projectName;
            if (!acc[filePath]) {
                acc[filePath] = {};
            }
            if (!acc[filePath][suiteName]) {
                acc[filePath][suiteName] = {};
            }
            if (!acc[filePath][suiteName][projectName]) {
                acc[filePath][suiteName][projectName] = [];
            }
            acc[filePath][suiteName][projectName].push({ ...result, index });
            return acc;
        }, {});

        // Register HBS hadler
        Handlebars.registerHelper('json', function (context) {
            return safeStringify(context);
        });
        Handlebars.registerHelper('eq', function (actualStatus, expectedStatus) {
            return actualStatus === expectedStatus
        });
        Handlebars.registerHelper('or', () => {
            var args = Array.prototype.slice.call(arguments);
            var options = args.pop();

            for (var i = 0; i < args.length; i++) {
                if (args[i]) {
                    return options.fn(this);
                }
            }

            return options.inverse(this);
        });
        Handlebars.registerHelper('gt', function (a, b) {
            return a > b;
        });


        const html = this.generateHTML(filteredResults, totalDuration, successRate);
        const outputPath = path.resolve(process.cwd(), 'ortoni-report.html'); // Save in project root folder
        fs.writeFileSync(outputPath, html);
        console.log(`Ortoni HTML report generated at ${outputPath}`);
    }

    generateHTML(filteredResults: TestResultData[], totalDuration: string, successRate: string) {
        const templateSource = fs.readFileSync(path.resolve(__dirname, 'report-template.hbs'), 'utf-8');
        const template = Handlebars.compile(templateSource);
        // const nonRetryFailedResults = filteredResults.filter(r => r.status === 'failed' || r.status === 'timedOut');
        const data = {
            totalDuration: totalDuration,
            suiteName: this.suiteName,
            results: this.results,
            retryCount: this.results.filter(r => r.isRetry).length,
            passCount: this.results.filter(r => r.status === 'passed').length,
            failCount: filteredResults.filter(r => r.status === 'failed' || r.status === 'timedOut').length,
            skipCount: this.results.filter(r => r.status === 'skipped').length,
            flakyCount: this.results.filter(r => r.flaky === 'flaky').length,
            totalCount: filteredResults.length,
            groupedResults: this.groupedResults,
            projectName: this.config.projectName,
            authorName: this.config.authorName,
            testType: this.config.testType,
            successRate: successRate,
            lastRunDate: formatDate(new Date())
        };
        return template(data);
    }
}

// Utility function to remove circular references
function safeStringify(obj: any, indent = 2) {
    const cache = new Set();
    const json = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our set
            cache.add(value);
        }
        return value;
    }, indent);
    cache.clear();
    return json;
}

export default OrtoniReport;