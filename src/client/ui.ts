import { UIListener } from './uiListener';
import {
    req_category_list,
} from '../client/protocol';

export const SIDES = ['left', 'top', 'right', 'bottom', 'front', 'back'];
export interface TextureSrc {
    'left':string;
    'right':string;
    'top':string;
    'bottom':string;
    'front':string;
    'back':string;
}

export interface UIState {
    texture_src:TextureSrc;
    project:string;
    categoryList:string[];
}

export class UI {
    public rightPanelListener = new UIListener();

    public state:UIState = {
        texture_src: {} as TextureSrc, 
        project: 'default',
        categoryList: [],
    }

    constructor() {
        for (let side of SIDES) {
            this.state.texture_src[side] = '';
        }
    }

    public setTextureSrc(side:string, src:string) {
        this.state.texture_src[side] = src;
    }

    public setProject(project:string) {
        this.state.project = project;
        req_category_list(project, (categoryList) => {
            this.state.categoryList = categoryList;
            this.rightPanelListener.notify();
        })
    }
}