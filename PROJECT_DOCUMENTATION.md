# Ortoni Report Project Documentation

## Project Overview

**Ortoni Report** is a comprehensive HTML report generator designed specifically for Playwright test suites. It provides visually appealing, feature-rich reports with advanced analytics, debugging tools, and AI-powered insights to simplify test result analysis and management.

### Key Features

- **Visual Reports**: Clean, navigable HTML reports with dashboards, test details, analytics, and more.
- **Sharding Support**: Merge multiple parallel/sharded test runs into a single consolidated report.
- **History Tracking**: SQLite-based persistence of test runs for trends and analytics.
- **AI Integration**: "Suggest Fix" feature using LLMs (OpenAI, Gemini, Claude, Ollama).
- **CLI Tools**: Commands to view reports and merge shards.
- **Customization**: Themes, branding, metadata, and flexible configurations.

### Tech Stack

- **Language**: TypeScript
- **Build Tool**: tsup (for CJS/ESM bundles)
- **UI**: [React + Shadcn UI](https://github.com/ortoniKC/ortoni-report-react) (for the HTML report interface)
- **Database**: SQLite (for history and analytics)
- **Server**: Express (for local report serving)
- **Dependencies**: Playwright, Commander (CLI), Express, SQLite3, etc.

### Repository

- **GitHub**: https://github.com/ortoniKC/ortoni-report
- **Author**: Koushik Chatterjee (LetCode with Koushik)
- **License**: GPL-3.0-only

## Architecture

Ortoni Report operates as a Playwright custom reporter with additional CLI utilities. The architecture is modular, separating concerns into reporters, helpers, utilities, and types.

### High-Level Flow

1. **Reporter Integration**: Hooks into Playwright's test lifecycle (onBegin, onTestEnd, onEnd, onExit).
2. **Data Processing**: Processes test results, attachments (screenshots, videos, traces), and metadata.
3. **Report Generation**: Generates HTML reports or shard JSON files.
4. **Persistence**: Optionally saves data to SQLite for history/analytics.
5. **Serving**: Starts a local Express server to view reports.
6. **UI**: UI is handled [here](https://github.com/ortoniKC/ortoni-report-react)

### Directory Structure

```
src/
├── cli.ts                 # CLI entry point (Commander.js commands)
├── ortoni-report.ts       # Main Playwright reporter class
├── mergeData.ts           # Logic for merging shard reports
├── helpers/               # Core business logic modules
│   ├── databaseManager.ts # SQLite operations for history
│   ├── fileManager.ts     # File I/O for reports/assets
│   ├── HTMLGenerator.ts   # HTML report generation
│   ├── resultProcessor.ts # Test result parsing
│   ├── serverManager.ts   # Express server management
│   ├── markdownConverter.ts
│   └── templateLoader.ts
├── types/                 # TypeScript interfaces
│   ├── reporterConfig.ts  # Configuration options
│   └── testResults.ts     # Test data structures
└── utils/                 # Utility functions
    ├── attachFiles.ts
    ├── expressServer.ts
    ├── groupProjects.ts
    ├── utils.ts
    └── ...
```

### Key Classes and Interfaces

- **OrtoniReport**: Main reporter implementing Playwright's `Reporter` interface.
- **OrtoniReportConfig**: Configuration interface for customization.
- **TestResultData**: Structure for individual test results.
- **DatabaseManager**: Handles SQLite interactions for history.
- **HTMLGenerator**: Builds the final HTML report with analytics.

## Key Components

### 1. Reporter (ortoni-report.ts)

- Implements Playwright's reporter lifecycle.
- Handles sharding: In shard mode, writes JSON files instead of full HTML.
- Processes test results, saves to DB, generates reports, and starts server.

### 2. CLI (cli.ts)

- Uses Commander.js for command-line interface.
- Commands:
  - `show-report`: Serve existing report via Express.
  - `merge-report`: Merge shard JSONs into final HTML.

### 3. Merge Logic (mergeData.ts)

- Combines shard files deterministically.
- Handles duration summation, config merging, and history saving.
- Priority for `saveHistory`: options > shard config > default true.

### 4. Database Manager (helpers/databaseManager.ts)

- Manages SQLite DB for test run history.
- Saves/retrieves runs, results, summaries, trends, flaky/slow tests.

### 5. HTML Generator (helpers/HTMLGenerator.ts)

- Prepares data for the React-based UI.
- Fetches analytics from DB if available.

### 6. File Manager (helpers/fileManager.ts)

- Handles file writing, directory creation, asset copying.

### 7. Server Manager (helpers/serverManager.ts)

- Starts Express server for local report viewing.

### 8. Result Processor (helpers/resultProcessor.ts)

- Parses Playwright test data into `TestResultData`.

## Setup and Installation

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- Playwright project

### Installation

```bash
npm install -g ortoni-report
# or
npm install ortoni-report --save-dev
```

### Configuration in Playwright

Add to `playwright.config.ts`:

```typescript
import { OrtoniReportConfig } from "ortoni-report";

const config: OrtoniReportConfig = {
  open: "always", // or "never", "on-failure"
  folderPath: "ortoni-report",
  filename: "index.html",
  title: "My Test Report",
  projectName: "My Project",
  base64Image: false,
  saveHistory: true,
  meta: { Environment: "QA" },
};

export default defineConfig({
  reporter: [["ortoni-report", config]],
});
```

## Usage

### Running Tests

```bash
npx playwright test
```

Reports generate automatically based on config.

### CLI Commands

#### Show Report

```bash
npx ortoni-report show-report --dir ortoni-report --file index.html --port 2004
```

Starts server at http://localhost:2004.

#### Merge Reports

```bash
npx ortoni-report merge-report --dir ortoni-report --file merged.html --save-history
```

Merges shards and generates final report.

### Sharding

For parallel runs, Playwright shards produce JSON files. Use `merge-report` to combine.

## Contributing Guidelines

### Getting Started

1. Fork the repo.
2. Clone: `git clone https://github.com/your-username/ortoni-report.git`
3. Install deps: `npm install`
4. Build: `npm run build`

### Development Workflow

- **Code Style**: TypeScript, follow existing patterns.
- **Testing**: Run tests in `tests/` with Playwright.
- **Linting**: Use ESLint/Prettier if configured.
- **Commits**: Descriptive messages, follow conventional commits.

### Key Areas for Contribution

- **UI Enhancements**: Improve React components in the HTML report.
- **New Features**: Add analytics, integrations (e.g., more LLMs).
- **Bug Fixes**: Address issues in GitHub.
- **Documentation**: Update README, add examples.

### Building and Releasing

- **Build**: `npm run build` (uses tsup for CJS/ESM).
- **Pack**: `npm run pack` for local testing.
- **Release**: `npm run release` (publishes to npm).

### Pull Requests

- Test thoroughly.
- Update CHANGELOG.md.
- Ensure backward compatibility.
- Reference issues.

## Build and Deployment

### Build Process

- **TypeScript**: Compiled with `tsc` (config in tsconfig.json).
- **Bundling**: tsup bundles to `dist/` (CJS and ESM).
- **Entry Points**: `src/ortoni-report.ts` and `src/cli.ts`.
- **Externals**: Playwright, SQLite, Express, etc., not bundled.

### Scripts

- `npm run tsc`: Type check.
- `npm run build`: Full build.
- `npm run release`: Publish to npm.

## Testing

### Test Files

- Recommend to have a sepearate project to create test
- Located in `tests/`: `demo-todo-app.spec.ts`, `example.spec.ts`.
- Run with Playwright: `npx playwright test`.

### Validation

- After changes, run tests to ensure reporter works.
- Test sharding and merging manually.

### Coverage

- No explicit coverage tool mentioned; rely on Playwright's test runs.
- Need to add unit testing

## Dependencies and Ecosystem

### Peer Dependencies

- `@playwright/test`: ^1.58.0
- `ansi-to-html`, `commander`, `express`, `sqlite3`, etc.

### Dev Dependencies

- TypeScript, tsup, @types/\*.

### External Integrations

- LLMs: OpenAI, Gemini, Claude, Ollama.
- Trace Viewer: Playwright's built-in.

## Future Enhancements

- Export to PDF/other formats.
- Direct JIRA integration for bug creation based on LLM description
- Cloud storage for longer history availability and live dashboad
- Report with index if multiple markets/env project dependents present (project specific)

## Support and Community

- **Issues**: https://github.com/ortoniKC/ortoni-report/issues
- **Discussions**: GitHub repo.
- **Author**: Koushik Chatterjee (ortoni@axl UPI, buymeacoffee.com/letcode)
