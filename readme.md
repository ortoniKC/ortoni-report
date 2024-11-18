# Ortoni Report by Koushik (LetCode with Koushik)

Welcome to **Ortoni Report**, a comprehensive and visually appealing HTML report generator tailored for Playwright tests. Designed with powerful features and customizable options, Ortoni Report simplifies the process of reviewing and managing test results, making test reporting more intuitive and accessible.

### Live Demo: [Ortoni Report](https://ortoni.netlify.app/)

![Ortoni Report Preview](https://github.com/ortoniKC/ortoni-report/blob/V2.0.7/assets/images/v2.0.7.gif?raw=true)

---

### Key Features

### 1. **Organization & Grouping**
- **Hierarchical Grouping**: Tests are structured by filename, suite, and project, providing an organized overview.
- **Test History & Detailed Breakdown**: Support for displaying up to 10 recent executions, categorized by suite and project for easy navigation.
- **Integration and Configuration**: Easy integration with Playwright using TypeScript/JavaScript, with configurable preferences.
- **Advanced Filtering**: Filters for project, tags, and status, with the ability to reset for a full view.

### 2. **Detailed Reporting**
- **Comprehensive Test Details**: Status, duration, tags, errors, logs, screenshots, videos, and trace data.
- **Test Attachments**: Screenshots, videos, trace viewer, steps, error stack trace, and console logs.
- **Selected Status Display**: The UI highlights the active status filter for clarity.

### 3. **Visualization & Insights**
- **Summary Statistics**: Total tests and distribution of passed, failed, skipped, and flaky tests with success rates.
- **Chart Visualizations**: Doughnut chart for overall status and bar charts for project-specific comparisons.
- **Colorful and Intuitive Dashboard**: Vibrant themes for better visual appeal.

### 4. **Customization & Personalization**
- **Customization & Themes**: Toggle between light/dark themes, add project details, and personalize reports.
- **Add Your Logo**: Configurable logo for brand personalization.
- **Flexibility with Attachments**: Choose Base64 or file paths for screenshots.
- **Custom Report Paths**: Set custom filenames and folder paths for reports.

### 5. **User Experience & Usability**
- **Advanced Search and Reset**: Search tests with keywords or criteria, with reset options.
- **Hide Skipped Tests by Default**: Simplifies view by hiding skipped tests initially.
- **Share Reports**: Self-contained reports for easy sharing and review.
- **Comprehensive Filters**: Apply multiple filters simultaneously for focused insights. 

---

### Installation & Setup

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

const reportConfig: OrtoniReportConfig = {
  open: process.env.CI ? "never" : "always",
  folderPath: "report-db",
  filename: "index.html",
  title: "Ortoni Test Report",
  showProject: !true,
  projectName: "Ortoni-Report",
  testType: "Release - Nov 09, 2024",
  authorName: "Koushik (LetCode with Koushik)",
  base64Image: false,
  stdIO: false,
  preferredTheme: "light"
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
  title: "Ortoni Test Report",
  showProject: !true,
  projectName: "Ortoni-Report",
  testType: "Release - Nov 09, 2024",
  authorName: "Koushik (LetCode with Koushik)",
  base64Image: false,
  stdIO: false,
  preferredTheme: "light"
};

export default defineConfig({
  reporter: [["ortoni-report", reportConfig]],
  // Other Playwright configurations
});
```
---

### Changelog

Stay up-to-date with the latest features, improvements, and bug fixes by reviewing the [Changelog](https://github.com/ortoniKC/ortoni-report/blob/main/changelog.md).

### License

This project is licensed under the terms of the [LICENSE](https://github.com/ortoniKC/ortoni-report/blob/main/LICENSE.md).

### Feedback and Contributions

We encourage you to share feedback and contribute to improving Ortoni Report! For issues, suggestions, or contributions, please visit our [GitHub repository](https://github.com/ortoniKC/ortoni-report).


## Support

If you'd like to support this project, you can donate via UPI:

**UPI**: ortoni@axl (Koushik Chatterjee)
[Buy me coffee](https://buymeacoffee.com/letcode)
[Paypal](https://paypal.me/koushik1677?country.x=IN&locale.x=en_GB)

Thank you for using **Ortoni Report**! We’re committed to providing you with a superior Playwright testing experience.

---

**LetCode with Koushik**
