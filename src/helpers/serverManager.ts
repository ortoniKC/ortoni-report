import { OrtoniReportConfig } from "../types/reporterConfig";
import { startReportServer } from "../utils/expressServer";

export class ServerManager {
  constructor(private ortoniConfig: OrtoniReportConfig) {}

  async startServer(
    folderPath: string,
    outputFilename: string,
    overAllStatus: string | undefined
  ) {
    const openOption = this.ortoniConfig.open || "never";
    const hasFailures = overAllStatus === "failed";
    const isCI = !!process.env.CI;
    if (
      !isCI &&
      (openOption === "always" || (openOption === "on-failure" && hasFailures))
    ) {
      startReportServer(
        folderPath,
        outputFilename,
        this.ortoniConfig.port,
        openOption
      );
      await new Promise((_resolve) => {});
    } else if (isCI && openOption !== "never") {
      console.info(
        "Ortoni Report: 'open' option ignored because process is running in CI."
      );
    }
  }
}
