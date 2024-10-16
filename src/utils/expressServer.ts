import express from "express";
import path from "path";

export function startReportServer(reportFolder: string, reportFilename: string, port = 8080) {
  const app = express();

  const projectRoot = path.resolve(process.cwd());
  app.use(express.static(projectRoot));

  app.get('/', (req, res) => {
    res.sendFile(path.resolve(reportFolder, reportFilename));
  });

  const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });

  server.on('error', (error: { code: string }) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Trying a different port...`);
      startReportServer(reportFolder, reportFilename, port + 1);
    } else {
      console.error("Server error:", error);
    }
  });
}
