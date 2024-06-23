import { TestStep } from "@playwright/test/reporter";

export interface TestResultData {
    isRetry: number;
    projectName: any;
    suite: any;
    title: string;
    status:"passed" | "failed" | "timedOut" | "skipped" | "interrupted" | "expected" | "unexpected" | "flaky";
    flaky: string;
    duration: string;
    errors: any[];
    steps:TestStep[];
    logs: string;
    screenshotPath: string | null;
    filePath: any;
}