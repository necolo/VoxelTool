import { GLTextureSpec } from '../client/glCube';

import { UIListener } from './uiListener';
import { ClientProtocol } from './protocol';
import { Texture, Face } from './texture';

export enum Thumbnail {
    top,
    left,
    right,
    length,
}

export interface UIState {
    categoryList:string[];
    projects:string[];
    inProject:string;
    texList:Texture[];
    category:string;
}

export function allocTexList () : Texture[] {
    const res:Texture[] = new Array(Face.length);
    for (let i = 0; i < res.length; i ++) {
        res[i] = new Texture(i);
    }
    return res;
} 

export class UI {
    public rightPanelListener = new UIListener();
    public leftPanelListener = new UIListener();
    public categoryListener = new UIListener();

    public protocol:ClientProtocol;
    public glCube:any;

    public state:UIState = {
        categoryList: [],
        projects: [],
        inProject: 'default',
        texList: [],
        category: '',
    }

    constructor(protocol:ClientProtocol) {
        this.protocol = protocol;
        this.state.texList = allocTexList();

        (window as any).ui = this;

        this.update_projects();
    }

    public update_projects() {
        this.protocol.get_projects((id, projects) => {
            this.state.projects = projects;
            this.leftPanelListener.notify();
        })
    }

    public uploadTexture(face:Face, imgsrc:string) {
        const self = this;
        const { texList } = this.state;

        const noneTexUploaded = checkValue('texture', '', texList);
        if (noneTexUploaded) {
            //for the first texture, link all other faces to it. 
            const tex =texList[face];
            tex.udpateTexture(imgsrc);

            for (let i = 0; i < texList.length; i ++) {
                if (i === face) { continue; }
                const linked_tex = texList[i];
                linked_tex.linkto(tex);
            }
        } else {
            const tex = texList[face];
            Texture.removeLink(tex, texList);
            tex.udpateTexture(imgsrc);
        }

        this.updateGL();
    }

    public updateGL () {
        const glSpec:GLTextureSpec = {};
        
        for (let i = 0; i < Face.length; i ++) {
            glSpec[i] = {
                texture: '',
                normal: '',
                emissive: '',
                specular: '',
            };
            glSpec[i].texture = this.state.texList[i].texture;
            glSpec[i].emissive = this.state.texList[i].emissive;
            glSpec[i].normal = this.state.texList[i].normal;
            glSpec[i].specular = this.state.texList[i].specular;
        }

        this.glCube.texture(glSpec);
    }

    public setProject(project:string) {
        this.state.inProject = project;
        this.leftPanelListener.notify();

        this.protocol.project = project;
        this.protocol.get_category_list((id, categoryList) => {
            this.state.categoryList = categoryList;
            this.rightPanelListener.notify();
        })
    }

    public update_category_list () {
        this.protocol.get_category_list((id, category_list) => {
            this.state.categoryList = category_list.concat();
            this.categoryListener.notify();
        })
    }

    public set_category (category:string) {
        this.state.category = category;
    }
}

function checkValue (param:string, value:any, list:{}[]) : boolean {
    let res:boolean = true;

    for (let i = 0; i < list.length; i ++) {
        if (list[i][param] !== value) {
            res = false;
            break;
        }
    } 

    return res;
}