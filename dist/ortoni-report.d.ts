import { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

interface ReporterConfig {
    projectName?: string;
    authorName?: string;
    testType?: string;
}

declare class OrtoniReport implements Reporter {
    private results;
    private groupedResults;
    private suiteName;
    private config;
    constructor(config?: ReporterConfig);
    onBegin(config: FullConfig, suite: Suite): void;
    onTestBegin(test: TestCase, result: TestResult): void;
    onTestEnd(test: TestCase, result: TestResult): void;
    private _successRate;
    onEnd(result: FullResult): void;
    generateHTML(): string;
}

export { OrtoniReport as default };
