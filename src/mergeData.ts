// src/mergeAllData.ts (replace existing mergeAllData)
import * as fs from "fs";
import * as path from "path";
import { DatabaseManager } from "./helpers/databaseManager";
import { HTMLGenerator } from "./helpers/HTMLGenerator";
import { FileManager } from "./helpers/fileManager";

/**
 * Merge shard JSON files into a single report while keeping ALL test results (no dedupe).
 * - options:
 *    dir?: folder where shard files exist (default: "ortoni-report")
 *    file?: output file name for final HTML (default: "ortoni-report.html")
 *    saveHistory?: boolean | undefined -> if provided, overrides shard/userConfig
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

  // deterministic sort by numeric shard index if available (optional)
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

  // Merge state (no deduplication)
  const allResults: any[] = [];
  const projectSet = new Set<string>();
  let totalDurationSum = 0; // will accumulate shard durations
  let totalDurationMax = 0; // optional: track max shard duration (wall-clock)
  let mergedUserConfig: any = null;
  let mergedUserMeta: any = null;

  for (const file of sortedFiles) {
    const fullPath = path.join(folderPath, file);
    try {
      const shardRaw = fs.readFileSync(fullPath, "utf-8");
      const shardData = JSON.parse(shardRaw);

      // validate results array
      if (!Array.isArray(shardData.results)) {
        console.warn(
          `Ortoni Report: Shard ${file} missing results array — skipping.`
        );
        badShards.push(file);
        continue;
      }

      // Append all results (keep duplicates)
      shardData.results.forEach((r: any) => allResults.push(r));

      // Merge project sets
      if (Array.isArray(shardData.projectSet)) {
        shardData.projectSet.forEach((p: string) => projectSet.add(p));
      }

      // Duration handling:
      // Primary: use shardData.duration (expected numeric)
      // Fallback: if missing/zero, sum per-test durations inside the shard
      // Convert to Number defensively.
      const shardDur = Number(shardData.duration);
      let durToAdd = 0;
      if (!isNaN(shardDur) && shardDur > 0) {
        durToAdd = shardDur;
      } else {
        // try to sum per-test duration
        const perTestSum = (
          Array.isArray(shardData.results) ? shardData.results : []
        )
          .map((t: any) => Number(t.duration) || 0)
          .reduce((a: number, b: number) => a + b, 0);
        durToAdd = perTestSum;
      }
      totalDurationSum += durToAdd;
      if (durToAdd > totalDurationMax) totalDurationMax = durToAdd;

      // Merge userConfig/userMeta as before (prefer first non-null)
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
      continue;
    }
  }

  // final results preserved as allResults
  const totalDuration = totalDurationSum;

  // Determine saveHistory flag (options override -> mergedUserConfig -> default true)
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
    // filteredResults: keep same semantics (filter out skipped for display or pass as required)
    allResults.filter((r) => r.status !== "skipped"),
    totalDuration,
    allResults,
    projectSet
  );

  // Write final HTML file
  const fileManager = new FileManager(folderPath);
  const outputFileName = options.file || "ortoni-report.html";
  const outputPath = fileManager.writeReportFile(
    outputFileName,
    finalReportData
  );

  console.log(`✅ Final merged report generated at ${outputPath}`);
  console.log(
    `✅ Shards merged: ${sortedFiles.length}, total tests merged: ${allResults.length}`
  );
  console.log(`✅ totalDuration (sum of shards) = ${totalDuration}`);
  if (runId) console.log(`✅ DB runId: ${runId}`);
}
