import { OrtoniReportConfig } from "../types/reporterConfig";
import { TestResultData } from "../types/testResults";

export function groupResults(
  config: OrtoniReportConfig,
  results: TestResultData[]
) {
  if (config.showProject) {
    // Group by filePath, suite, and projectName
    const groupedResults = results.reduce((acc: any, result, index) => {
      const testId = `${result.filePath}:${result.projectName}:${result.title}`;
      const key = `${testId}-${result.key}-${result.retryAttemptCount}`;
      const { filePath, suite, projectName } = result;
      acc[filePath] = acc[filePath] || {};
      acc[filePath][suite] = acc[filePath][suite] || {};
      acc[filePath][suite][projectName] =
        acc[filePath][suite][projectName] || [];
      acc[filePath][suite][projectName].push({ ...result, index, testId, key });
      return acc;
    }, {});
    return groupedResults;
  } else {
    // Group by filePath and suite, ignoring projectName
    const groupedResults = results.reduce((acc: any, result, index) => {
      const testId = `${result.filePath}:${result.projectName}:${result.title}`;
      const key = `${testId}-${result.key}-${result.retryAttemptCount}`;
      const { filePath, suite } = result;
      acc[filePath] = acc[filePath] || {};
      acc[filePath][suite] = acc[filePath][suite] || [];
      acc[filePath][suite].push({ ...result, index, testId, key });
      return acc;
    }, {});
    return groupedResults;
  }
}
