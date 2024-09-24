# Ortoni Report by Koushik (LetCode with Koushik)

Welcome to **Ortoni Report**, a robust HTML report generator tailored for Playwright tests. Ortoni Report introduces powerful features to enhance test reporting, making it easier to visualize and manage test results.

Experience the live report: [Ortoni Report](https://ortoni.netlify.app/)

![Ortoni Report Preview](https://raw.githubusercontent.com/ortoniKC/ortoni-report/refs/heads/V2.0.3/ortoni-report.PNG)

## Key Features

1. **Hierarchical Grouping**
   - Tests are grouped hierarchically by file name, suite, and project, offering a structured view of test execution.

2. **Detailed Breakdown**
   - Each suite includes categorized tests under respective projects, providing clear organization.

3. **Comprehensive Test Details**
   - Display test status (passed, failed, skipped), duration, tags, errors, logs, and screenshots.
   - Sort and filter tests by suite, project, and script for detailed insights.

4. **Summary Statistics**
   - Overview of total tests, passed, failed, skipped, and flaky tests.
   - Success rate calculation for test suites.

5. **Chart Visualization**
   - Doughnut chart representation for visualizing test result distribution (passed, failed, skipped, flaky).

6. **Search and Reset**
   - Search functionality to filter tests based on user input.
   - Reset option to clear filters and display all tests.

7. **Customization and Themes**
   - Customize project details, author name, test types, and toggle between dark/light themes.
   - Option to choose between Base64 images or file paths for screenshots.
   - Users can set the report file name.

8. **Responsive Design**
   - Optimized layout that adapts seamlessly to different screen sizes for accessibility.

9. **Integration and Configuration**
   - Easily integrate with Playwright configurations using TypeScript/JavaScript.
   - Configure reporting preferences within your Playwright setup.

10. **Add Logo to the Report**
    - Add a relative or absolute path of the image to the config.

11. **Share Report**
    - Once report is generated it is ready to share

12. **Advanced Filtering**
    - Filter tests by project, tags, and status simultaneously, with the ability to display only those tests matching the selected criteria.

13. **Colorful Dashboard**
    - Enhanced the visual appeal of the dashboard with vibrant and intuitive colors.

14. **Display Selected Status on UI**
    - The selected status filter is now visible on the UI, making it easier to track the current filter settings.

15. **Hide Skipped Tests by Default**
    - Skipped tests are now hidden by default when using the "All Tests" filter, providing a cleaner and more focused view of relevant tests.

### How to Use Ortoni Report

#### Installation

1. **Install the ortoni-report package**:

    ```sh
    npm install -g ortoni-report
    ```

### Configurable Report Generation

Configure OrtoniReport in your `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';
import { OrtoniReportConfig } from "ortoni-report";

const reportConfig: OrtoniReportConfig = {
  preferredTheme: "light",
  filename: "index",
  authorName: "Koushik (LetCode with Koushik)",
  projectName: "Ortoni Report V2.0.3",
  testType: "Release",
  title: "Ortoni Report By LetCode Koushik",
  logo: "logo.png",
  base64Image: true,
  folderPath: "report",
  showProject: false
}

export default defineConfig({
    reporter: [['ortoni-report', reportConfig], ['dot']],
    // Other Playwright configurations
});
```
### Comprehensive Test Details

- **Rich Test Information**: Each test includes details like title, status, duration, tags, errors, steps, logs, video, and screenshot.
- **Color-coded Status**: Status indicators (green for passed, red for failed, yellow for skipped) for quick identification.
- **Static HTML Report**: Single file can be shared easily

### Future Plans

- **Enhanced Customization**: Additional options for customizing report appearance and structure.
- **CI/CD Integration**: Improved support for CI/CD environments.

### Change Logs

Explore the latest updates and changes in our [Changelog](https://github.com/ortoniKC/ortoni-report/blob/main/changelog.md).

### License

View the [LICENSE](https://github.com/ortoniKC/ortoni-report/blob/main/LICENSE.md) for licensing details.

### Feedback and Contributions

We value your feedback and contributions! For issues, suggestions, or contributions, visit our [GitHub repository](https://github.com/ortoniKC/ortoni-report).

Thank you for choosing Ortoni Report. We're committed to enhancing your Playwright testing experience.

---

**LetCode with Koushik**

--- 