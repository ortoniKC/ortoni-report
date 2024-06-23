"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.normalizeFilePath = exports.msToTime = void 0;
const path_1 = __importDefault(require("path"));
function msToTime(duration) {
    const milliseconds = Math.floor((duration % 1000));
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    let result = '';
    if (hours > 0) {
        result += (hours < 10 ? "0" + hours : hours) + "h:";
    }
    if (minutes > 0 || hours > 0) { // Include minutes if hours are included
        result += (minutes < 10 ? "0" + minutes : minutes) + "m:";
    }
    if (seconds > 0 || minutes > 0 || hours > 0) { // Include seconds if minutes or hours are included
        result += (seconds < 10 ? "0" + seconds : seconds) + "s";
    }
    if (milliseconds > 0) {
        result += ":" + (milliseconds < 100 ? "0" + milliseconds : milliseconds) + "ms";
    }
    return result;
}
exports.msToTime = msToTime;
function normalizeFilePath(filePath) {
    // Normalize the path to handle different separators
    const normalizedPath = path_1.default.normalize(filePath);
    // Get the base name of the file (removes any leading directories)
    return path_1.default.basename(normalizedPath);
}
exports.normalizeFilePath = normalizeFilePath;
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString();
    return `${day}-${month}-${year} ${time}`;
}
exports.formatDate = formatDate;
;
