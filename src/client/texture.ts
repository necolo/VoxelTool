import { UIListener } from './uiListener';

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
    public linked:Texture[];

    public listener:UIListener;

    constructor(face:number) {
        this.face = face;
        this.listener = new UIListener();
        
        this.name = '';
        this.linked = [];

        this.emissive = '';
        this.specular = '';
        this.normal = '';
        this.texture = '';
    }

    public static removeLink (tex:Texture, texList:Texture[]) {
        for (let i = 0; i < texList.length; i ++) {
            const linkIndex = texList[i].linked.indexOf(tex);
            if (linkIndex > -1) {
                texList[i].linked.splice(linkIndex, 1);
            }            
        }
    }

    public empty() {
        this.texture = '';
        this.emissive = '';
        this.specular = '';
        this.normal = '';
        this.name = '';
    }

    public udpateTexture(src:string) {
        this.empty();
        this.texture = src;
        this.name = Face[this.face];

        const linked = this.linked;
        this.listener.notify();
        this._update_linked_faces(this);
    }

    public updateEmissive(src:string) {
        this.emissive = src;
        this.listener.notify();
        this._update_linked_faces(this);
    }

    public updateSpecular(src:string) {
        this.specular = src;
        this.listener.notify();
        this._update_linked_faces(this);
    }

    public updateNormal(src:string) {
        this.normal = src;
        this.listener.notify();
        this._update_linked_faces(this);
    }

    public linkto(tex:Texture) {
        this.name = Face[tex.face];

        this.texture = tex.texture;
        this.normal = tex.normal;
        this.specular = tex.specular;
        this.emissive = tex.emissive;
        this._update_linked_faces(this);

        tex.linked.push(this);
        
        this.listener.notify();
    }

    public nolinkto() {
        this.name = Face[this.face];
        this.listener.notify();
        this._update_linked_faces(this);
    }

    private _update_linked_faces(based_texture) {
        const linked = based_texture.linked;
        for (let i = 0; i < linked.length; i ++) {
            const linked_tex = linked[i];
            linked_tex.texture = based_texture.texture;
            linked_tex.emissive = based_texture.emissive;
            linked_tex.specular = based_texture.specular;
            linked_tex.normal = based_texture.normal;

            linked_tex.listener.notify();
            this._update_linked_faces(linked_tex)
        }
    }
}