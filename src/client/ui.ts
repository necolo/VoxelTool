import { UIListener } from './uiListener';
import { ClientProtocol } from './protocol';

export const SIDES = ['left', 'top', 'right', 'bottom', 'front', 'back'];
export interface TextureSrc {
    'left':string;
    'right':string;
    'top':string;
    'bottom':string;
    'front':string;
    'back':string;
}

export enum Texture {
    left,
    right,
    bottom,
    top,
    front,
    back,
}

export enum Thumbnail {
    top,
    left,
    right,
}

export interface UIState {
    texture_src:TextureSrc;
    project:string;
    categoryList:string[];
    thumbnail: [string, string, string];
    texture: [string, string, string, string, string, string];
}

export class UI {
    public rightPanelListener = new UIListener();
    public protocol:ClientProtocol;

    public state:UIState = {
        texture_src: {} as TextureSrc, 
        project: 'default',
        categoryList: [],
        thumbnail: ['', '', ''],
        texture: ['', '', '', '', '', ''],
    }

    constructor(protocol:ClientProtocol) {
        this.protocol = protocol;

        for (let side of SIDES) {
            this.state.texture_src[side] = '';
        }
    }

    public setTextureSrc(side:string, src:string) {
        this.state.texture_src[side] = src;
    }

    public setProject(project:string) {
        this.state.project = project;
        this.protocol.project = project;
        this.protocol.get_category_list((categoryList) => {
            this.state.categoryList = categoryList;
            this.rightPanelListener.notify();
        })
    }

    public setBlockSide (side:string, src:string) {
        this.state.texture[Texture[side]] = src;
        if (Thumbnail[side]) {
            this.state.thumbnail[Thumbnail[side]] = src;
        }
    }

    public linkBlockSide (side:string, link:string) {
        this.state.texture[Texture[side]] = this.state.texture[Texture[link]];
        if (Thumbnail[side]) {
            this.state.thumbnail[Thumbnail[side]] = this.state.texture[Texture[link]];
        }
    }
}