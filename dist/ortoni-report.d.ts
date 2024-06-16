import { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

declare class OrtoniReport implements Reporter {
    private results;
    private groupedResults;
    private suiteName;
    constructor();
    onBegin(config: FullConfig, suite: Suite): void;
    onTestBegin(test: TestCase, result: TestResult): void;
    onTestEnd(test: TestCase, result: TestResult): void;
    onEnd(result: FullResult): void;
    generateHTML(): string;
}

export { OrtoniReport as default };
