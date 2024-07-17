export interface OrtoniReportConfig {
    projectName?: string;
    authorName?: string;
    testType?: string;
    preferredTheme?: 'light' | 'dark';
    base64Image?:boolean;
}
export interface Download {
    download?:false | {
        includeVideos?:boolean,
        includeTrace?:boolean,
    }
}

