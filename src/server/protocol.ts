
import { 
    RequestId, 
    initRespondListeners, 
    RespondHandler,
    VoxelSpec, 
    SocketInterface,
} from '../spec';

export const onrequest = initRespondListeners();

export class ServerProtocol {
    public socket;
    public db:any;
    
    constructor (socket:SocketInterface, db:any) {
        this.socket = socket;
        this.db = db;

        const onmessage = new Array(RequestId.LENGTH); 
        onmessage[RequestId.category_list] = (id, req) => {
            const res = db.get(`project.${req.projet}.categoryList`).value(); 
            this.socket.send(id, res);
        }

        onmessage[RequestId.add_category] = (id, req) => {
            const postid = db.get(`project.${req.projet}.categoryList`)
                .push(req.category)
                .write();  
            const success = postid ? true : false;
            this.socket.send(id, success);
        }

        onmessage[RequestId.add_voxel] = (id, req) => {
            const project =`project.${req.project}` 
            const project_id = db.get(`${project}.id_count`).value() + 1;
            db.set(`${project}.id_count`, id).write();
            const spec = req.spec;
            spec['id'] = id;
            db.get(`${project}.voxelSpec`).set(req.name, spec).write();
            this.socket.send(id, true);
        }

        onmessage[RequestId.new_project] = (id, req) => {

        }

        onmessage[RequestId.download_project] = (id, req) => {

        }

        this.socket.onmessage = onmessage;
    }
}