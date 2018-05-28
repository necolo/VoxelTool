import { GLTextureSpec } from '../client/glCube';

import { UIListener } from './uiListener';
import { ClientProtocol } from './protocol';
import { Texture, Face } from './texture';
import { Voxel, Thumbnail } from './voxel';
import { Effects } from './effects';

export interface UIState {
    categoryList:string[];
    projects:string[];
    inProject:string;
}

export class UI {
    public leftPanelListener = new UIListener();
    public categoryListener = new UIListener();

    public protocol:ClientProtocol;
    public voxel:Voxel;
    public effects:Effects;
    public glCube:any;

    public state:UIState = {
        categoryList: [],
        projects: [],
        inProject: 'default',
    }

    constructor(protocol:ClientProtocol) {
        this.protocol = protocol;
        this.voxel = new Voxel(protocol);
        this.effects = new Effects();

        (window as any).ui = this;

        this.update_projects();
    }

    public update_projects() {
        this.protocol.get_projects((id, projects) => {
            this.state.projects = projects;
            this.leftPanelListener.notify();
        })
    }

    public updateGL () {
        const glSpec:GLTextureSpec = {} as GLTextureSpec;

        glSpec.transparent = this.voxel.spec.transparent;
        glSpec.tex = {};
        
        for (let i = 0; i < Face.length; i ++) {
            const tex = this.voxel.texList[i];
            glSpec.tex[i] = tex.getSource();
        }

        this.glCube.texture(glSpec);
    }

    public selectProject(project:string) {
        this.state.inProject = project;
        this.leftPanelListener.notify();

        this.protocol.project = project;
        this.protocol.get_category_list((id, categoryList) => {
            this.state.categoryList = categoryList;
            this.voxel.listener.notify();
        })
    }

    public update_category_list () {
        this.protocol.get_category_list((id, category_list) => {
            if (category_list === undefined) {
                return;
            }

            this.state.categoryList = category_list.concat();
            this.categoryListener.notify();
        })
    }
}