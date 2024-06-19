export interface TestResultData {
    isRetry: number;
    totalDuration: string;
    projectName: any;
    suite: any;
    title: string;
    status: 'passed' | 'failed' | 'timedout' | 'interrupted' | 'skipped' | 'timedOut' | 'flaky';
    flaky: string;
    duration: string;
    errors: any[];
    steps: any[];
    logs: string;
    screenshotPath: string | null;
    filePath: any;
}