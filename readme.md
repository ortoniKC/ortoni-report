# Release Notes: OrtoniReport v1.0.5

## Introduction

We are excited to announce the release of OrtoniReport v1.0.0, a powerful and customizable HTML report generator for Playwright tests. This release includes key features that enhance the reporting capabilities and make it easier to visualize and organize test results.

## Features

### Enhanced Grouping and Organization
- **Hierarchical Grouping:** Test results are now grouped hierarchically by file name, suite name, and project name, allowing for a clear and organized view of your test structure.
- **Detailed Breakdown:** Each suite displays a sub-category for project names, with individual test cases listed under their respective projects.

### Configurable Report Generation
- **Flexible Configuration:** The reporter can be easily configured within your Playwright configuration file. Example:
  ```JS/TS
  reporter: [
      ['ortoni-report'],
      ['dot']
  ],
  ```

### Screenshot Handling
- **Screenshot Storage:** Screenshots are now saved in a structured directory within the root of your project, ensuring that visual evidence is easily accessible.
- **Automatic Directory Creation:** The reporter automatically creates necessary directories for storing screenshots.

### Comprehensive Test Details
- **Rich Test Information:** Each test result includes the test title, status, duration, errors, steps, logs, and screenshot paths.
- **Color-coded Status:** Test statuses are color-coded (green for passed, red for failed, yellow for skipped) for quick visual identification.

### Handlebars Template Integration
- **Customizable Reports:** The HTML report is generated using Handlebars templates, allowing for easy customization and styling.
- **JSON Helper:** A custom Handlebars helper for JSON stringification is included to handle complex data structures.

## Installation

To install OrtoniReport, add it to your project using npm:

```bash
npm install ortoni-report --save-dev
```

## Usage

Configure OrtoniReport in your `playwright.config.ts`:

``` javascript/typescript
import { defineConfig } from '@playwright/test';
import OrtoniReport from 'ortoni-report';

export default defineConfig({
 reporter: [
      ['ortoni-report'],
      ['dot']
  ],
  // Other Playwright configurations
});
```

## Known Issues

- **Compatibility:** Ensure that your Node.js environment supports ES6 modules, as OrtoniReport uses modern JavaScript features.

## Future Plans

- **Additional Customization Options:** More options for customizing the appearance and structure of the HTML report.
- **Integration with CI/CD:** Enhanced support for continuous integration and deployment environments.
- **Advanced Filtering:** Additional filtering options to allow users to focus on specific subsets of test results.

## Feedback and Contributions

We welcome feedback and contributions from the community. If you encounter any issues or have suggestions for improvements, please open an issue or submit a pull request on our GitHub repository.

Thank you for using OrtoniReport! We hope it significantly enhances your Playwright testing experience.

---

**LetCode with Koushik**