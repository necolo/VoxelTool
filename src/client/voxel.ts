import { VoxelSpec } from '../spec';

import { ClientProtocol } from './protocol';
import { Texture, Face } from './texture';
import { UIListener } from './uiListener';

export enum Thumbnail {
    top,
    left,
    right,
    length,
}

export class Voxel {
    public spec:VoxelSpec = {} as VoxelSpec;

    public name:string;
    public texList:Texture[];
    public protocol:ClientProtocol;
    public blank:boolean = true;

    public listener:UIListener;

    constructor (protocol:ClientProtocol) {
        this.protocol = protocol;
        this.listener = new UIListener();

        this.texList = new Array(Face.length);
        for (let i = 0; i < this.texList.length; i ++) {
            this.texList[i] = new Texture(i, this);
        }

        this.name = '';
        this.initSpec();
    }

    public updateSpec (target:string, data:any, index?:number) {
        if (index === undefined) {
            this.spec[target] = data;
        } else {
            this.spec[target][index] = data;
        }
        this.listener.notify();
    }

    public setName (name:string) {
        this.name = name;
        this.listener.notify();
    }

    public initSpec () {
        this.spec = {
            thumbnail: new Array(3),
            texture: new Array(Face.length),
            transparent: false,
            color: [1, 1, 1, 1],
            emissive: [0, 0, 0],
            friction: 1,
            restitution: 0,
            mass: 1,
            category: '',
        }
    }

    public save (next:() => void) {
        if (!this.isSpecValid()) {
            return;
        } 

        this.protocol.get_voxel(this.name, (id, data) => {
            if (data) {
                alert(`error: voxel ${name} already exists`);
                return;
            }

            for (let i = 0; i < Face.length; i ++) {
                this.spec.texture[i] = `${this.name}_${this.texList[i].getName()}`;
            }

            for (let i = 0; i < Thumbnail.length; i ++) {
                this.spec.thumbnail[i] = this.spec.texture[Face[Thumbnail[i]]];
            }

            this.protocol.add_voxel(this.name, this.spec, (id, success) => {
                if (success) {
                    next();
                } else {
                    alert('error: save failed');
                }
            })           
        })              
    }

    public isSpecValid () : boolean {
        if (this.spec.category === '') {
            alert('error: category is not defined');
            return false;
        }

        if (this.name === '') {
            alert('error: name is empty');
            return false;
        }

        for (let i = 0; i < this.texList.length; i ++) {
            const tex = this.texList[i];
            if (!tex.texture && !tex.link) {
                alert(`error: texture ${Face[i]} not set`);
                return false;
            }
        }

        return true;
    }
}