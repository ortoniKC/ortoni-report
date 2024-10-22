"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReportServer = void 0;
const express_1 = __importDefault(require("express"));
/**
 * Starts an Express server to serve the HTML report and keeps it running.
 * @param {string} reportPath - Path to the folder where the report is stored.
 * @param {string} reportFilename - Name of the HTML report file to serve.
 * @param {number} port - Port number to serve the report on (default is 8080).
 */
function startReportServer(reportPath, reportFilename, port = 8080) {
    const app = (0, express_1.default)();
    // Serve static files from the report directory
    app.use(express_1.default.static(reportPath));
    // Start the server and keep it running
    const server = app.listen(port, () => {
        const reportUrl = `http://localhost:${port}/${reportFilename}`;
        console.log(`Report is available at ${reportUrl}`);
    });
    // Ensure that the process doesn't exit prematurely
    process.on('SIGINT', () => {
        console.log('Shutting down the server...');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
    return server;
}
exports.startReportServer = startReportServer;
