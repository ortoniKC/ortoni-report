import fs from "fs";
import path from "path";

// Read and parse package.json safely
const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));
const { version } = pkg;

console.log(`Project Version: ${version}`);
const source = path.resolve(`ortoni-report-${version}.tgz`);
const target = `/Volumes/Koushik/GitHub/pw-test/ortoni-report-${version}.tgz`;


if (fs.existsSync(source)) {
    fs.copyFileSync(source, target);
    console.log(`✅ ortoni-report-${version}.tgz copied to ${target}`);
} else {
    console.error(`❌ Source file not found: ${source}`);
}
