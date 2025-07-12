import fs from "fs";
import path from "path";
export class FileManager {
  constructor(private folderPath: string) {}

  ensureReportDirectory() {
    const ortoniDataFolder = path.join(this.folderPath, "ortoni-data");
    if (!fs.existsSync(this.folderPath)) {
      fs.mkdirSync(this.folderPath, { recursive: true });
    } else {
      if (fs.existsSync(ortoniDataFolder)) {
        fs.rmSync(ortoniDataFolder, { recursive: true, force: true });
      }
    }
  }

  writeReportFile(filename: string, content: string): string {
    const outputPath = path.join(process.cwd(), this.folderPath, filename);
    fs.writeFileSync(outputPath, content);
    return outputPath;
  }

  readCssContent(): string {
    return fs.readFileSync(
      path.resolve(__dirname, "style", "main.css"),
      "utf-8"
    );
  }

  copyTraceViewerAssets(skip: boolean) {
    if (skip) return;
    const traceViewerFolder = path.join(
      require.resolve("playwright-core"),
      "..",
      "lib",
      "vite",
      "traceViewer"
    );
    const traceViewerTargetFolder = path.join(this.folderPath, "trace");
    const traceViewerAssetsTargetFolder = path.join(
      traceViewerTargetFolder,
      "assets"
    );

    fs.mkdirSync(traceViewerAssetsTargetFolder, { recursive: true });

    // Copy main trace viewer files
    for (const file of fs.readdirSync(traceViewerFolder)) {
      if (
        file.endsWith(".map") ||
        file.includes("watch") ||
        file.includes("assets")
      )
        continue;
      fs.copyFileSync(
        path.join(traceViewerFolder, file),
        path.join(traceViewerTargetFolder, file)
      );
    }

    // Copy assets
    const assetsFolder = path.join(traceViewerFolder, "assets");
    for (const file of fs.readdirSync(assetsFolder)) {
      if (file.endsWith(".map") || file.includes("xtermModule")) continue;
      fs.copyFileSync(
        path.join(assetsFolder, file),
        path.join(traceViewerAssetsTargetFolder, file)
      );
    }
  }
}
