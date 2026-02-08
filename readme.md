# Ortoni Report

A comprehensive and visually appealing HTML report generator tailored for Playwright tests. Designed with powerful features and customizable options, Ortoni Report simplifies the process of reviewing and managing test results, making test reporting more intuitive and accessible.

### Live Demo: [Ortoni Report](https://ortoni.letcode.in/)

![Ortoni Report Preview](assets/ortoni-report.gif)

## Key Features

### 1. **Organization & Navigation**

- **Sidebar Navigation**: Enjoy a clean and structured layout for seamless navigation.
- **Sections**:
  - **Dashboard**: High-level overview of test analytics and trends.
  - **Tests**: Dive into individual test details including logs, screenshots, and errors.
  - **Analytics**: Track overall execution metrics, trends, and flaky/slow test insights.
  - **Glance**: See all the tests in a single Tabular view
  - **Retries Tab**: Compare failed and passed attempts of the same test side-by-side.
  - **Screenshots**: See all the test images

- **Hierarchical Grouping**: Tests are organized by filename, suite, and project for better traceability.
- **Test History View**: Access up to 25 recent executions with a beautiful chart
- **Advanced Filtering**: Filter by Project, Tags, and Status.
- **Deep Linking**: Shareable URLs to directly navigate to specific test failures.
- **Command Palette (⌘+K)**: Instant global search and navigation across tests.
- **Power-User Keyboard Shortcuts**:
  - `J` / `K` → Navigate through test list.
  - `Enter` → Open selected test.
  - `T` → Toggle Dark/Light mode.
- **Configurable Integration**: Easy setup with Playwright using TypeScript/JavaScript, along with customizable preferences.
- **🔀 Merge Reports**: Combine multiple shard/parallel test run reports into a single **consolidated view** using CLI (`npx ortoni-report merge-report`).

---

### 2. **Detailed Reporting & Debugging**

- **Comprehensive Test Data**: Includes status, duration, tags, logs, errors, screenshots, videos, trace viewer & markdown.
- **Native Trace Viewer**: Directly open the trace viewer within the reporter in a new tab.
- **Retry Side-by-Side Comparison**: Compare failure vs success attempts easily.
- **Error Similarity Grouping**: Automatically groups failures based on common error patterns for faster triage.
- **Export Options**: Copy failure summaries formatted for Slack, Jira, or direct sharing links.

---

### 3. **AI-Powered Insights**

- **AI-Driven Root Cause Analysis**:
  - Integrated **"Suggest Fix"** feature.
  - Supports multiple LLM providers:
    - OpenAI
    - Gemini
    - Claude
    - Ollama
  - Users can configure model and API keys directly from settings.

---

### 4. **Visualization & Analytics**

- **Test Analytics Dashboard**
  - Summary of total test runs, passed/failed counts, pass rate, and average duration.
  - **Trends Over Time**: Line chart showing test results across the last 100 runs.
  - **Top Flaky Tests**: Identify unstable tests quickly.
  - **Slowest Tests**: View tests with slowest average durations.
  - **Error Pattern Insights**: Identify recurring failures instantly.

- **Heatmaps**
  - **Test Reliability Heatmap** showing flaky execution patterns across days and time windows.

- **Chart Visualizations**
  - Charts for test summary and per-project breakdowns.
  - Bar charts for project-specific comparisons.
  - Line charts for execution status progression over time (local execution).

---

### 5. **Customization & Personalization**

- **Theme Support**: Switch between **light** and **dark** themes.
- **Custom Branding**: Add company or project logos.
- **Flexible Attachments**: Choose Base64 or file path formats for media files.
- **Custom Paths**: Define report filenames and output folders.
- **Meta Information**: Add custom user or environment metadata.

---

### 6. **User Experience & Usability**

- **Search & Reset**: Quickly search by keyword or status.
- **Self-Contained Reports**: Easily share offline-friendly reports.
- **Multi-Filters**: Combine filters for targeted analysis.
- **CLI**: Open reports anytime using built-in commands.
- **Open Markdown**: View markdown and reuse it directly in AI prompts.
- **Supports CI/CD**
  - [Sample Jenkinsfile](Jenkinsfile.sample)
  - [GitHub Actions Example](https://github.com/ortoniKC/pw-test)

---

## Installation & Setup

### Step 1: Install Ortoni Report

```bash
npm install -g ortoni-report
```

---

### Step 2: Configure in `playwright.config.[ts/js]`

```typescript
import { defineConfig } from "@playwright/test";
import { OrtoniReportConfig } from "ortoni-report";
import * as os from "os";

const reportConfig: OrtoniReportConfig = {
  open: process.env.CI ? "never" : "always",
  folderPath: "report",
  filename: "index.html",
  title: "Ortoni Test Report",
  projectName: "Your Project title",
  testType: "Functional",
  authorName: os.userInfo().username,
  base64Image: false,
  stdIO: false,
  meta: {
    "Test Cycle": "Feb, 2026",
    version: "4",
    description: "My automation suite",
    release: "0.6",
    platform: os.type(),
  },
};

export default defineConfig({
  reporter: [["ortoni-report", reportConfig]],
});
```

---

## Using the Ortoni Report CLI

### Command: `show-report`

Starts a local Express server and serves the generated report.

#### Options

- `-d, --dir <path>` → Report folder (default: `ortoni-report`)
- `-f, --file <filename>` → Report filename (default: `ortoni-report.html`)
- `-p, --port <port>` → Server port (default: `2004`)

#### Example

```bash
npx ortoni-report show-report
```

```bash
npx ortoni-report show-report --dir custom-folder --file my-report.html --port 3000
```

---

### Command: `merge-report`

Merges multiple shard/parallel reports into a single consolidated report.

#### Options

- `-d, --dir <path>` → Folder containing shard reports
- `-f, --file <filename>` → Output merged filename

#### Example

```bash
npx ortoni-report merge-report
```

```bash
npx ortoni-report merge-report --dir my-folder --file final-report.html
```

---

## Changelog

See full release updates [here](https://github.com/ortoniKC/ortoni-report/blob/main/changelog.md)

---

## License

[Licensed under](https://github.com/ortoniKC/ortoni-report/blob/main/LICENSE.md)

---

## Contributors

1. [Prabhash Dissanayake](https://github.com/prabhash-dissanayake-yl) - [PR](https://github.com/ortoniKC/ortoni-report/pull/99)

---

## Feedback and Contributions

For issues or contributions:
[ortoni-report](https://github.com/ortoniKC/ortoni-report)

---

## Support

UPI: **ortoni@axl** (Koushik Chatterjee)

[Buy me coffee](https://buymeacoffee.com/letcode) | [Paypal](https://paypal.me/koushik1677?country.x=IN&locale.x=en_GB)

---

Developed and designed by
[Koushik Chatterjee](https://letcode.in/contact)

---

## Tech Stack

1. Report generated using Playwright custom reporter
2. UI – React and Shadcn UI
3. Database – SQLite
4. Local Server – Express

**[LetCode with Koushik](https://www.letcode.in)**
