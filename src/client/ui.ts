import { UIListener } from './uiListener';
import { ClientProtocol } from './protocol';

export enum Texture {
    left,
    right,
    bottom,
    top,
    front,
    back,
    length,
}

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
    texture_data:TextureData[];
    category:string;
}

export interface TextureData {
    src:string;
    name:string; 
    linked:Texture[];
}

export class UI {
    public rightPanelListener = new UIListener();
    public leftPanelListener = new UIListener();
    public textureBoxListeners:UIListener[] = new Array(Texture.length);
    public categoryListener = new UIListener();

    public protocol:ClientProtocol;
    public glCube:any;

    public state:UIState = {
        categoryList: [],
        projects: [],
        inProject: 'default',
        texture_data: [],
        category: '',
    }

    constructor(protocol:ClientProtocol) {
        this.protocol = protocol;
        this.textureBoxListeners.fill(new UIListener());

        this.state.texture_data = new Array(Texture.length);
        this.state.texture_data = new Array(Texture.length);
        this.init_texture_data();

        (window as any).ui = this;

        this.update_projects();
    }


    public update_projects() {
        this.protocol.get_projects((id, projects) => {
            this.state.projects = projects;
            this.leftPanelListener.notify();
        })
    }

    public uploadTextureImg(face:Texture, imgsrc:string) {
        const self = this;
        const texs = this.state.texture_data;

        const noneTexUploaded = checkValue('src', '', texs);
        if (noneTexUploaded) {
            for (let i = 0; i < texs.length; i ++) {
                const tex = texs[i];
                tex.name = Texture[face];
                tex.src = imgsrc;
                this.textureBoxListeners[i].notify();
            }

            const links = [0, 1, 2, 3, 4, 5];
            links.splice(face, 1);
            texs[face].linked = links;
        } else {
            const texture = texs[face];
            texture.name = Texture[face];
            texture.src = imgsrc;
            this.textureBoxListeners[face].notify();

            // the linked faces should also be updated
            _update_linked_faces(texture, imgsrc, texture.name);

            // now this face is not linked to any other faces
            for (let i = 0; i < texs.length; i ++) {
                const linkIndex = texs[i].linked.indexOf(face);
                if (linkIndex > -1) {
                    texs[i].linked.splice(linkIndex, 1);
                }
            }
        }

        this.updateGL();

        function _update_linked_faces(_texture:TextureData, src:string, name:string) {
            for (let i = 0; i < _texture.linked.length; i ++) {
                const linked_face = _texture.linked[i];
                const linked_texture = self.state.texture_data[linked_face];
                linked_texture.src = src;
                self.textureBoxListeners[linked_face].notify();
                _update_linked_faces(linked_texture, src, name);
            }
        }
    }

    public updateGL () {
        const glSpec = {};
        for (let i = 0; i < Texture.length; i ++) {
            glSpec[i] = this.state.texture_data[i].src;
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

    public linkBlockSide (face:Texture, link:Texture) {
        const self = this;
        const texture = this.state.texture_data[face];
        const linked_texture = this.state.texture_data[link];
        texture.name = Texture[link];
        texture.src = linked_texture.src; 
        linked_texture.linked.push(face);
        this.updateGL();
        this.textureBoxListeners[face].notify();
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

    public init_texture_data () {
        for (let i = 0; i < Texture.length; i ++) {
            this.state.texture_data[i] = {
                src: '',
                name: '',
                linked: [],
            }
        }
        for (let listener of this.textureBoxListeners) {
            listener.notify();
        }
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