const WebSocketServer = require('uws').Server;
const wss = new WebSocketServer({port: 8002});

import { db } from './db';
import { 
    RequestId, 
    initRequestListeners, 
    RespondHandler,
    VoxelSpec, 
} from '../spec';

wss.on('connection', function(ws) {
    ws.on('message', (msg) => {
        const req = JSON.parse(msg);
        let res = {};
        switch (req.id) {
            case RequestId.category_list:
                handler(RequestId.category_list, ws, 
                    () => db.get(`project.${req.projet}.categoryList`).value(),
                )
                break;

            case RequestId.add_category:
                handler(RequestId.add_category, ws,
                    () => {
                        const postid = db.get(`project.${req.projet}.categoryList`)
                            .push(req.category)
                            .write();
                        return (postid) ? true : false;
                    }
                )
                break;
            
            case RequestId.add_voxel:
                handler(RequestId.add_voxel, ws, 
                    () => {
                        const project =`project.${req.project}` 
                        const id = db.get(`${project}.id_count`).value() + 1;
                        db.set(`${project}.id_count`, id).write();
                        const res = req.spec;
                        res[id] = id;
                        db.get(`${project}.voxelSpec`).set(req.name, res).write();
                        return true;
                    }
                ) 
                break;
            
            case RequestId.new_project:
                handler(RequestId.new_project, ws, 
                    () => {

                    }
                ) 
                break;
        }
    })
})

function handler (id:RequestId, ws:any, action:() => any) {
    const res = { id };
    const data = action();
    ws.send(JSON.stringify(res));
}