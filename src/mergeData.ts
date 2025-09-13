// src/mergeAllData.ts
import * as fs from "fs";
import * as path from "path";
import { DatabaseManager } from "./helpers/databaseManager";
import { HTMLGenerator } from "./helpers/HTMLGenerator";
import { FileManager } from "./helpers/fileManager";

/**
 * Merge shard JSON files into a single report while keeping ALL test results.
 *
 * options:
 *  - dir?: folder where shard files exist (default: "ortoni-report")
 *  - file?: output file name for final HTML (default: "ortoni-report.html")
 *  - saveHistory?: boolean | undefined -> if provided, overrides shard/userConfig
 */
export async function mergeAllData(
  options: { dir?: string; file?: string; saveHistory?: boolean } = {}
) {
  const folderPath = options.dir || "ortoni-report";
  console.info(`Ortoni Report: Merging shard files in folder: ${folderPath}`);

  if (!fs.existsSync(folderPath)) {
    console.error(`Ortoni Report: folder "${folderPath}" does not exist.`);
    process.exitCode = 1;
    return;
  }

  const filenames = fs
    .readdirSync(folderPath)
    .filter((f) => f.startsWith("ortoni-shard-") && f.endsWith(".json"));

  if (filenames.length === 0) {
    console.error("Ortoni Report: ❌ No shard files found to merge.");
    process.exitCode = 1;
    return;
  }

  // deterministic sort by numeric shard index if available (ortoni-shard-<current>-of-<total>.json)
  const shardFileIndex = (name: string): number | null => {
    const m = name.match(/ortoni-shard-(\d+)-of-(\d+)\.json$/);
    return m ? parseInt(m[1], 10) : null;
  };

  const sortedFiles = filenames
    .map((f) => ({ f, idx: shardFileIndex(f) }))
    .sort((a, b) => {
      if (a.idx === null && b.idx === null) return a.f.localeCompare(b.f);
      if (a.idx === null) return 1;
      if (b.idx === null) return -1;
      return (a.idx as number) - (b.idx as number);
    })
    .map((x) => x.f);

  // Merge state
  const allResults: any[] = []; // keep every test entry from every shard
  const projectSet = new Set<string>();
  let totalDurationSum = 0; // sum of shard durations (ms)
  let totalDurationMax = 0; // max of shard durations (ms) (optional)
  let mergedUserConfig: any = null;
  let mergedUserMeta: any = null;
  const badShards: string[] = [];
  const shardCounts: Record<string, number> = {};
  const shardDurMap: Record<string, number> = {}; // used duration per shard (ms)

  for (const file of sortedFiles) {
    const fullPath = path.join(folderPath, file);
    try {
      const shardRaw = fs.readFileSync(fullPath, "utf-8");
      const shardData = JSON.parse(shardRaw);

      // Validate results array
      if (!Array.isArray(shardData.results)) {
        console.warn(
          `Ortoni Report: Shard ${file} missing results array — skipping.`
        );
        badShards.push(file);
        continue;
      }

      // Append all results (keep duplicates)
      shardData.results.forEach((r: any) => allResults.push(r));
      shardCounts[file] = shardData.results.length;

      // Merge project sets
      if (Array.isArray(shardData.projectSet)) {
        shardData.projectSet.forEach((p: string) => projectSet.add(p));
      }

      // Duration handling:
      // Accept shardData.duration when it is a number (including 0).
      // Fallback: if shardData.duration is missing or not a number, sum per-test durations inside the shard.
      const rawShardDur = shardData.duration;
      let durToAdd = 0;
      let perTestSum = 0;

      if (typeof rawShardDur === "number") {
        // Accept numeric durations (including 0)
        durToAdd = rawShardDur;
      } else {
        // fallback: sum per-test durations (coerce to Number)
        perTestSum = Array.isArray(shardData.results)
          ? shardData.results.reduce(
              (acc: number, t: any) => acc + (Number(t?.duration) || 0),
              0
            )
          : 0;
        durToAdd = perTestSum;
      }

      // accumulate
      totalDurationSum += durToAdd;
      if (durToAdd > totalDurationMax) totalDurationMax = durToAdd;
      shardDurMap[file] = durToAdd;

      // Merge userConfig/userMeta conservatively (prefer first non-empty value)
      if (shardData.userConfig) {
        if (!mergedUserConfig) mergedUserConfig = { ...shardData.userConfig };
        else {
          Object.keys(shardData.userConfig).forEach((k) => {
            if (
              mergedUserConfig[k] === undefined ||
              mergedUserConfig[k] === null ||
              mergedUserConfig[k] === ""
            ) {
              mergedUserConfig[k] = shardData.userConfig[k];
            } else if (shardData.userConfig[k] !== mergedUserConfig[k]) {
              console.warn(
                `Ortoni Report: userConfig mismatch for key "${k}" between shards. Using first value "${mergedUserConfig[k]}".`
              );
            }
          });
        }
      }

      if (shardData.userMeta) {
        if (!mergedUserMeta) mergedUserMeta = { ...shardData.userMeta };
        else {
          mergedUserMeta.meta = {
            ...(mergedUserMeta.meta || {}),
            ...(shardData.userMeta.meta || {}),
          };
        }
      }
    } catch (err) {
      console.error(`Ortoni Report: Failed to parse shard ${file}:`, err);
      badShards.push(file);
      continue;
    }
  } // end for each shard

  if (badShards.length > 0) {
    console.warn(
      `Ortoni Report: Completed merge with ${badShards.length} bad shard(s) skipped:`,
      badShards
    );
  }

  // final results preserved with duplicates
  const totalDuration = totalDurationSum; // in ms

  // Determine whether to persist history:
  // Priority: explicit options.saveHistory -> mergedUserConfig.saveHistory -> default true
  const saveHistoryFromOptions =
    typeof options.saveHistory === "boolean" ? options.saveHistory : undefined;
  const saveHistoryFromShard =
    mergedUserConfig && typeof mergedUserConfig.saveHistory === "boolean"
      ? mergedUserConfig.saveHistory
      : undefined;
  const saveHistory = saveHistoryFromOptions ?? saveHistoryFromShard ?? true;

  let dbManager: DatabaseManager | undefined;
  let runId: number | undefined;

  if (saveHistory) {
    try {
      dbManager = new DatabaseManager();
      const dbPath = path.join(folderPath, "ortoni-data-history.sqlite");
      await dbManager.initialize(dbPath);
      runId = await dbManager.saveTestRun();
      if (typeof runId === "number") {
        // Save all results (your saveTestResults may batch internally)
        await dbManager.saveTestResults(runId, allResults);
        console.info(
          `Ortoni Report: Saved ${allResults.length} results to DB (runId=${runId}).`
        );
      } else {
        console.warn(
          "Ortoni Report: Failed to create test run in DB; proceeding without saving results."
        );
      }
    } catch (err) {
      console.error(
        "Ortoni Report: Error while saving history to DB. Proceeding without DB:",
        err
      );
      dbManager = undefined;
      runId = undefined;
    }
  } else {
    console.info(
      "Ortoni Report: Skipping history save (saveHistory=false). (Typical for CI runs)"
    );
  }

  // Generate final report
  const htmlGenerator = new HTMLGenerator(
    { ...(mergedUserConfig || {}), meta: mergedUserMeta?.meta },
    dbManager
  );
  const finalReportData = await htmlGenerator.generateFinalReport(
    // filteredResults: typically filter out skipped for display (keeps existing behavior)
    allResults.filter((r) => r.status !== "skipped"),
    totalDuration,
    allResults,
    projectSet // pass Set<string> as original generateFinalReport expects
  );

  // Write final HTML file
  const fileManager = new FileManager(folderPath);
  const outputFileName = options.file || "ortoni-report.html";
  const outputPath = fileManager.writeReportFile(
    outputFileName,
    finalReportData
  );

  // Logs & debugging summary
  console.log(`✅ Final merged report generated at ${await outputPath}`);
  console.log(`✅ Shards merged: ${sortedFiles.length}`);
  console.log(`✅ Tests per shard:`, shardCounts);
  console.log(`✅ Total tests merged ${allResults.length}`);
}
