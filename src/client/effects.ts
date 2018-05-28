import { UIListener } from '../client/uiListener';

export class Effects {
    public light:number[];
    public lightPosition:number[];
    public ambientLight:number[];
    public onLight:boolean;
    public onAmbient:boolean;

    public listener = new UIListener();

    constructor () {
        this.light = [1.0, 1.0, 1.0];
        this.lightPosition = [20, 0, 0];
        this.ambientLight = [0.8, 0.8, 0.8];
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
    }
}