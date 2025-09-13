import * as fs from "fs";
import * as path from "path";
import { DatabaseManager } from "./helpers/databaseManager";
import { HTMLGenerator } from "./helpers/HTMLGenerator";
import { FileManager } from "./helpers/fileManager";

/**
 * Merge shard JSON files into a single report.
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

  // deterministic sort by numeric shard index if available
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
  const dedupeByTestId = true;
  const resultsById = new Map<string, any>();
  const projectSet = new Set<string>();
  let totalDurationSum = 0;
  let totalDurationMax = 0;
  let mergedUserConfig: any = null;
  let mergedUserMeta: any = null;
  const badShards: string[] = [];

  for (const file of sortedFiles) {
    const fullPath = path.join(folderPath, file);
    try {
      const shardRaw = fs.readFileSync(fullPath, "utf-8");
      const shardData = JSON.parse(shardRaw);

      if (!Array.isArray(shardData.results)) {
        console.warn(
          `Ortoni Report: Shard ${file} missing results array — skipping.`
        );
        badShards.push(file);
        continue;
      }

      for (const r of shardData.results) {
        const id = r.key;
        //  || `${r.filePath}:${r.projectName}:${r.title}`;
        if (dedupeByTestId) {
          if (!resultsById.has(id)) {
            resultsById.set(id, r);
          } else {
            // Keep first occurrence; log duplicate
            console.info(
              `Ortoni Report: Duplicate test ${id} found in ${file} — keeping first occurrence.`
            );
          }
        } else {
          // keep all by synthetic key
          resultsById.set(`${id}::${Math.random().toString(36).slice(2)}`, r);
        }
      }

      if (Array.isArray(shardData.projectSet)) {
        for (const p of shardData.projectSet) projectSet.add(p);
      }

      const dur = Number(shardData.duration) || 0;
      totalDurationSum += dur;
      if (dur > totalDurationMax) totalDurationMax = dur;

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
  }

  if (badShards.length > 0) {
    console.warn(
      `Ortoni Report: Completed merge with ${badShards.length} bad shard(s) skipped:`,
      badShards
    );
  }

  const allResults = Array.from(resultsById.values());
  const totalDuration = totalDurationSum; // keep legacy behavior (sum). Use totalDurationMax if you prefer wall-clock.

  // Determine whether to persist history:
  // Priority: explicit options.saveHistory (if defined) -> mergedUserConfig.saveHistory (if present) -> default true
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
        // save all results (this function may already batch internally)
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
    allResults.filter((r) => r.status !== "skipped"),
    totalDuration,
    allResults,
    projectSet
  );

  // Write final HTML file
  const fileManager = new FileManager(folderPath);
  const outputFileName = options.file || "ortoni-report.html";
  const outputPath = await fileManager.writeReportFile(
    outputFileName,
    finalReportData
  );

  console.log(`✅ Final merged report generated at ${outputPath}`);
  if (runId) console.log(`✅ DB runId: ${runId}`);
}
