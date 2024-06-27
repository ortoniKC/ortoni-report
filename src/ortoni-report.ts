import fs from 'fs';
import path from 'path';
import Handlebars from "handlebars";
import colors from 'colors/safe';
import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import  {OrtoniReportConfig}  from './types/reporterConfig';
import { TestResultData } from './types/testResults';
import { formatDate, msToTime, normalizeFilePath } from './utils/utils';

class OrtoniReport implements Reporter {
    private results: TestResultData[] = [];
    private groupedResults: any;
    private suiteName: string | undefined | TestCase[];
    private config: OrtoniReportConfig;

    constructor(config: OrtoniReportConfig = {}) {
        this.config = config;
    }
    onBegin(config: FullConfig, suite: Suite) {
        this.results = [];
    }

    onTestBegin(test: TestCase, result: TestResult) { }

    private projectSet = new Set<string>();
    onTestEnd(test: TestCase, result: TestResult) {
        let status: any = result.status;
        if (test.outcome() === 'flaky') {
            status = 'flaky';
        }
        this.projectSet.add(test.titlePath()[1]);
        const testResult: TestResultData = {
            retry: result.retry > 0 ? "retry": "",
            isRetry: result.retry,
            projectName: test.titlePath()[1],
            suite: test.titlePath()[3],
            title: test.title,
            status: status,
            flaky: test.outcome(),
            duration: result.duration.toString(),
            errors: result.errors.map(e => colors.strip(e.message || e.toString())),
            steps: result.steps.map(step => ({
                titlePath:step.titlePath,
                category: step.category,
                duration:step.duration,
                error:step.error,
                location:step.location,
                parent:step.parent,
                startTime:step.startTime,
                steps: step.steps,
                title: step.title,
            })),
            logs: colors.strip(result.stdout.concat(result.stderr).map(log => log).join('\n')),
            screenshotPath: null,
            filePath: normalizeFilePath(test.titlePath()[2]),
            projects: this.projectSet,
        };
        if (result.attachments) {
            const screenshot = result.attachments.find(attachment => attachment.name === 'screenshot');
            if (screenshot && screenshot.path) {
                const screenshotContent = fs.readFileSync(screenshot.path, 'base64');
                testResult.screenshotPath = screenshotContent;
            }
        }

        this.results.push(testResult);
    }
    onEnd(result: FullResult) {
        const filteredResults: TestResultData[] = this.results.filter(r => r.status !== 'skipped' && !r.isRetry);
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

        const html = this.generateHTML(filteredResults, totalDuration);
        const outputPath = path.resolve(process.cwd(), 'ortoni-report.html'); // Save in project root folder
        fs.writeFileSync(outputPath, html);
        console.log(`Ortoni HTML report generated at ${outputPath}`);
    }

    generateHTML(filteredResults: TestResultData[], totalDuration: string) {
        
        const totalTests = filteredResults.length;
        const passedTests = this.results.filter(r => r.status === 'passed').length;
        const flakyTests = this.results.filter(r => r.flaky === 'flaky').length;
        const failed = filteredResults.filter(r => r.status === 'failed' || r.status === 'timedOut').length
        const successRate: string = (((passedTests + flakyTests) / totalTests) * 100).toFixed(2);
        const templateSource = fs.readFileSync(path.resolve(__dirname, 'report-template.hbs'), 'utf-8');
        const template = Handlebars.compile(templateSource);
        const data = {
            totalDuration: totalDuration,
            suiteName: this.suiteName,
            results: this.results,
            retryCount: this.results.filter(r => r.isRetry).length,
            passCount: passedTests,
            failCount: failed,
            skipCount: this.results.filter(r => r.status === 'skipped').length,
            flakyCount: flakyTests,
            totalCount: filteredResults.length,
            groupedResults: this.groupedResults,
            projectName: this.config.projectName,
            authorName: this.config.authorName,
            testType: this.config.testType,
            preferredTheme: this.config.preferredTheme,
            successRate: successRate,
            lastRunDate: formatDate(new Date()),
            projects: this.projectSet,
        };
        return template(data);
    }
}

function safeStringify(obj: any, indent = 2) {
    const cache = new Set();
    const json = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
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

export { OrtoniReport as default };
export {OrtoniReportConfig}