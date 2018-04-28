export enum RequestId {
    category_list,
    add_category,
    add_voxel,
    new_project,
    download_project,
    get_projects,
    get_voxel,
    LENGTH,
}

export interface VoxelSpec {
    id?:number;
    thumbnail:string[];
    texture:string[];
    transparent:boolean;
    color:number[];
    emissive:number[];
    friction:number;
    restitution:number;
    mass:number;
    category:string;
}

export type MessageT = (id:number, data:any) => void;
export type MessageHandler<dataType> = (id:number, data:dataType) => void;

export interface SocketInterface {
    send:(id:number, data:any) => void;
    sub:(id:number, handler:MessageHandler<any>) => number;
    unsub:(id:number, index:number) => void;
}

export interface DBProject {
    categoryList:string[];
    voxelSpec:{ [name:string]:VoxelSpec };
    id_count:number;
}
