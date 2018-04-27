export enum RequestId {
    category_list,
    add_category,
    add_voxel,
    new_project,
    download_project,
    LENGTH,
}

export type RespondHandler<datatype> = (data:datatype, socket:SocketInterface) => void;

export type RespondListenersT = RespondHandler<any>[][];
export function initRespondListeners() : RespondListenersT {
    const res:RespondListenersT = [];
    for (let i = 0; i < RequestId.LENGTH; i ++) {
        res.push([]);
    }
    return res;
}

export interface VoxelSpec {
    id:number;
    thumbnail:[string, string, string];
    texture:[string, string, string, string, string, string];
    transparent:boolean;
    color:[number, number, number, number];
    emissive:[number, number, number];
    friction:number;
    restitution:number;
    mass:number;
    category:string;
}

export type MessageT = (id:number, data:any) => void;
export interface SocketInterface {
    send:(id:number, data:any) => void;
    set_onmessage:(onmessage:MessageT[]) => void; 
}

export interface DBProject {
    categoryList:string[];
    voxelSpec:{ [name:string]:VoxelSpec };
    id_count:number;
}
