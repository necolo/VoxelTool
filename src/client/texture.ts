import { UIListener } from './uiListener';
import { Voxel } from './voxel';

export enum Face {
    left,
    right,
    bottom,
    top,
    front,
    back,
    length,
}

export class Texture {
    public emissive:string;
    public specular:string;
    public normal:string;
    public texture:string;

    public name:string;
    public face:number;
    public link:Texture|null;

    public listener:UIListener;

    private _voxel:Voxel;

    constructor(face:number, voxel:Voxel) {
        this.face = face;
        this.listener = new UIListener();
        this._voxel = voxel;
        
        this.name = Face[this.face];
        this.link = null;

        this.emissive = '';
        this.specular = '';
        this.normal = '';
        this.texture = '';
    }
    
    public static updateUI (changedTex:Texture, texList:Texture[]) {
        for (let tex of texList) {
            if (tex.link === changedTex) {
                tex.listener.notify();
                Texture.updateUI(tex, texList);
            }
        }
    }

    public empty() {
        this.texture = '';
        this.emissive = '';
        this.specular = '';
        this.normal = '';
    }

    public udpateTexture(src:string) {
        this.empty();
        this.texture = src;
        this.link = null;
        this._voxel.blank = false;

        this.listener.notify();
        Texture.updateUI(this, this._voxel.texList);
    }

    public updateEmissive(src:string) {
        this.emissive = src;

        this.listener.notify();
        Texture.updateUI(this, this._voxel.texList);
    }

    public updateSpecular(src:string) {
        this.specular = src;

        this.listener.notify();
        Texture.updateUI(this, this._voxel.texList);
    }

    public updateNormal(src:string) {
        this.normal = src;

        this.listener.notify();
        Texture.updateUI(this, this._voxel.texList);
    }

    public getSrc () : {
        texture: string;
        specular: string;
        emissive: string;
        normal: string;
    } {
        if (this.link) {
            return this.link.getSrc();
        }

        return {
            texture: this.texture,
            specular: this.specular,
            emissive: this.emissive,
            normal: this.normal,
        }
    }

    public getName () : string {
        if (this.link) {
            return this.link.getName();
        }

        return this.name;
    }

    public setLinkto(tex:Texture) {
        this.empty();
        this.link = tex;

        this.listener.notify();
        Texture.updateUI(this, this._voxel.texList);
    }

    public getLinkName () : string {
        if (this.link) {
            return Face[this.link.face];
        }

        return this.name;
    }

    public removeLink() {
        this.link = null;
        
        this.listener.notify();
        Texture.updateUI(this, this._voxel.texList)
    }
}