import { UIListener } from '../client/uiListener';
import { glMainT } from '../gl/glMain';

export class Effects {
    public light:number[];
    public lightPosition:number[];
    public ambientLight:number[];
    public onLight:boolean;
    public onAmbient:boolean;

    public listener = new UIListener();
    public glCube!:glMainT;

    constructor (glCube:glMainT) {
        this.light = [1.0, 1.0, 1.0];
        this.lightPosition = [20, 0, 0];
        this.ambientLight = [0.5, 0.5, 0.5];
        this.onLight = true;
        this.onAmbient = true;
    }

    public updateProps(target:string, value:any, index?:number) {
        if (index) {
            this[target][index] = value;
        } else {
            this[target] = value;
        }
        this.listener.notify();

        if (this.glCube) {
            this.glCube.reload();
        }
    }

    public add_glCube(glCube:glMainT) {
        this.glCube = glCube;
    }
}