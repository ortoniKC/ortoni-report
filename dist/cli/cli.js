#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const commander_1 = require("commander");
const child_process_1 = require("child_process");
const utils_1 = require("../utils/utils");
const findParcelBinary = () => {
    const localParcel = path_1.default.resolve(__dirname, '../../node_modules/.bin/parcel');
    const projectParcel = path_1.default.resolve(process.cwd(), 'node_modules/.bin/parcel');
    return fs_1.default.existsSync(localParcel) ? localParcel : projectParcel;
};
commander_1.program
    .name('ortoni-report')
    .description('Ortoni Report by LetCode with Koushik')
    .version('1.0.0');
commander_1.program
    .command('gr')
    .description('Bundle Ortoni Report')
    .option('-f, --filename <filename>', 'Specify the filename for the generated report', 'ortoni-report.html')
    .action((options) => {
    const filename = (0, utils_1.ensureHtmlExtension)(options.filename);
    const reportPath = path_1.default.resolve(process.cwd(), filename);
    if (!fs_1.default.existsSync(reportPath)) {
        console.error(`${filename} not found. Please ensure the report has been generated.`);
        process.exit(1);
    }
    // Resolve the path to the local parcel binary
    const parcelPath = findParcelBinary();
    const parcelCommand = `${parcelPath} build ${reportPath} --dist-dir ortoni-report --public-url ./`;
    console.log('Bundling Ortoni Report...');
    (0, child_process_1.exec)(parcelCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.log('Report bundled successfully.');
    });
});
commander_1.program.parse(process.argv);
