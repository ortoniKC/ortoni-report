import { TestStep, Reporter, FullConfig, Suite, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

interface OrtoniReportConfig {
    projectName?: string;
    authorName?: string;
    testType?: string;
    preferredTheme?: 'light' | 'dark';
}

interface TestResultData {
    retry: string;
    isRetry: number;
    projectName: any;
    suite: any;
    title: string;
    status: "passed" | "failed" | "timedOut" | "skipped" | "interrupted" | "expected" | "unexpected" | "flaky";
    flaky: string;
    duration: string;
    errors: any[];
    steps: TestStep[];
    logs: string;
    screenshotPath: string | null;
    filePath: any;
    projects: Set<string>;
}

declare class OrtoniReport implements Reporter {
    private results;
    private groupedResults;
    private suiteName;
    private config;
    constructor(config?: OrtoniReportConfig);
    onBegin(config: FullConfig, suite: Suite): void;
    onTestBegin(test: TestCase, result: TestResult): void;
    private projectSet;
    onTestEnd(test: TestCase, result: TestResult): void;
    onEnd(result: FullResult): void;
    generateHTML(filteredResults: TestResultData[], totalDuration: string): string;
}

export { OrtoniReportConfig, OrtoniReport as default };
