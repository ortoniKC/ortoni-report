import { TestResult } from "@playwright/test/reporter";
import path from "path";
import fs from "fs";
import { TestResultData } from "../types/testResults";
import { OrtoniReportConfig } from "../types/reporterConfig";

export function attachFiles(subFolder: string, result: TestResult, testResult: TestResultData, config: OrtoniReportConfig) {
    const folderPath = config.folderPath || 'ortoni-report';
    const attachmentsFolder = path.join(folderPath, 'ortoni-data', 'attachments', subFolder);

    if (!fs.existsSync(attachmentsFolder)) {
        fs.mkdirSync(attachmentsFolder, { recursive: true });
    }

    if (!result.attachments) return;

    const { base64Image } = config;
    testResult.screenshots = [];

    result.attachments.forEach((attachment) => {
        const { contentType, name, path: attachmentPath, body } = attachment;
        if (!attachmentPath && !body) return;

        const fileName = attachmentPath ? path.basename(attachmentPath) : `${name}.${getFileExtension(contentType)}`;
        const relativePath = path.join('ortoni-data', 'attachments', subFolder, fileName);
        const fullPath = path.join(attachmentsFolder, fileName);

        if (contentType === "image/png") {
            handleImage(attachmentPath, body, base64Image, fullPath, relativePath, testResult);
        } else if (name === "video") {
            handleAttachment(attachmentPath, fullPath, relativePath, 'videoPath', testResult);
        } else if (name === "trace") {
            handleAttachment(attachmentPath, fullPath, relativePath, 'tracePath', testResult);
        } else if (name === "error-context") {
            handleAttachment(attachmentPath, fullPath, relativePath, 'markdownPath', testResult);
        }
    });
}

function handleImage(attachmentPath: string | undefined, body: Buffer | undefined, base64Image: boolean | undefined, fullPath: string, relativePath: string, testResult: TestResultData) {
    let screenshotPath = "";
    if (attachmentPath) {
        try {
            const screenshotContent = fs.readFileSync(attachmentPath, base64Image ? "base64" : undefined);
            screenshotPath = base64Image
                ? `data:image/png;base64,${screenshotContent}`
                : relativePath;

            if (!base64Image) {
                fs.copyFileSync(attachmentPath, fullPath);
            }
        } catch (error) {
            console.error(`OrtoniReport: Failed to read screenshot file: ${attachmentPath}`, error);
        }
    } else if (body) {
        screenshotPath = `data:image/png;base64,${body.toString('base64')}`;
    }
    if (screenshotPath) {
        testResult.screenshots?.push(screenshotPath);
    }
}

function handleAttachment(attachmentPath: string | undefined, fullPath: string, relativePath: string, resultKey: 'videoPath' | 'tracePath' | 'markdownPath', testResult: TestResultData) {
    if (attachmentPath) {
        fs.copyFileSync(attachmentPath, fullPath);
        testResult[resultKey] = relativePath;
    }
}

function getFileExtension(contentType: string): string {
    const extensions: { [key: string]: string } = {
        "image/png": "png",
        "video/webm": "webm",
        "application/zip": "zip",
        "text/markdown": "md",

    };
    return extensions[contentType] || "unknown";
}