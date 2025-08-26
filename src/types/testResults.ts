export interface Steps {
  snippet: string | undefined;
  title: string;
  location: string;
}
export interface TestResultData {
  suiteHierarchy: string;
  key: string;
  annotations: any[];
  testTags: string[];
  location: string;
  retryAttemptCount: number;
  projectName: any;
  suite: any;
  title: string;
  status:
    | "passed"
    | "failed"
    | "timedOut"
    | "skipped"
    | "interrupted"
    | "expected"
    | "unexpected"
    | "flaky";
  flaky: string;
  duration: number;
  errors: any[];
  steps: Steps[];
  logs: string;
  screenshotPath?: string | null | undefined;
  screenshots?: string[];
  filePath: string;
  filters: Set<string>;
  tracePath?: string;
  videoPath?: string[];
  markdownPath?: string;
  base64Image: boolean | undefined;
  testId: string;
}
