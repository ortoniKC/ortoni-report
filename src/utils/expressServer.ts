import express from "express";
import path from "path";
import { spawn } from "child_process";

export function startReportServer(
  reportFolder: string,
  reportFilename: string,
  port = 2004,
  open: string | undefined,
) {
  const app = express();
  app.use(express.static(reportFolder));

  app.get('/', (_req, res) => {
    try {
      res.sendFile(path.resolve(reportFolder, reportFilename));
    } catch (error) {
      console.error("Ortoni-Report: Error sending report file:", error);
      res.status(500).send("Error loading report");
    }
  });

  try {
    const server = app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);

      if (open === "always" || open === "on-failure") {
        try {
          openBrowser(`http://localhost:${port}`);
        } catch (error) {
          console.error("Ortoni-Report: Error opening browser:", error);
        }
      }
    });

    server.on('error', (error: { code: string }) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Ortoni-Report: Port ${port} is already in use. Trying a different port...`);
      } else {
        console.error("Ortoni-Report: Server error:", error);
      }
    });
  } catch (error) {
    console.error("Ortoni-Report: Error starting the server:", error);
  }
}

function openBrowser(url: string) {
  const platform = process.platform;
  let command: string;
  try {
    if (platform === "win32") {
      command = "cmd";
      spawn(command, ['/c', 'start', url]);
    } else if (platform === "darwin") {
      command = "open";
      spawn(command, [url]);
    } else {
      command = "xdg-open";
      spawn(command, [url]);
    }
  } catch (error) {
    console.error("Ortoni-Report: Error opening the browser:", error);
  }
}
