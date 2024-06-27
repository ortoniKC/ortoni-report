import { TestError, TestStep } from "@playwright/test/reporter";
interface steps{
    snippet: string | undefined,
    title:string
}
export interface TestResultData {
    retry:string,
    isRetry: number;
    projectName: any;
    suite: any;
    title: string;
    status:"passed" | "failed" | "timedOut" | "skipped" | "interrupted" | "expected" | "unexpected" | "flaky";
    flaky: string;
    duration: string;
    errors: any[];
    steps:steps[];
    logs: string;
    screenshotPath?: string | null | undefined;
    filePath: string;
    projects:Set<string>;
}