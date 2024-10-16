import { TestResult } from "@playwright/test/reporter";
import path from "path";
import { TestResultData } from "../types/testResults";
import { OrtoniReportConfig } from "../ortoni-report";
import fs from "fs";

export function attachFiles(result: TestResult, testResult: TestResultData, config: OrtoniReportConfig) {
    if (result.attachments) {
        const { base64Image } = config;
        testResult.screenshots = [];
        result.attachments.forEach((attachment) => {
            if (attachment.contentType === "image/png") {
                let screenshotPath = "";
                if (attachment.path) {
                    try {
                        const screenshotContent = fs.readFileSync(
                            attachment.path,
                            base64Image ? "base64" : undefined
                        );
                        screenshotPath = base64Image
                            ? `data:image/png;base64,${screenshotContent}`
                            : path.resolve(attachment.path);
                    } catch (error) {
                        console.error(
                            `OrtoniReport: Failed to read screenshot file: ${attachment.path}`,
                            error
                        );
                    }
                } else if (attachment.body) {
                    screenshotPath = `data:image/png;base64,${attachment.body.toString('base64')}`;
                }
                if (screenshotPath) {
                    testResult.screenshots?.push(screenshotPath);
                }
            }
            if (attachment.name === "video" && attachment.path) {
                testResult.videoPath = path.resolve(__dirname, attachment.path);
            }
            // if (attachment.name === "trace" && attachment.path) {
            //   testResult.tracePath = path.resolve(__dirname, attachment.path);
            // }
        });
    }
}
