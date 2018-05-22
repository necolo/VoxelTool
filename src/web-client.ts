import createClient = require('./client');
import { SocketInterface, MessageT, RequestId, MessageHandler } from './spec';

export const ws = new WebSocket(
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`,
)

export class ClientSocket implements SocketInterface{
    public onmessage:MessageHandler<any>[];

    constructor () {
        const self = this;
        this.onmessage = new Array(RequestId.LENGTH);
        
        ws.addEventListener('open', (event) => {
            createClient(socket);
            ws.addEventListener('message', (event) => {
                const { id, data } = JSON.parse(event.data);
                self.onmessage[id](id, data);
            })
        })
    }

    public send (id:number, data:any) {
        ws.send(JSON.stringify({
            id,
            data,
        }));
    }

    public sub (id:number, handler:MessageHandler<any>) {
        this.onmessage[id] = handler;
    }

    public unsub (id:number, index:number) {
        this.onmessage[id] = () => {};
    }
}

const socket = new ClientSocket();