/**
 * Configuration options for OrtoniReport.
 */
export interface OrtoniReportConfig {
  /**
   * Open the report in local host (Trace viewer is accessible only in localhost)
   * @example "always"| "never"| "on-failure";
   * @default "never"
   */
  open?: "always" | "never" | "on-failure";
  /**
   * The title of the HTML report.
   * @example "Ortoni Playwright Test Report"
   */
  title?: string;
  /**
   * Add project on the list of the tests? (Filtering projects still works if hidden)
   * @example true to display, false to hide.
   * @default false
   */
  showProject?: boolean;
  /**
   * The name of the project.
   * @example "Ortoni Project"
   */
  projectName?: string;
  /**
   * The name of the author.
   * @example "Koushik Chatterjee"
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
  preferredTheme?: "light" | "dark";
  /**
   * If true, images will be encoded in base64.
   * @default false
   * @example true
   */
  base64Image?: boolean;
  /**
   * The local relative of the logo image.
   * Recommended to keep within the report genrated folder.
   * @default "ortoni-report/logo.png"
   * @example "logo.png"
   */
  logo?: string;
  /**
   * The filename to the html report.
   * @example "index.html"
   * @default "ortoni-report.html"
   */
  filename?: string;
  /**
   * The folder name.
   * @example "report"
   * @default "ortoni-report"
   */
  folderPath?: string;
  /**
   * Port to connect
   * @example 3600
   */
  port?: number;
  /**
   * Display console logs?
   * @example boolean
   * @default true
   */
  stdIO?: boolean;

  /**
   * Metadata for the report. ['TestCycle': 'Cycle 1', 'TestEnvironment':'QA', etc]
   * @example { "key": "value" } as string
   */
  meta?: Record<string, string>;
}
