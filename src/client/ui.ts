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
    in_project:string;
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

    public state:UIState = {
        categoryList: [],
        projects: [],
        in_project: 'default',
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

        this.protocol.get_projects((id, projects) => {
            this.state.projects = projects;
            this.leftPanelListener.notify();
        })
    }

    public uploadTextureImg(face:Texture, img:string) {
        const self = this;
        const texture = this.state.texture_data[face];
        texture.name = Texture[face];
        texture.src = img;
        this.textureBoxListeners[face].notify();
        _update_linked_faces(texture, img, texture.name);
 
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

    public setProject(project:string) {
        this.state.in_project = project;
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