import createClient = require('./client');
import createServer = require('./server');
import { 
    SocketInterface, 
    RequestId, 
    MessageT,
    DBProject,
    MessageHandler,
} from './spec';

interface SocketHandler {
    onmessage:MessageHandler<any>[];
    sub:(id:number, handler:MessageHandler<any>) => void;
    notify:(id:number, data:any) => void;
    unsub:(id:number, index:number) => void;
}

class SocketHub {
    public client:SocketHandler;
    public server:SocketHandler;

    constructor () {
        this.client = this._initHandler('client');
        this.server = this._initHandler('server');
    }

    private _initHandler (target:'client'|'server') : SocketHandler {
        return {
            onmessage: new Array(RequestId.LENGTH),
            sub: (id:number, handler:MessageHandler<any>) => {
                this[target].onmessage[id] = handler;   
            },
            notify: (id:number, data:any) => {
                this[target].onmessage[id](id, data);
            },
            unsub: (id:number, index:number) => {
                this[target].onmessage[id] = () => {}; 
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
        this.hub.server.notify(id, data);
    }

    public sub (id:number, handler:MessageHandler<any>) {
        this.hub.client.sub(id, handler);
    }

    public unsub (id:number, index:number) {
        this.hub.client.unsub(id, index);
    }
}

class ServerSocket implements SocketInterface {
    public hub:SocketHub;

    constructor (hub:SocketHub) {
        this.hub = hub;
    }

    public send (id:number, data:any) {
        this.hub.client.notify(id, data);
    }

    public sub (id:number, handler:MessageHandler<any>) {
        this.hub.server.sub(id, handler);
    }

    public unsub (id:number, index:number) {
        this.hub.server.unsub(id, index);
    }
}

class DB {
    public data:{project: {[projecet:string]:DBProject}};
    
    private _value:any = null;
    private _should_reset:boolean = false;

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
        this._initValue();
        this._value = this._getValue(props, this.data, 0);
        return this;
    } 

    public value() {
        console.log('value: ', this._value);
        this._should_reset = true;
        return this._value;
    }

    public push(obj) {
        console.log('push: ', obj);
        this._initValue();
        this._value.push(obj);
        return this;
    } 

    public write() {
        this._should_reset = true;
        return this;        
    }

    public set(msg:string, data:any) {
        console.log('set: ', msg, data);
        this._initValue();
        const props = msg.split('.');
        const setValue = props.pop();
        const obj = this._getValue(props, this._value, 0);
        if (setValue) {
            obj[setValue] = data; 
        }
        return this;
    }
    
    private _initValue () {
        if (this._should_reset) {
            this._value = this.data;
            this._should_reset = false;
        }
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