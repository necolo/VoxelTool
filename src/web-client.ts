import WebSocket = require('uws');

import createClient = require('./client');
import { SocketInterface, MessageT, RequestId } from './spec';

export const ws = new WebSocket(
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`,
)


export class ClientSocket implements SocketInterface{
    public onmessage:MessageT[];

    constructor () {
        const self = this;
        this.onmessage = new Array(RequestId.LENGTH);
        ws.on('message', (msg) => {
            const { id, data } = JSON.parse(msg);
            self.onmessage[id](id, data);
        });
    }

    public send (id:number, data:any) {
        ws.send(JSON.stringify({
            id,
            data,
        }));
    }

    public get_onmessage () : MessageT[] {
        return this.onmessage;
    }
}

const socket = new ClientSocket();
createClient(socket);
