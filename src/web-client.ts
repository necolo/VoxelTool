import WebSocket = require('uws');

import createClient = require('./client');
import { SocketInterface, MessageT, RequestId, MessageHandler } from './spec';

export const ws = new WebSocket(
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`,
)


export class ClientSocket implements SocketInterface{
    public onmessage:MessageHandler<any>[][];

    constructor () {
        const self = this;
        this.onmessage = new Array(RequestId.LENGTH);
        for (let i = 0; i < this.onmessage.length; i++) {
            this.onmessage[i] = [];
        }

        ws.on('message', (msg) => {
            const { id, data } = JSON.parse(msg);
            for (let i = 0; i < self.onmessage[id].length; i++) {
                self.onmessage[id][i](id, data);
            }
        });
    }

    public send (id:number, data:any) {
        ws.send(JSON.stringify({
            id,
            data,
        }));
    }

    public sub (id:number, handler:MessageHandler<any>) : number {
        return this.onmessage[id].push(handler);
    }

    public unsub (id:number, index:number) {
        this.onmessage[id].splice(index, 1);
    }
}

const socket = new ClientSocket();
createClient(socket);