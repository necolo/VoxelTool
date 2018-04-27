import { 
    RequestId, 
    initRespondListeners, 
    RespondHandler,
    VoxelSpec, 
    SocketInterface,
} from '../spec';


export class ClientProtocol {
    public socket:SocketInterface;
    public project:string = 'default';

    public onrespond = initRespondListeners(); 

    constructor (socket:SocketInterface) {
        const self = this;

        this.socket = socket;

        const onmessage = this.socket.get_onmessage();

        for (let i = 0; i < onmessage.length; i ++) {
            onmessage[i] = (id, data) => {
                console.log(self.onrespond);
                for (let j = 0; j < self.onrespond[i].length; j ++) {
                    self.onrespond[i][j](data, this.socket);
                }
            }
        }
    }

    public get_category_list (cb:RespondHandler<string[]>) {
        const id = RequestId.category_list;
        const req = this.project;
        this.socket.send(id, req);
        this.onrespond[id].push(cb);
    }

    public add_category(category:string, cb:RespondHandler<boolean>) {
        const id = RequestId.add_category;
        const req = { project: this.project, category };
        this.socket.send(id, req);
        this.onrespond[id].push(cb);
    }

    public add_voxel(spec, cb:RespondHandler<boolean>) {
        const id = RequestId.add_voxel;
        const req = {
            project: this.project,
            spec,
        }
        this.socket.send(id, req);
        this.onrespond[id].push(cb);
    }

    public new_project(project:string, cb:RespondHandler<boolean>) {
        const id = RequestId.new_project;
        this.socket.send(id, project);
        this.onrespond[id].push(cb);
    }

    public get_projects(cb:RespondHandler<string[]>) {
        const id = RequestId.get_projects;
        this.socket.send(id, '');
        this.onrespond[id].push(cb);
        console.log(this.onrespond);
    }
}