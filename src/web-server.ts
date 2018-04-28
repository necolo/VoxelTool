const WebSocketServer = require('uws').Server;
import { db } from './server/db';

import createServer = require('./server');
import {
    SocketInterface, 
    RequestId,
    MessageHandler,
} from './spec';

const wss = new WebSocketServer({port: 8002});

export class ServerSocket implements SocketInterface {
    public onmessage:MessageHandler<any>[][];

    constructor () {
        const self = this;
        this.onmessage = new Array(RequestId.LENGTH);
        for (let i = 0; i < this.onmessage.length; i ++) {
            this.onmessage[i] = [];
        }

        wss.on('connection', function (ws) {
            ws.on('message', (msg) => {
                const { id, data } = JSON.parse(msg);
                for (let i = 0; i < self.onmessage[id].length; i ++) {
                    self.onmessage[id][i](id, data);
                }
            })
        })
    }

    public send (id:number, data:any) {
        wss.send(JSON.stringify({
            id,
            data,
        }))
    }

    public sub (id:number, handler:MessageHandler<any>) : number {
        return this.onmessage[id].push(handler);
    }

    public unsub (id:number, index:number) {
        this.onmessage[id].splice(index, 1);
    }
}

const serverSocket = new ServerSocket();
createServer(serverSocket, db);