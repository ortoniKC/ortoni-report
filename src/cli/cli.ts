#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import { exec } from 'child_process';
import { ensureHtmlExtension } from '../utils/utils';

const findParcelBinary = () => {
    const localParcel = path.resolve(__dirname, '../../node_modules/.bin/parcel');
    const projectParcel = path.resolve(process.cwd(), 'node_modules/.bin/parcel');
    return fs.existsSync(localParcel) ? localParcel : projectParcel;
};

program
    .name('ortoni-report')
    .description('Ortoni Report by LetCode with Koushik')
    .version('1.0.0');

program
    .command('gr')
    .description('Bundle Ortoni Report')
    .option('-f, --filename <filename>', 'Specify the filename for the generated report', 'ortoni-report.html')
    .action((options) => {
        const filename = ensureHtmlExtension(options.filename);
        const reportPath = path.resolve(process.cwd(), filename);

        if (!fs.existsSync(reportPath)) {
            console.error(`${filename} not found. Please ensure the report has been generated.`);
            process.exit(1);
        }
        // Resolve the path to the local parcel binary
        const parcelPath = findParcelBinary();
        const parcelCommand = `${parcelPath} build ${reportPath} --dist-dir ortoni-report --public-url ./`;

        console.log('Bundling Ortoni Report...');
        exec(parcelCommand, (error, stdout, stderr) => {
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

program.parse(process.argv);
