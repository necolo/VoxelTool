const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

import { VoxelSpec } from '../spec';

const adapter = new FileSync('db.json');
export const db = low(adapter);

interface DBProject {
    categoryList:string[];
    voxelSpec:{ [name:string]:VoxelSpec };
    id_count:number;
}

db.defaults({ project: {} }).write();

//todo: download zip file which includes: voxel-spec file and voxels folder