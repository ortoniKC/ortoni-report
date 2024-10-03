/**
 * Configuration options for OrtoniReport.
 */
export interface OrtoniReportConfig {
    /**
 * Configuration for enabling charts in the HTML report.
 */
    charts?: {
        /**
         * Whether to display a stacked bar chart representing test outcomes
         * (passed, failed) for each project.
         * @example true
         */
        projectBar?: boolean;
        /**
         * Whether to display a polar area chart for visualizing test outcomes
         * across different projects in a radial format.
         * @example false
         */
        projectPolarArea?: boolean;
    };
    /**
     * The title of the HTML report.
     * @example "Ortoni Playwright Test Report"
     */
    title?: string
    /**
    * Add project on the list of the tests? (Filtering projects still works if hidden)
    * @example true to display, false to hide.
    */
    showProject?: boolean
    /**
     * The name of the project.
     * @example "Ortoni Project"
     */
    projectName?: string;

    /**
     * The name of the author.
     * @example "John Doe"
     */
    authorName?: string;

    /**
     * The type of tests being run.
     * @example "Regression"
     */
    testType?: string;

    /**
     * The preferred theme for the report.
     * Can be either "light" or "dark".
     * @default "System theme"
     * @example "dark"
     */
    preferredTheme?: 'light' | 'dark';

    /**
     * If true, images will be encoded in base64.
     * @default false
     * @example true
     */
    base64Image?: boolean;

    /**
     * The local relative or absolute path to the logo image.
     * @example "./assets/logo.png"
     * @example "/absolute/path/to/logo.png"
     */
    logo?: string;
    /**
    * The filename to the html report.
    * @example "index.html"
    */
    filename?: string;
    /**
    * The folder name.
    * @example "playwright-report"
    */
    folderPath?: string;
    /**
    * Port to connect
    * @example 3600
    */
    port?: number;

}

/**
 * Configuration options for downloading test artifacts.
 */
export interface Download {
    /**
     * Configuration for downloading artifacts. If set to `false`, downloads are disabled.
     * If set to an object, specify whether to include videos and trace files.
     */
    download?: false | {
        /**
         * If true, videos will be included in the download.
         * @default false
         * @example true
         */
        includeVideos?: boolean;

        /**
         * If true, trace files will be included in the download.
         * @default false
         * @example true
         */
        includeTrace?: boolean;
    };
}


