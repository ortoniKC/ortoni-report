## Playwright Report by Koushik

We are excited to announce the release of OrtoniReport (Playwright report - unofficial), a powerful and customizable HTML report generator for Playwright tests. This release includes key features that enhance the reporting capabilities and make it easier to visualize and organize test results.

[Click here to check the live Demo](https://ortoni.netlify.app/)

![Ortoni-Report](https://github.com/ortoniKC/ortoni-report/assets/58769833/e88f33d4-eb5c-41c7-b90a-f8a283af0058)

## Features

1. **Hierarchical Grouping:**

   - Test results are now grouped hierarchically by file name, suite name, and project name, allowing for a clear and organized view of your test structure.

2. **Detailed Breakdown:**

   - Each suite displays a sub-category for project names, with individual test cases listed under their respective projects.

3. **Test Result Display:**

   - Display results including status (passed, failed, skipped), duration, errors, logs, and screenshots.
   - Organize test results by suite, project, and test script.

4. **Summary Statistics:**

   - Provide summary statistics for total tests, passed tests, failed tests, skipped tests, and flaky tests.
   - Success Rate of test suite.

5. **Chart Visualization:**

   - Visualize test results using a doughnut chart to represent the distribution of passed, failed, skipped and flaky tests.

6. **Project Information:**

   - Include project name, author name, and test type information in the report.

7. **Search Functionality:**

   - Search bar to filter and display specific tests based on user input.

8. **Reset Functionality:**

   - Allow users to reset the search bar to show all tests when cleared.

9. **Customization:**

   - Customize project name, author name, and test type displayed in the report.
   - Dark/Light theme based on the user toggle.

10. **Responsive Design:**

    - Design the report layout to be responsive and adaptable to different screen sizes.

11. **Accessibility:**

    - Ensure accessibility by providing appropriate HTML attributes and semantic structure.

12. **Ease of Use:**

    - Enable easy navigation between test results and summary sections.

13. **Success Rate**
    - The success rate in this project is calculated based on the outcomes of the tests executed using Playwright. The calculation considers tests that pass initially as well as tests that initially fail but pass upon retry
    - Success Rate Formula
      The success rate (successRate) is calculated using the following formula:
    ```
    const successRate: string = (((passedTests + flakyTests) / totalTests) * 100).toFixed(2);
    ```
14. **Project Filtering**: Implemented filtering of tests by projects (e.g., chromium, firefox) to streamline test result views.

15. **Screenshots**: Implemented screenshot attachment as base64 images for enhanced report details

    These features collectively enhance the readability, usability, and accessibility of the test report, providing valuable insights into test execution and results.

### Configurable Report Generation

- **Flexible Configuration:** The reporter can be easily configured within your Playwright configuration file. Example:
  ```JS/TS
  import {OrtoniReportConfig} from "ortoni-report";
   const reportConfig: OrtoniReportConfig = {
        projectName: "Ortoni",
        testType: "Regression",
        authorName: "Koushik",
        preferredTheme: "light"
   };

  reporter: [["ortoni-report", reportConfig],
             ["dot"]],
  ```

### Comprehensive Test Details

- **Rich Test Information:** Each test result includes the test title, status, duration, errors, steps, logs, and screenshot paths.
- **Color-coded Status:** Test statuses are color-coded (green for passed, red for failed, yellow for skipped) for quick visual identification.

### Handlebars Template Integration

- **Customizable Reports:** The HTML report is generated using Handlebars templates, allowing for easy customization and styling.
- **JSON Helper:** A custom Handlebars helper for JSON stringification is included to handle complex data structures.

## Installation

To install OrtoniReport, add it to your project using npm:

```bash
npm install ortoni-report
```

## Usage

Configure OrtoniReport in your `playwright.config.ts`:

```javascript/typescript
import { defineConfig } from '@playwright/test';
import {OrtoniReportConfig} from "ortoni-report";
   const reportConfig: OrtoniReportConfig = {
        projectName: "Ortoni",
        testType: "Regression",
        authorName: "Koushik",
        preferredTheme: "light"
   };
export default defineConfig({
  reporter: [["ortoni-report", reportConfig],
             ["dot"]],
  // Other Playwright configurations
});
```

## Known Issues

- **Compatibility:** Ensure that your Node.js environment supports ES6 modules, as OrtoniReport uses modern JavaScript features.

## Future Plans

- **Additional Customization Options:** More options for customizing the appearance and structure of the HTML report.
- **Integration with CI/CD:** Enhanced support for continuous integration and deployment environments.
- **Advanced Filtering:** Additional filtering options to allow users to focus on specific subsets of test results.

## Change Logs:

[log](https://github.com/ortoniKC/ortoni-report/blob/main/changelog.md)

## License:

[LICENSE](https://github.com/ortoniKC/ortoni-report/blob/main/LICENSE.md)

## Feedback and Contributions

We welcome feedback and contributions from the community. If you encounter any issues or have suggestions for improvements, please open an issue or submit a pull request on our GitHub repository.

Thank you for using OrtoniReport! We hope it significantly enhances your Playwright testing experience.

---

**LetCode with Koushik**
