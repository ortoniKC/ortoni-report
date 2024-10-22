import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { safeStringify } from '../utils/utils';

class WebSocketHelper {
    private wss: WebSocketServer | null = null;

    constructor(private port: number) { }

    setupWebSocket() {
        const server = http.createServer();
        this.wss = new WebSocketServer({ server });
        this.wss.on('connection', (ws: WebSocket) => {
            ws.send(safeStringify({ type: 'initial', data: 'Connected to WS service' }));
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

    broadcastUpdate(tests: Record<string, any>) {
        if (this.wss) {
            this.wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(safeStringify({ type: 'update', data: tests }));
                }
            });
        }
    }

    private closeWebSocket() {
        if (this.wss) {
            this.wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
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
                if (client.readyState === WebSocket.OPEN) {
                    client.send(safeStringify({ type: 'complete', data: 'Test run completed' }));
                }
            });
        }
        setTimeout(() => {
            this.closeWebSocket();
        }, 1000);
    }
}

export default WebSocketHelper;
