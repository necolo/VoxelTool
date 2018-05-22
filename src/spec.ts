export enum RequestId {
    connected,
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

export interface VoxelSpecInDB extends VoxelSpec {
    id:number;
}

export type MessageT = (id:number, data:any) => void;
export type MessageHandler<dataType> = (id:number, data:dataType) => void;

export interface SocketInterface {
    send:(id:number, data:any) => void;
    sub:(id:number, handler:MessageHandler<any>) => void;
    unsub:(id:number, index:number) => void;
}

export interface DBProject {
    categoryList:string[];
    voxelSpec:{ [name:string]:VoxelSpec };
    id_count:number;
}

export interface ServerHandlerI {
    db:any;
    saveImages: (spec:{
        project:string,
        category:string,
        name:string,
        texture:string,
        specular:string,
        emissive:string,
        normal:string,
        next?:() => void,
    }) => void;
}