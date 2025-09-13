#!/usr/bin/env node

import { program } from "commander";
import * as fs from "fs";
import * as path from "path";
import { mergeAllData } from "./mergeData";
import { startReportServer } from "./utils/expressServer";

program.version("4.0.1").description("Ortoni Report - CLI");

program
  .command("show-report")
  .description("Open Ortoni Report")
  .option(
    "-d, --dir <path>",
    "Path to the folder containing the report",
    "ortoni-report"
  )
  .option(
    "-f, --file <filename>",
    "Name of the report file",
    "ortoni-report.html"
  )
  .option("-p, --port <port>", "Port to run the server", "2004")
  .action((options) => {
    const projectRoot = process.cwd();
    const folderPath = path.resolve(projectRoot, options.dir);
    const filePath = path.resolve(folderPath, options.file);
    const port = parseInt(options.port) || 2004;

    if (!fs.existsSync(filePath)) {
      console.error(
        `❌ Error: The file "${filePath}" does not exist in "${folderPath}".`
      );
      process.exit(1);
    }
    startReportServer(folderPath, path.basename(filePath), port, "always");
  });

program
  .command("merge-report")
  .description("Merge sharded reports into one final report")
  .option(
    "-d, --dir <path>",
    "Path to the folder containing shard files",
    "ortoni-report"
  )
  .option("-f, --file <filename>", "Output report file", "ortoni-report.html")
  .action(async (options) => {
    await mergeAllData(options);
  });

program.parse(process.argv);
