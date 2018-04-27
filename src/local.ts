import createClient = require('./client');
import createServer = require('./server');
import { 
    SocketInterface, 
    RequestId, 
    RespondListenersT, 
    MessageT,
    DBProject,
} from './spec';
import * as ClientProtocol from './client/protocol';

interface SocketHandler {
    getMessage:MessageT;
    onmessage:MessageT[];
}

class SocketHub {
    public client:SocketHandler;
    public server:SocketHandler;

    constructor () {
        this.client = this._initHandler('client');
        this.server = this._initHandler('server');


    }

    private _initHandler (_handler:string) : SocketHandler {
        const self = this;;
        return {
            onmessage: new Array(RequestId.LENGTH),

            getMessage: (id:number, data:any) => {
                console.log('get message: ', _handler, RequestId[id], data, this[_handler].onmessage);
                if (typeof this[_handler].onmessage[id] === 'function') {
                    return this[_handler].onmessage[id](id, data);
                }
                return null; 
            },
        }
    }
}

class ClientSocket implements SocketInterface {
    public hub:SocketHub;

    constructor (hub:SocketHub) {
        this.hub = hub;
    }

    public send (id:number, data:any) {
        this.hub.server.getMessage(id, data);
    }

    public get_onmessage () : MessageT[] {
        return this.hub.client.onmessage;
    }
}

class ServerSocket implements SocketInterface {
    public hub:SocketHub;

    constructor (hub:SocketHub) {
        this.hub = hub;
    }

    public send (id:number, data:any) {
        this.hub.client.getMessage(id, data);
    }

    public get_onmessage () : MessageT[] {
        return this.hub.server.onmessage;
    }
}

class DB {
    public data:{project: {[projecet:string]:DBProject}};
    
    private _value:any = null;

    constructor () {
        this.data = {
            project: {
                'default': {
                    categoryList: [],
                    voxelSpec: {},
                    id_count: 0,
                },
            }
        }
    }

    public get(msg:string) {
        console.log('get: ', msg);
        const props = msg.split('.');
        this._value = this._getValue(props, this.data, 0);
        return this;
    } 

    public value() {
        console.log('value: ', this._value);
        this._value = this.data;
        return this._value;
    }

    public push(obj) {
        console.log('push: ', obj);
        this._value.push(obj);
        return this;
    } 

    public write() {
        this._value = this.data;
        return this;        
    }

    public set(msg:string, data:any) {
        console.log('set: ', msg, data);
        const props = msg.split('.');
        const setValue = props.pop();
        const obj = this._getValue(props, this._value, 0);
        if (setValue) {
            obj[setValue] = data; 
        }
        return this;
    }

    private _getValue (props, obj, i) {
        if (i < props.length) {
            return this._getValue(props, obj[props[i]], i+1);
        } else {
            return obj;
        }
    }
}

const db = new DB();
const hub = new SocketHub();
const clientSocket = new ClientSocket(hub);
const serverSocket = new ServerSocket(hub);
createServer(serverSocket, db);
createClient(clientSocket);