import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

// Path to the result.html file
const resultHtmlPath = join(__dirname, 'result.html');

// Check if the result.html file exists
if (!existsSync(resultHtmlPath)) {
    console.error('Error: result.html not found.');
    process.exit(1);
}

// Function to start the HTTP server
function startServer() {
    const serverCommand = 'http-server'; // The command to start the server

    console.log('Starting HTTP server...');
    execSync(`${serverCommand} -p 8080`, { stdio: 'inherit' }); // Start the server on port 8080
}

// Function to open the result.html file in the browser
function openReport() {
    const openCommand = `start http://localhost:8080/${resultHtmlPath.split('/').pop()}`; // Adjust for OS

    console.log('Opening report in the browser...');
    execSync(openCommand, { stdio: 'inherit' }); // Open the report in the default browser
}

// Start the server and open the report
startServer();
openReport();
