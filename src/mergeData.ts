import * as fs from "fs";
import * as path from "path";
import { DatabaseManager } from "./helpers/databaseManager";
import { HTMLGenerator } from "./helpers/HTMLGenerator";
import { FileManager } from "./helpers/fileManager";

export async function mergeAllData(options: { dir?: string; file?: string }) {
  const folderPath = options.dir || "ortoni-report";
  console.info(`Ortoni Report: Merging shard files in folder: ${folderPath}`);

  const shardFiles = fs
    .readdirSync(folderPath)
    .filter((f) => f.startsWith("ortoni-shard-") && f.endsWith(".json"));

  if (shardFiles.length === 0) {
    console.error("Ortoni Report: ❌ No shard files found to merge.");
    process.exit(1);
  }

  let allResults: any[] = [];
  let projectSet = new Set<string>();
  let totalDuration = 0;
  let mergedUserConfig: any = null;
  let mergedUserMeta: any = null;

  for (const file of shardFiles) {
    const shardData = JSON.parse(
      fs.readFileSync(path.join(folderPath, file), "utf-8")
    );

    // merge test results
    allResults.push(...shardData.results);

    // merge project sets
    shardData.projectSet.forEach((p: string) => projectSet.add(p));

    // sum durations
    totalDuration += shardData.duration;

    // take config and meta from the first shard
    if (!mergedUserConfig && shardData.userConfig)
      mergedUserConfig = shardData.userConfig;
    if (!mergedUserMeta && shardData.userMeta)
      mergedUserMeta = shardData.userMeta;
  }

  // initialize database
  const dbManager = new DatabaseManager();
  await dbManager.initialize(
    path.join(folderPath, "ortoni-data-history.sqlite")
  );

  // save merged results to DB
  const runId = await dbManager.saveTestRun();
  if (typeof runId === "number") {
    await dbManager.saveTestResults(runId, allResults);
  } else {
    console.error("Ortoni Report: ❌ Failed to save test run to database.");
  }

  // generate final HTML report
  const htmlGenerator = new HTMLGenerator(
    { ...mergedUserConfig, meta: mergedUserMeta?.meta },
    dbManager
  );

  const finalReportData = await htmlGenerator.generateFinalReport(
    allResults.filter((r) => r.status !== "skipped"),
    totalDuration,
    allResults,
    projectSet
  );

  // write final report file
  const fileManager = new FileManager(folderPath);
  // fileManager.ensureReportDirectory();
  const outputFileName = options.file || "ortoni-report.html";
  const outputPath = fileManager.writeReportFile(
    outputFileName,
    finalReportData
  );

  console.log(`✅ Final merged report generated at ${outputPath}`);
}
