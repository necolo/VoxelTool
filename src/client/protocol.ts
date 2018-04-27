import { 
    RequestId, 
    initRespondListeners, 
    RespondHandler,
    VoxelSpec, 
    SocketInterface,
} from '../spec';

export const onrespond = initRespondListeners();

export class ClientProtocol {
    public socket:SocketInterface;
    public project:string = 'default';

    constructor (socket:SocketInterface) {
        this.socket = socket;
    }

    public get_category_list (cb:RespondHandler<string[]>) {
        const id = RequestId.category_list;
        const req = this.project;
        this.socket.send(id, req);
        onrespond[id].push(cb);
    }

    public add_category(category:string, cb:RespondHandler<boolean>) {
        const id = RequestId.add_category;
        const req = { project: this.project, category };
        this.socket.send(id, req);
        onrespond[id].push(cb);
    }

    public add_voxel(spec, cb:RespondHandler<boolean>) {
        const id = RequestId.add_voxel;
        const req = {
            project: this.project,
            spec,
        }
        this.socket.send(id, req);
        onrespond[id].push(cb);
    }

    public new_project(project:string, cb:RespondHandler<boolean>) {
        const id = RequestId.new_project;
        this.socket.send(id, project);
        onrespond[id].push(cb);
    }
}