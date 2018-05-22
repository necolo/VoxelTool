import low = require('lowdb');
import FileSync = require('lowdb/adapters/FileSync');
import fs = require('fs');
import path = require('path');

import { VoxelSpec, ServerHandlerI } from '../spec';

const repo_path = path.join(__dirname, '../../');
const voxel_path = path.join(repo_path, 'assets/voxel');

export class ServerHandler implements ServerHandlerI {
    public db:any;
    
    constructor () {
        const adapter = new FileSync('db.json');
        this.db = low(adapter);

        this.db.defaults({ project: {
            'default': {
                categoryList: [],
                voxelSpec: {},
                id_count: 0,
            },
        }}).write();
    }

    public saveImages (spec:{
        project:string,
        category:string,
        name:string,
        texture:string,
        normal:string,
        specular:string,
        emissive:string,
        next?:() => void,
    }) {
        const { project, category, name } = spec;

        const projectDir = path.join(voxel_path, project);
        const categoryDir = path.join(projectDir, category);

        checkDir([projectDir, categoryDir], () => {
            const file = path.join(categoryDir, name + '.png');
            const buf = new Buffer(spec.texture.replace(/^data:image\/\w+;base64,/, ""), 'base64');
            fs.writeFile(file, buf, 'binary', (err) => {
                if (err) throw err;
                console.log(`${file} saved`);
            });
    
            _save('normal');
            _save('emissive');
            _save('specular');
        });

        function checkDir (dirs:string[], next:() => void, count:number = 0) {
            if (count >= dirs.length) {
                next();
                return;
            }

            const dir = dirs[count]; 
            if (!fs.existsSync(dir)) {
                fs.mkdir(dir, (err) => {
                    if (err) throw err;
                    checkDir(dirs, next, ++count)
                })
            } else {
                checkDir(dirs, next, ++count);
            }
        }

        function _save (type:string) {
            if (!spec[type]) { return; }
            const file = path.join(categoryDir, `${name}_${type}.png`);
            const buf = new Buffer(spec[type].replace(/^data:image\/\w+;base64,/, ""), 'base64');
            fs.writeFile(file, buf, 'binary', (err) => {
                if (err) throw err;
                console.log(`${file} saved`);
            });
        }
    }

    public extractProject (project:string) {

    }
}