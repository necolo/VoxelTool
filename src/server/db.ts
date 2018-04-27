const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

import { VoxelSpec } from '../spec';

const adapter = new FileSync('db.json');
export const db = low(adapter);


db.defaults({ project: {} }).write();

