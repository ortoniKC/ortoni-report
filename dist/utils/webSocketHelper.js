"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const ws_1 = __importStar(require("ws"));
const utils_1 = require("./utils");
class WebSocketHelper {
    constructor(port) {
        this.port = port;
        this.wss = null;
    }
    setupWebSocket() {
        const server = http_1.default.createServer();
        this.wss = new ws_1.WebSocketServer({ server });
        this.wss.on('connection', (ws) => {
            ws.send((0, utils_1.safeStringify)({ type: 'initial', data: 'Connected to WS service' }));
        });
        server.listen(this.port, () => {
            console.log(`WebSocket server is running on http://localhost:${this.port}`);
        });
    }
    setupCleanup() {
        const gracefulShutdown = () => {
            console.log('Shutting down WebSocket server...');
            this.closeWebSocket();
            process.exit();
        };
        process.on('exit', gracefulShutdown);
        process.on('SIGINT', () => {
            console.log('Received SIGINT. Closing WebSocket server...');
            gracefulShutdown();
        });
    }
    broadcastUpdate(tests) {
        if (this.wss) {
            this.wss.clients.forEach((client) => {
                if (client.readyState === ws_1.default.OPEN) {
                    client.send((0, utils_1.safeStringify)({ type: 'update', data: tests }));
                }
            });
        }
    }
    closeWebSocket() {
        if (this.wss) {
            this.wss.clients.forEach((client) => {
                if (client.readyState === ws_1.default.OPEN) {
                    client.close(1000, 'Test run completed');
                }
            });
            this.wss.close(() => {
                console.log('WebSocket server closed');
            });
        }
    }
    testComplete() {
        if (this.wss) {
            this.wss.clients.forEach((client) => {
                if (client.readyState === ws_1.default.OPEN) {
                    client.send((0, utils_1.safeStringify)({ type: 'complete', data: 'Test run completed' }));
                }
            });
        }
        setTimeout(() => {
            this.closeWebSocket();
        }, 1000);
    }
}
exports.default = WebSocketHelper;
