#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import { exec } from 'child_process';
import { ensureHtmlExtension } from '../utils/utils';

// Utility function to ensure the filename has a .html extension


program
    .name('ortoni-report')
    .description('Ortoni Report by LetCode with Koushik')
    .version('1.0.0');

program
    .command('gr')
    .description('Bundle Ortoni Report')
    .option('-f, --filename <filename>', 'Specify the filename for the generated report', 'ortoni-report.html')
    .action((options) => {
        // Ensure the filename has a .html extension
        const filename = ensureHtmlExtension(options.filename);
        const reportPath = path.resolve(process.cwd(), filename);

        if (!fs.existsSync(reportPath)) {
            console.error(`${filename} not found. Please ensure the report has been generated.`);
            process.exit(1);
        }

        console.log('Bundling Ortoni Report...');
        exec(`parcel build ${reportPath} --dist-dir build --public-url ./`, (error, stdout, stderr) => {
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
