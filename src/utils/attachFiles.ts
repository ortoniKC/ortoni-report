import { TestResult } from "@playwright/test/reporter";
import path from "path";
import fs from "fs";
import { TestResultData } from "../types/testResults";
import { OrtoniReportConfig } from "../ortoni-report";

export function attachFiles(result: TestResult, testResult: TestResultData, config: OrtoniReportConfig) {
    const folderPath = config.folderPath || 'playwright-report';
    const attachmentsFolder = path.join(folderPath, 'ortoni-data', 'attachments');

    if (!fs.existsSync(attachmentsFolder)) {
        fs.mkdirSync(attachmentsFolder, { recursive: true });
    }

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
                        const attachmentFileName = path.basename(attachment.path);
                        screenshotPath = base64Image
                            ? `data:image/png;base64,${screenshotContent}`
                            : path.join('ortoni-data', 'attachments', attachmentFileName); // Adjust path for report folder

                        if (!base64Image) {
                            // Copy the screenshot file to the new attachments folder
                            fs.copyFileSync(attachment.path, path.join(attachmentsFolder, attachmentFileName));
                        }
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
                const videoFileName = path.basename(attachment.path);
                const videoPath = path.join('ortoni-data', 'attachments', videoFileName); // Adjust path for report folder
                fs.copyFileSync(attachment.path, path.join(attachmentsFolder, videoFileName));
                testResult.videoPath = videoPath;
            }

            if (attachment.name === "trace" && attachment.path) {
                const traceFileName = path.basename(attachment.path);
                const tracePath = path.join('ortoni-data', 'attachments', traceFileName);
                fs.copyFileSync(attachment.path, path.join(attachmentsFolder, traceFileName));
                testResult.tracePath = tracePath;
            }
        });
    }
}
