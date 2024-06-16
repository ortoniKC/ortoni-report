export interface TestResultData {    
    totalDuration: string
    projectName: any;
    suite: any;
    title: string;
    status: string;
    flaky:string;
    duration: string;
    errors: any[];
    steps: any[];
    logs: string;
    screenshotPath: string | null;
    filePath: any;
}