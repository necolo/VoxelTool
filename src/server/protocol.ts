import { 
    RequestId, 
    VoxelSpec, 
    SocketInterface,
    MessageHandler,
    DBProject,
    ServerHandlerI,
    VoxelSpecInDB,
} from '../spec';

export class ServerProtocol {
    public socket:SocketInterface;
    
    constructor (socket:SocketInterface, serverHandler:ServerHandlerI) {
        this.socket = socket;
        const { db, saveImages } = serverHandler;

        this.socket.sub(RequestId.category_list, (id, req:{project:string}) => {
            const res = db.get(`project.${req.project}.categoryList`).value(); 
            this.socket.send(id, res); 
        });

        this.socket.sub(RequestId.add_category, (id, req:{project:string, category:string}) => {
            const postid = db.get(`project.${req.project}.categoryList`)
                .push(req.category)
                .write();  
            const success = postid ? true : false;
            this.socket.send(id, success);
        });

        this.socket.sub(RequestId.add_voxel, (id, req:{
            project:string, 
            name:string, 
            spec:VoxelSpec, 
            tex:{[name:string]:{
                texture:string,
                normal:string,
                specular:string,
                emissive:string,
            }}}) => {
            console.log(req);

            // save spec
            const project =`project.${req.project}` 
            const voxel_count = db.get(`${project}.id_count`).value() + 1;
            db.set(`${project}.id_count`, voxel_count).write();
            const spec:VoxelSpecInDB = req.spec as VoxelSpecInDB;
            spec.id = voxel_count;
            db.get(`${project}.voxelSpec`).set(req.name, spec).write();
            
            // save the images
            const texFaces = Object.keys(req.tex);
            for(let i = 0; i < texFaces.length; i ++) {
                const name = texFaces[i];
                const { texture, normal, specular, emissive } = req.tex[name];

                saveImages({
                    project: req.project,
                    category: req.spec.category,
                    name: `${req.name}_${texFaces[i]}`,
                    texture,
                    specular,
                    emissive,
                    normal,
                })
            }

            this.socket.send(id, true);
        });

        this.socket.sub(RequestId.new_project, (id, req:{project:string}) => {
            console.log('new project', req);
            db.set(`project.${req.project}`, this.allocProject()).write();
            this.socket.send(id, true);
        });

        this.socket.sub(RequestId.get_projects, (id, req) => {
            const projects = db.get(`project`).value();
            this.socket.send(id, Object.keys(projects));            
        });

        this.socket.sub(RequestId.get_voxel, (id, req:{project:string, name:string}) => {
            const voxel = db.get(`project.${req.project}.voxelSpec.${req.name}`).value();
            if (voxel) {
                this.socket.send(id, voxel);
            } else {
                this.socket.send(id, false);
            }
        })

        this.socket.sub(RequestId.download_project, (id, { project }) => {
            //todo: 
        })
    }

    public allocProject () : DBProject {
        return {
            categoryList: [],
            voxelSpec: {},
            id_count: 0,
        }
    }
}