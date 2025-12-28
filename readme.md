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
  - **Glance**: See all the tests in a single Tabular view

- **Hierarchical Grouping**: Tests are organized by filename, suite, and project for better traceability.
- **Test History View**: Access up to 10 recent executions, categorized by suite and project with test Status, Duration.
- **Configurable Integration**: Easy setup with Playwright using TypeScript/JavaScript, along with customizable preferences.
- **Advanced Filtering**: Filter by Project, Tags, and Status
- **🔀 Merge Reports**: Combine multiple shard/parallel test run reports into a single **consolidated view** using CLI (`npx ortoni-report merge-report`)

### 2. **Detailed Reporting**

- **Comprehensive Test Data**: Includes status, duration, tags, logs, errors, screenshots, videos, trace viewer & markdown
- **Native Trace Viewer**: Directly open the trace viewer within the reporter in a new tab

### 3. **Visualization & Insights**

- **Test Analytics Dashboard**

  - Summary of total test runs, passed/failed counts, pass rate, and average duration.
  - **Trends Over Time**: Line chart showing test results across the last 30 runs.
  - **Top Flaky Tests**: Identify unstable tests quickly.
  - **Slowest Tests**: View tests with slowest average durations.

- **Chart Visualizations**:

  - Charts for test summary, per-project breakdowns
  - Bar charts for project-specific comparisons.
  - **Line Chart for Trends**: Visualize execution status progression over time (only in local execution)

- **Colorful UI**: Redesigned with vibrant, high-contrast visuals for improved readability and engagement.

### 4. **Customization & Personalization**

- **Theme Support**: Switch between **light** and **dark** themes for a comfortable viewing experience.
- **Custom Branding**: Add your company or project logo for a branded look.
- **Flexible Attachments**: Choose between Base64 or file path formats for media files.
- **Custom Paths**: Define report filenames and output folders as needed.

### 5. **User Experience & Usability**

- **Search & Reset**: Quickly search by keyword or status, with easy reset controls.
- **Self-Contained Reports**: Easily share and review offline-friendly reports.
- **Multi-Filters**: Combine filters for targeted test analysis.
- **Meta Information**: Add custom user or environment metadata to reports.
- **CLI**: Open the reporter anytime using the built-in CLI
- **Open Markdown**: View markdown - Copy and use it in your AI prompt
- **Supports GitHub Actions** - [Refer the project for example](https://github.com/ortoniKC/pw-test)

---

## Installation & Setup

### Step 1: Install Ortoni Report

Run the following command to install the **ortoni-report** package globally:

```bash
npm install -g ortoni-report
```

### Step 2: Configure in `playwright.config.[ts/js]`

```typescript
import { defineConfig } from "@playwright/test";
import { OrtoniReportConfig } from "ortoni-report";
import * as os from "os";

// Everything is optional - use as per your requirement

const reportConfig: OrtoniReportConfig = {
  open: process.env.CI ? "never" : "always",
  folderPath: "my-report",
  filename: "index.html",
  title: "Ortoni Test Report",
  showProject: false,
  projectName: "Your Project title",
  testType: "Functional",
  authorName: os.userInfo().username,
  base64Image: false,
  stdIO: false,
  meta: {
    "Test Cycle": "Sep, 2025",
    version: "4",
    description: "My automation suite",
    release: "0.1",
    platform: os.type(),
  },
};

export default defineConfig({
  ... playwright config
  reporter: [["ortoni-report", reportConfig]],
  ... playwright config
});
```

---

## Using the Ortoni Report CLI

### Command: `show-report`

This command starts a local Express server and serves the generated Ortoni report.

#### Options

- **`-d, --dir <path>`**: Path to the folder containing the report. Defaults to `ortoni-report`.
- **`-f, --file <filename>`**: Name of the report file. Defaults to `ortoni-report.html`.
- **`-p, --port <port>`**: Port number for the local server. Defaults to `2004`.

#### Example Usage

```bash
npx ortoni-report show-report
```

or

```bash
npx ortoni-report show-report --dir custom-folder --file my-report.html --port 3000
```

---

### Command: `merge-report` ✅ _\[New]_

This command **merges multiple Ortoni reports** (from shard executions or parallel test runs) into a single consolidated report.

#### Options

- **`-d, --dir <path>`**: Folder containing the shard files (folderPath - provided in ortoni-config). Defaults to ortoni-report.
- **`-f, --file <filename>`**: Name of the merged report file. Defaults to ortoni-report.html.

#### Example Usage

```bash
npx ortoni-report merge-report
```

```bash
npx ortoni-report merge-report --dir my-folder --file final-report.html
```

---

## Changelog

Stay up-to-date with the latest features, improvements, and bug fixes by reviewing the [Changelog](https://github.com/ortoniKC/ortoni-report/blob/main/changelog.md).

---

## License

This project is licensed under the terms of the [LICENSE](https://github.com/ortoniKC/ortoni-report/blob/main/LICENSE.md).

---

## Contributors

1. [Prabhash Dissanayake](https://github.com/prabhash-dissanayake-yl) - [PR](https://github.com/ortoniKC/ortoni-report/pull/99)

## Feedback and Contributions

I encourage you to share feedback and contribute to improving Ortoni Report!
For issues, suggestions, or contributions, please visit our [GitHub repository](https://github.com/ortoniKC/ortoni-report).

---

## Support

If you'd like to support this project, you can donate via UPI:

UPI id: ortoni@axl [Koushik Chatterjee]

[Buy me coffee](https://buymeacoffee.com/letcode) | [Paypal](https://paypal.me/koushik1677?country.x=IN&locale.x=en_GB)

---

**With love**
Developed and designed by [Koushik Chatterjee](https://letcode.in/contact)

**Tech Stack**

1. Report generated using Playwright custom report
2. [UI - React and Shadcn UI](https://github.com/ortoniKC/ortoni-report-react)
3. DB - sqlite
4. Local host - express

**LetCode with Koushik**
