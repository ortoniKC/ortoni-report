import express from "express";
import path from "path";
import { spawn } from "child_process";


export function startReportServer(
  reportFolder: string,
  reportFilename: string,
  port = 8080,
  open: string | undefined,
) {
  const app = express();
  app.use(express.static(reportFolder));

  app.get('/', (req, res) => {
    res.sendFile(path.resolve(reportFolder, reportFilename));
  });

  const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);

    if (open === "always" || (open === "on-failure")) {
      openBrowser(`http://localhost:${port}`);
    }
  });

  server.on('error', (error: { code: string }) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Trying a different port...`);
      startReportServer(reportFolder, reportFilename, port + 1, open);
    } else {
      console.error("Server error:", error);
    }
  });
}

function openBrowser(url: string) {
  const platform = process.platform;
  let command: string;
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
}