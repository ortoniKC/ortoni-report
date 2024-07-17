import { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

interface OrtoniReportConfig {
    projectName?: string;
    authorName?: string;
    testType?: string;
    preferredTheme?: 'light' | 'dark';
    base64Image?: boolean;
}

interface Steps {
    snippet: string | undefined;
    title: string;
    location: string;
}
interface TestResultData {
    suiteTags: string[];
    testTags: string[];
    location: string;
    retry: string;
    isRetry: number;
    projectName: any;
    suite: any;
    title: string;
    status: "passed" | "failed" | "timedOut" | "skipped" | "interrupted" | "expected" | "unexpected" | "flaky";
    flaky: string;
    duration: string;
    errors: any[];
    steps: Steps[];
    logs: string;
    screenshotPath?: string | null | undefined;
    filePath: string;
    projects: Set<string>;
    tracePath?: string;
    videoPath?: string;
    base64Image: boolean | undefined;
}

declare class OrtoniReport implements Reporter {
    private projectRoot;
    private results;
    private groupedResults;
    private suiteName;
    private config;
    constructor(config?: OrtoniReportConfig);
    onBegin(config: FullConfig, suite: Suite): void;
    onTestBegin(test: TestCase, result: TestResult): void;
    private projectSet;
    private tagsSet;
    onTestEnd(test: TestCase, result: TestResult): void;
    onEnd(result: FullResult): void;
    generateHTML(filteredResults: TestResultData[], totalDuration: string): string;
}

export { OrtoniReportConfig, OrtoniReport as default };
