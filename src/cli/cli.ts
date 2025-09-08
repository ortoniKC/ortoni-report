#!/usr/bin/env node

import { program } from "commander";
import { startReportServer } from "../utils/expressServer";
import * as fs from "fs";
import * as path from "path";
import { DatabaseManager } from "../helpers/databaseManager";
import { HTMLGenerator } from "../helpers/HTMLGenerator";
import { FileManager } from "../helpers/fileManager";

program.version("2.0.9").description("Ortoni Playwright Test Report CLI");

program
  .command("show-report")
  .description("Open the generated Ortoni report")
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
  .command("merge-shards")
  .description("Merge sharded reports into one final report")
  .option(
    "-d, --dir <path>",
    "Path to the folder containing shard files",
    "ortoni-report"
  )
  .option("-f, --file <filename>", "Output report file", "ortoni-report.html")
  .action(async (options) => {
    const projectRoot = process.cwd();
    const folderPath = path.resolve(projectRoot, options.dir);
    console.log("folder - " + folderPath);
    console.log(`Merging shard files in folder: ${folderPath}`);
    const filePath = path.resolve(folderPath, options.file);
    // collect all shard files
    const shardFiles = fs
      .readdirSync(folderPath)
      .filter((f) => f.startsWith("ortoni-shard-") && f.endsWith(".json"));

    if (shardFiles.length === 0) {
      console.error("❌ No shard files found to merge.");
      process.exit(1);
    }

    let allResults: any[] = [];
    let projectSet = new Set<string>();
    let totalDuration = 0;

    for (const file of shardFiles) {
      const shardData = JSON.parse(
        fs.readFileSync(path.join(folderPath, file), "utf-8")
      );
      allResults.push(...shardData.results);
      shardData.projectSet.forEach((p: string) => projectSet.add(p));
      totalDuration += shardData.duration;
    }

    const dbManager = new DatabaseManager();
    await dbManager.initialize(
      path.join(folderPath, "ortoni-data-history.sqlite")
    );

    const runId = await dbManager.saveTestRun();
    if (typeof runId === "number") {
      await dbManager.saveTestResults(runId, allResults);
    }
    const htmlGenerator = new HTMLGenerator({}, dbManager);
    const finalReportData = await htmlGenerator.generateFinalReport(
      allResults.filter((r) => r.status !== "skipped"),
      totalDuration,
      allResults,
      projectSet
    );
    const fileManager = new FileManager(folderPath);
    const outputPath = fileManager.writeReportFile(filePath, finalReportData);
    console.log(`✅ Final merged report generated at ${outputPath}`);
  });

program.parse(process.argv);
