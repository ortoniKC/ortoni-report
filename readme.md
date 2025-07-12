# Ortoni Report

A comprehensive and visually appealing HTML report generator tailored for Playwright tests. Designed with powerful features and customizable options, Ortoni Report simplifies the process of reviewing and managing test results, making test reporting more intuitive and accessible.

### Live Demo: [Ortoni Report](https://ortoni.letcode.in/)

![Ortoni Report Preview](assets/ortoni-report.gif)

---

## Key Features

### 1. **Organization & Navigation**

- **Sidebar Navigation**: Enjoy a clean and structured layout for seamless navigation.
- **Sections**:
  - **Dashboard**: High-level overview of test analytics and trends.
  - **Tests**: Dive into individual test details including logs, screenshots, and errors.
  - **Analytics**: Track overall execution metrics, trends, and flaky/slow test insights.
- **Hierarchical Grouping**: Tests are organized by filename, suite, and project for better traceability.
- **Test History View**: Access up to 10 recent executions, categorized by suite and project.
- **Configurable Integration**: Easy setup with Playwright using TypeScript/JavaScript, along with customizable preferences.
- **Advanced Filtering**: Filter by project, tags, and status — with a reset option for full visibility.

### 2. **Detailed Reporting**

- **Comprehensive Test Data**: Includes status, duration, tags, logs, errors, screenshots, videos, and trace viewer.
- **Native Trace Viewer**: Directly open the trace viewer within the reporter.

### 3. **Visualization & Insights**

- **Test Analytics Dashboard** 🌟 **(New!)**

  - Summary of total test runs, passed/failed counts, pass rate, and average duration.
  - **Trends Over Time**: Line chart showing test results across the last 30 runs.
  - **Top Flaky Tests**: Identify unstable tests quickly.
  - **Slowest Tests**: View tests with highest average durations.

- **Chart Visualizations**:

  - Pie or doughnut charts for test summary and per-project breakdowns **(Improved!)**
  - Bar charts for project-specific comparisons.
  - **Line Chart for Trends**: Visualize execution status progression over time.

- **Colorful UI**: Redesigned with vibrant, high-contrast visuals for improved readability and engagement.

### 4. **Customization & Personalization**

- **Theme Support**: Switch between **light** and **dark** themes for a comfortable viewing experience.
- **Custom Branding**: Add your company or project logo for a branded look.
- **Flexible Attachments**: Choose between Base64 or file path formats for media files.
- **Custom Paths**: Define report filenames and output folders as needed.

### 5. **User Experience & Usability**

- **Search & Reset**: Quickly search by keyword or status, with easy reset controls.
- **Skip Management**: Skipped tests are hidden by default to declutter views.
- **Self-Contained Reports**: Easily share and review offline-friendly reports.
- **Multi-Filters**: Combine filters for targeted test analysis.
- **Meta Information**: Add custom user or environment metadata to reports.
- **CLI**: Open the reporter anytime using the builin CLI
- **Open Markdown**: View markdown as HTML - Copy and use it in your AI prompt

---

## Installation & Setup

### Step 1: Install Ortoni Report

Run the following command to install the **ortoni-report** package globally:

```bash
npm install -D ortoni-report
```

### Step 2: Configure in `playwright.config.ts`

Set up **Ortoni Report** in your Playwright configuration file with the following example:

```typescript
import { defineConfig } from "@playwright/test";
import { OrtoniReportConfig } from "ortoni-report";
import * as os from "os";

const reportConfig: OrtoniReportConfig = {
  open: process.env.CI ? "never" : "always", // default to never
  folderPath: "report-db",
  filename: "index.html",
  logo:"logo.{png, jpg}",
  title: "Ortoni Test Report",
  showProject: !true,
  projectName: "Ortoni-Report",
  testType: "Functional",
  authorName: os.userInfo().username,
  base64Image: false,
  stdIO: false,
  preferredTheme: "light",
  chartType: "doughnut" | "pie";
  meta: {
    project: "Playwright",
    version: "3",
    description: "Playwright test report",
    testCycle: "04121994",
    release: "0.3",
     platform: os.type(),
  },
};

export default defineConfig({
  reporter: [["ortoni-report", reportConfig]],
  // Other Playwright configurations
});
```

### Configure in `playwright.config.js`

```javascript
import { defineConfig } from "@playwright/test";

const reportConfig = {
  open: process.env.CI ? "never" : "always",
  folderPath: "report-db",
  filename: "index.html",
  logo:"logo.{png, jpg}",
  title: "Ortoni Test Report",
  showProject: !true,
  projectName: "Ortoni-Report",
  testType: "e2e",
  authorName: "Koushik",
  base64Image: false,
  stdIO: false,
  preferredTheme: "light",
  chartType: "doughnut" | "pie";
  meta: {
    project: "Playwright",
    version: "3.0.0",
    description: "Playwright test report",
    testCycle: "1",
    release: "1.0.0",
    platform: "Windows",
  },
};

export default defineConfig({
  reporter: [["ortoni-report", reportConfig]],
  // Other Playwright configurations
});
```

## Using the Ortoni Report CLI

### Command: `show-report`

This command starts a local Express server and serves the generated Ortoni report. You can open the report in your default browser.

#### Options

- **`-d, --dir <path>`**: Path to the folder containing the report. Defaults to `ortoni-report`.
- **`-f, --file <filename>`**: Name of the report file. Defaults to `ortoni-report.html`.
- **`-p, --port <port>`**: Port number for the local server. Defaults to `2004`.

#### Example Usage

1. **Default Usage**

   ```bash
   npx ortoni-report show-report
   ```

   This will:

   - Look for the report file `ortoni-report.html` in the `ortoni-report` folder.
   - Start the server on port `2004`.

2. **Custom folder and file Options**
   ```bash
   npx ortoni-report show-report --dir custom-folder --file my-report.html --port 3000
   ```
   This will:
   - Look for the file `my-report.html` in `custom-folder`.
   - Start the server on port `3000`.

#### Errors and Troubleshooting

- If the specified file or folder does not exist, you will see an error like:
  ```
  Error: The file "my-report.html" does not exist in the folder "custom-folder".
  ```
  Ensure the file and folder paths are correct.

#### Accessing the Report

Once the server is running, open your browser and navigate to:

```
http://localhost:<port>
```

Replace `<port>` with the port number you specified or the default port (`2004`). The report will automatically open in your default browser if the `always` option is enabled.

---

## Changelog

Stay up-to-date with the latest features, improvements, and bug fixes by reviewing the [Changelog](https://github.com/ortoniKC/ortoni-report/blob/main/changelog.md).

## License

This project is licensed under the terms of the [LICENSE](https://github.com/ortoniKC/ortoni-report/blob/main/LICENSE.md).

## Feedback and Contributions

I encourage you to share feedback and contribute to improving Ortoni Report! For issues, suggestions, or contributions, please visit our [GitHub repository](https://github.com/ortoniKC/ortoni-report).

## Support

If you'd like to support this project, you can donate via UPI:

![UPI Payment](https://raw.githubusercontent.com/ortoniKC/ortoniKC/refs/heads/main/ortoni.png)

[Buy me coffee](https://buymeacoffee.com/letcode) | [Paypal](https://paypal.me/koushik1677?country.x=IN&locale.x=en_GB)

Thank you for using **Ortoni Report**! I'm committed to providing you with a superior Playwright testing experience.

---

**Developer & Designer**
[Koushik Chatterjee](https://letcode.in/contact)

**LetCode with Koushik**
