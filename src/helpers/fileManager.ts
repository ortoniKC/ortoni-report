import fs from "fs";
import path from "path";
export class FileManager {
  constructor(private folderPath: string) { }

  ensureReportDirectory() {
    const ortoniDataFolder = path.join(this.folderPath, 'ortoni-data');
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
    return fs.readFileSync(path.resolve(__dirname, "style", "main.css"), "utf-8");
  }
}