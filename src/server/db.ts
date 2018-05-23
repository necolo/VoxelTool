import low = require('lowdb');
import FileSync = require('lowdb/adapters/FileSync');
import fs = require('fs');
import path = require('path');
import process = require('child_process');

import { VoxelSpec, ServerHandlerI } from '../spec';

const repo_path = path.join(__dirname, '../../');
const voxel_path = path.join(repo_path, 'assets/voxel');

const { exec, execSync } = process;

export class ServerHandler implements ServerHandlerI {
    public db:low.LowdbSync<any>;
    
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

        // check assets/voxel directory
        this._mkdir([
            path.join(repo_path, 'assets'),
            voxel_path,
        ])
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
        const projectVoxelDir = path.join(projectDir, 'voxel');
        const categoryDir = path.join(projectVoxelDir, category);

        this._mkdir([projectDir, projectVoxelDir, categoryDir], () => {
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

    public extract (project:string, next:(download_path:string) => void) {
        const spec = this.db.get(`project.${project}.voxelSpec`).value();
        const file = path.join(voxel_path, project, 'block-spec.json');
        fs.writeFile(file, JSON.stringify(spec), 'utf8', (err) => {
            if (err) throw err; 

            execSync(`zip -r ${project}.zip ${project}`, {
                cwd: voxel_path,
            });

            const zip_path = `assets/voxel/${project}.zip`;
            next(zip_path);
        })
    }

    private _mkdir (dirs:string[], next?:() => void, count:number = 0) {
        if (count >= dirs.length) {
            if (next) { next(); }
            return;
        }

        const dir = dirs[count]; 
        if (!fs.existsSync(dir)) {
            fs.mkdir(dir, (err) => {
                if (err) throw err;
                this._mkdir(dirs, next, ++count)
            })
        } else {
            this._mkdir(dirs, next, ++count);
        }
    }
}