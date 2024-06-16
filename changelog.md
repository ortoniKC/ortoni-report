# Change Log:

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

**Changed:**
1. Modified the `displayTestDetails` function to remove highlights when displaying test details
2. Updated the `searchTests` function to show all tests when the search query is empty
3. Improved time format to HH:MM:SS

These changes improve the user experience by allowing users to easily search for specific tests and providing visual feedback when selecting a test result from the list.