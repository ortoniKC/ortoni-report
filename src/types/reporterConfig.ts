export interface OrtoniReportConfig extends download {
    projectName?: string;
    authorName?: string;
    testType?: string;
    preferredTheme?: 'light' | 'dark';
    base64Image?:boolean;
}
export interface download {
    download?:false | {
        includeVideos?:boolean,
        includeTrace?:boolean,
    }
}

