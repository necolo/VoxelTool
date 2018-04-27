const WebSocketServer = require('uws').Server;
import { db } from './server/db';

import createServer = require('./server');
import { SocketInterface, MessageT, RequestId } from './spec';

const wss = new WebSocketServer({port: 8002});

export class ServerSocket implements SocketInterface {
    public onmessage:MessageT[];

    constructor () {
        const self = this;
        this.onmessage = new Array(RequestId.LENGTH);
        wss.on('connection', function (ws) {
            ws.on('message', (msg) => {
                const { id, data } = JSON.parse(msg);
                self.onmessage[id](id, data);
            })
        })
    }

    public send (id:number, data:any) {
        wss.send(JSON.stringify({
            id,
            data,
        }))
    }

    public get_onmessage () : MessageT[] {
        return this.onmessage;
    }
}

const serverSocket = new ServerSocket();
createServer(serverSocket, db);