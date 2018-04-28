import { 
    RequestId, 
    VoxelSpec, 
    SocketInterface,
    MessageHandler,
} from '../spec';


export class ClientProtocol {
    public socket:SocketInterface;
    public project:string = 'default';

    constructor (socket:SocketInterface) {
        const self = this;
        this.socket = socket;
    }

    public get_category_list (cb:MessageHandler<string[]>) {
        const id = RequestId.category_list;
        const req = {
            project: this.project,
        };

        this.socket.sub(id, cb);
        this.socket.send(id, req);
    }

    public add_category(category:string, cb:MessageHandler<boolean>) {
        const id = RequestId.add_category;
        const req = { project: this.project, category };
        this.socket.sub(id, cb);
        this.socket.send(id, req);
    }

    public add_voxel(name:string, spec:VoxelSpec, cb:MessageHandler<boolean>) {
        const id = RequestId.add_voxel;
        const req = {
            project: this.project,
            name,
            spec,
        }
        this.socket.sub(id, cb);
        this.socket.send(id, req);
    }

    public new_project(project:string, cb:MessageHandler<boolean>) {
        const id = RequestId.new_project;
        this.socket.sub(id, cb);
        this.socket.send(id, project);
    }

    public get_projects(cb:MessageHandler<string[]>) {
        const id = RequestId.get_projects;
        this.socket.sub(id, cb);
        this.socket.send(id, '');
    }

    public get_voxel(name:string, cb:MessageHandler<VoxelSpec|false>) {
        const id = RequestId.get_voxel;
        this.socket.sub(id, cb);

        const req = {
            project: this.project,
            name,
        };

        this.socket.send(id, req);
    }
}