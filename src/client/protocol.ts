import WebSocket = require('uws');
import { 
    RequestId, 
    initRequestListeners, 
    RespondHandler,
    VoxelSpec, 
} from '../spec';


export const ws = new WebSocket(
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`,
)

export const reqListeners = initRequestListeners();

ws.on('message', (msg) => {
    const res = JSON.parse(msg);
    const actions = reqListeners[res.id];  
    for (let action of actions) {
        action(res.data, ws);
    }
})

export function req_category_list(project:string, cb:RespondHandler<string[]>) {
    const id = RequestId.category_list;
    const req = { id, project }
    ws.send(JSON.stringify(req));;
    reqListeners[id].push(cb);
}

export function req_add_category(project:string, category:string, cb:RespondHandler<boolean>) {
    const id = RequestId.add_category;
    const req = {id, project, category };
    ws.send(JSON.stringify(req));
    reqListeners[id].push(cb);
}

export function req_add_voxel(project:string, spec, cb:RespondHandler<boolean>) {
    const id = RequestId.add_voxel;
    const req = {
        id,
        project,
        spec,        
    };

    ws.send(JSON.stringify(req));
    reqListeners[id].push(cb);
}

export function new_project(project:string, cb:RespondHandler<boolean>) {
    const id = RequestId.add_voxel;
    const req = {
        id,
        project,
    };

    ws.send(JSON.stringify(req));
    reqListeners[id].push(cb);
}