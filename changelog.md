# Change Log:

## Version 2.0.1
- Fixed local and root path issue of Parcel bundler.
- Local config issue

## Version 2.0.0
- Fixed local and root path issue of Parcel bundler.

## Version 1.1.9

### New Features

- **Configurable Report Filename**: Introduced a new configuration attribute to set the filename for the generated report. The default value is `ortoni-report.html`.
- **filename**: User can set the report file name.

### Command-Line Interface

- **Generate Report Command**: Added a new CLI command to generate and bundle the report:
    ```sh
    npx ortoni-report gr
    ```
  This command allows users to easily generate the report with a single command.

### Enhancements

- **Bundled Report**: The generated report is now bundled into a single file, making it easier to zip and share.
- **Storage Location**: The bundled report is stored in the `project/ortoni-report` folder for better organization and accessibility.


## Version 1.1.8

### Fixed
- CSS issue

## Version 1.1.7

### Fixed
- Layout issue where the test column extends off-screen
- Screenshot layout of tests executed on mobile viewport 

### New
- Add custom project/organization logo
- Exception handling in `ortoni-report.ts`
- Added docs to the `OrtoniReportConfig`

### Improved
- Margin on Test List for better spacing

## Version 1.1.6
- Implemented debounce function to reduce search event handling frequency.
- Modified steps details to open only if a test has errors, enhancing UI clarity.
- Optimized data load by removing unnecessary inner steps, improving performance.
- Enhanced debug experience by adding file locations for each test step.
- Implemented tags feature on test panels to categorize and filter tests efficiently.
- Added support for attaching videos to test reports, enriching test documentation.
- Introduced user option to choose between base64 images and file path for screenshots.

## Version 1.1.5
- Added config properly to readme

## Version 1.1.4

1. **CSS Enhancement**: Updated CSS framework to Bulma for improved visualization and mobile responsiveness.
   
2. **Screenshots**: Implemented screenshot attachment as base64 images for enhanced report details.
   
3. **Toggle Theme Button**: Added a toggle theme button allowing users to switch between dark and light themes for better readability.
   
4. **Project Filtering**: Implemented filtering of tests by projects (e.g., chromium, firefox) to streamline test result views.
   
5. **Configuration Option**: Introduced `OrtoniReportConfig` for customizable report settings:
   ```typescript
    import {OrtoniReportConfig} from "ortoni-report";
    let reportConfig: OrtoniReportConfig = {
        projectName: "Ortoni",
        testType: "Regression",
        authorName: "Koushik",
        preferredTheme: "light"
    };
    reporter:[["ortoni-report", reportConfig]],
   ```
6. **Design Improvements**: Made overall design enhancements and added CSS transitions for smoother user interactions.


## Version 1.1.3

**New Features:**
- Added detailed steps to the testDetails section in the HTML report.
- Introduced a new flaky icon for better visual representation in the report.
- Display of test steps in the HTML report.
- Added a filter for retry tests to better categorize and display them.

**Improved:**
- Updated the package dependencies to remove vulnerabilities.
- Enhanced time formatting to include milliseconds in the duration display.
- Enhanced the calculation and display of the success rate in the HTML report.

## Version 1.1.2

**New Features:**
- **Ellipsis Styling for Test Names:** Long test names are now truncated with ellipsis for better readability.
- **Retry, Pass, Fail, and Skip Indicators:** Added visual indicators (images) to denote the status of each test, including retries.
- **Enhanced `msToTime` Function:** Duration now includes milliseconds for more precise time tracking.
- **Summary Filters:** Clicking on summary filters (passed, failed & other) to display the selected filter.

**Improvements:**
- **Unified Status Handling:** The `applyFilter` function now treats `failed` and `timedOut` statuses as the same for consistent filtering.
- **Date and Time Formatting:** Passed date in the format `DD-MMM-YYYY` and included time for more detailed reporting.
- **Success Rate and Last Run Data:** Added the ability to pass `successRate` and `lastRun` data to the `onEnd` method for comprehensive report details.

**Bug Fixes:**
- Fixed issues with conditionals in Handlebars for status checking.
- Improved event listener attachment for filtering and search functionalities.

**Notes:**
- Screenshot handling has been enhanced with modal dialogs, using Pico.css for styling.

This release includes several visual and functional enhancements aimed at improving the usability and readability of the Playwright test reports. The added features and improvements will help users better understand test outcomes and statuses at a glance.

### Version 1.1.0

## New Features
- **Search Functionality:**
  - Added a search bar to filter tests by their title.
  - Display the relevant test name, project, and test file name while hiding others during search.
  - Reset search form to show all tests when cleared.

## Improvements 
- **Page Zoom:**
  - Set the HTML page zoom to 90% for better display on different screen sizes.

## Bug Fixes
- **Event Listeners:**
  - Fixed an issue where test details would not display when clicking on filtered search results.
  - Ensured event listeners are correctly reattached after filtering search results.

## Style Adjustments
- **CSS Adjustments:**
  - Adjusted body zoom for better overall display: `body { zoom: 0.9; }`

---

### Instructions for Users
- Use the search bar to quickly find specific tests by their title.
- Clear the search input to reset the view and display all tests.
- Note that the page zoom has been set to 90% for optimal display.

### Version 1.0.9

**Added:**
1. Added functionality to highlight selected test result in the list
2. Implemented search functionality to filter test results based on user input
3. Added reset functionality to display all tests when the search bar is cleared
4. Custome parameter to the report as Author Name, Project Name & Test type
5. Added highlight to the selected test name
6. Added overall execution time to the suite section where it also display #4
7. Added local CSS and fav icon of letcode.in
8. Added flaky test (Retry results)

**Fixed**
1. File path based on unix/windows machine [ISSUE#1](https://github.com/ortoniKC/ortoni-report/issues/1)
2. Log & Error message display where it shows the actual html element
3. Skip test duration of 0s for the skipper test
4. Fixed Absolute path of test files

**Changed:**
1. Modified the `displayTestDetails` function to remove highlights when displaying test details
2. Updated the `searchTests` function to show all tests when the search query is empty
3. Improved time format to HH:MM:SS

These changes improve the user experience by allowing users to easily search for specific tests and providing visual feedback when selecting a test result from the list.