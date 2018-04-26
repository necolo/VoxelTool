export enum RequestId {
    category_list,
    add_category,
    add_voxel,
    new_project,
    LENGTH,
}

export type RespondHandler<datatype> = (data:datatype, ws:any) => void;
export type RequestListenersT = RespondHandler<any>[][];
export function initRequestListeners() : RequestListenersT {
    const res:RequestListenersT = [];
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


