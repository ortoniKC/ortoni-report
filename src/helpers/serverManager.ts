import { OrtoniReportConfig } from "../types/reporterConfig";
import { startReportServer } from "../utils/expressServer";

export class ServerManager {
  constructor(private ortoniConfig: OrtoniReportConfig) {}

  startServer(
    folderPath: string,
    outputFilename: string,
    overAllStatus: string | undefined
  ) {
    const openOption = this.ortoniConfig.open || "never";
    const hasFailures = overAllStatus === "failed";
    if (
      openOption === "always" ||
      (openOption === "on-failure" && hasFailures)
    ) {
      startReportServer(
        folderPath,
        outputFilename,
        this.ortoniConfig.port,
        openOption
      );
    }
  }
}
