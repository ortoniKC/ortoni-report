import { OrtoniReportConfig } from "../types/reporterConfig";

export function groupResults(config: OrtoniReportConfig, results: any[]) {
    if (config.showProject) {
        // Group by filePath, suite, and projectName
        const groupedResults = results.reduce((acc: any, result, index) => {
            const { filePath, suite, projectName } = result;
            acc[filePath] = acc[filePath] || {};
            acc[filePath][suite] = acc[filePath][suite] || {};
            acc[filePath][suite][projectName] =
                acc[filePath][suite][projectName] || [];
            acc[filePath][suite][projectName].push({ ...result, index });
            return acc;
        }, {});
        return groupedResults;
    } else {
        // Group by filePath and suite, ignoring projectName
        const groupedResults = results.reduce((acc: any, result, index) => {
            const { filePath, suite } = result;
            acc[filePath] = acc[filePath] || {};
            acc[filePath][suite] = acc[filePath][suite] || [];
            acc[filePath][suite].push({ ...result, index });
            return acc;
        }, {});
        return groupedResults;
    }
}