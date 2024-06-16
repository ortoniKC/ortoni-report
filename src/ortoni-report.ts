import fs from 'fs';
import path from 'path';
import Handlebars from "handlebars";
import colors from 'colors/safe';

import type {
    FullConfig, FullResult, Reporter, Suite, TestCase, TestResult
} from '@playwright/test/reporter';

interface TestResultData {
    projectName: any;
    suite: any;
    title: string;
    status: string;
    duration: number;
    errors: any[];
    steps: any[];
    logs: string;
    screenshotPath: string | null;
    filePath: any;
}
class OrtoniReport implements Reporter {
    private results: TestResultData[] = [];
    private groupedResults: any;
    private suiteName: string | undefined | TestCase[];
    constructor(){}

    onBegin(config: FullConfig, suite: Suite) {

        this.results = [];
        const screenshotsDir = path.join(process.cwd(), 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir);
        }
    }

    onTestBegin(test: TestCase, result: TestResult) {
    }

    onTestEnd(test: TestCase, result: TestResult) {

        const testResult: TestResultData = {
            projectName: test.titlePath()[1], // Get the project name
            suite: test.titlePath()[3], // Adjust the index based on your suite hierarchy
            title: test.title,
            status: result.status,
            duration: result.duration,
            errors: result.errors.map(e => colors.strip(e.message || e.toString())),
            steps: result.steps.map(step => ({
                title: step.title,
                category: step.category,
                duration: step.duration,
                status: result.status
            })),
            logs: colors.strip(result.stdout.concat(result.stderr).map(log => log).join('\n')),
            screenshotPath: null,
            filePath: test.titlePath()[2]
        };

        if (result.attachments) {
            const screenshotsDir = path.join(process.cwd(), 'screenshots\\' + test.id);
            if (!fs.existsSync(screenshotsDir)) {
                fs.mkdirSync(screenshotsDir);
            }
            const screenshot = result.attachments.find(attachment => attachment.name === 'screenshot');
            if (screenshot && screenshot.path) {
                const screenshotContent = fs.readFileSync(screenshot.path, 'base64');
                const screenshotFileName = `screenshots/${test.id}/${path.basename(screenshot.path)}`;
                fs.writeFileSync(path.join(process.cwd(), screenshotFileName), screenshotContent, 'base64');
                testResult.screenshotPath = screenshotFileName;
            }
        }

        this.results.push(testResult);
    }

    onEnd(result: FullResult) {
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


        // Register the json helper
        Handlebars.registerHelper('json', function (context) {
            return safeStringify(context);
        });
        Handlebars.registerHelper('splitSuiteName', function (suiteName) {
            return suiteName.split(' - ');
        });
        const html = this.generateHTML();
        const outputPath = path.join(process.cwd(), 'ortoni-report.html');
        fs.writeFileSync(outputPath, html);
        console.log(`Ortoni HTML report generated at ${outputPath}`);
    }
    generateHTML() {
        const templateSource = fs.readFileSync(path.join(__dirname, 'report-template.hbs'), 'utf-8');
        const template = Handlebars.compile(templateSource);
        const data = {
            suiteName: this.suiteName,
            results: this.results,
            passCount: this.results.filter(r => r.status === 'passed').length,
            failCount: this.results.filter(r => r.status === 'failed').length,
            skipCount: this.results.filter(r => r.status === 'skipped').length,
            retryCount: this.results.filter(r => r.status === 'retry').length,
            totalCount: this.results.length,
            groupedResults: this.groupedResults
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