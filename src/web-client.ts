import WebSocket = require('uws');

import createClient = require('./client');
import { SocketInterface, MessageT } from './spec';
import { onrespond } from './client/protocol';

export const ws = new WebSocket(
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`,
)


export class ClientSocket implements SocketInterface{
    constructor () {
        ws.on('message', (msg) => {
            const { id, data } = JSON.parse(msg);
            const actions = onrespond[id];  
            for (let action of actions) {
                action(data, this);
            }
        });
    }

    public send (id:number, data:any) {
        ws.send(JSON.stringify({
            id,
            data,
        }));
    }

    public set_onmessage (onmessage:MessageT[]) {

    }
}

const socket = new ClientSocket();
createClient(socket);
