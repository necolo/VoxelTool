import { mat4 } from 'gl-matrix';

import { UI } from '../client/ui';
import { Effects } from '../client/effects'; 

import { glMouse } from './glMouse';
import { glLight } from './glLight';
import { glAmbient } from './glAmbient';
import { glEmptyCube } from './glEmptyCube';
import { glTexCube } from './glTexCube';
import { glCache } from './glCache';
import { glSetup } from './glSetup';
import { CLIENT_RENEG_LIMIT } from 'tls';

export type GLTextureSpec = {
    tex:{[face:number]:{
        texture:string;
        emissive:string;
        specular:string;
        normal:string;
    }},
    transparent:boolean,
}

export type glslT = {
    frag:string,
    vert:string,
}

export type glMainT = {
    empty: () => void,
    texture: (spec:GLTextureSpec) => void,
}

export enum CubeType {
    empty,
    texture,
}

export function glMain (canvas:HTMLCanvasElement, ui:UI) : glMainT {
    const regl = require('regl')(canvas);
    const mouse = glMouse(canvas);
    const cache = glCache();
    const setup = glSetup(regl, mouse);
    const drawEmptyCube = glEmptyCube(regl);
    const texCube = glTexCube(regl);
    const drawLight = glLight(cache, ui);
    const drawAmbient = glAmbient(cache, ui);

    mouse.preset({
        camera: [0, 0, 8],
    });
    
    let drawCube = drawEmptyCube;
    let drawTexCube;

    let type:CubeType = CubeType.empty;

    const { light, lightPosition, ambientLight } = ui.effects;

    function run() {
        regl.clear({
            depth: 1,
            color: [0, 0, 0, 1],
        })
        
        mouse.tick();

        const envSpec = {
            light,
            lightPosition,
            ambientLight,
        }

        drawLight();
        drawAmbient();

        if (type === CubeType.empty) {
            setup(envSpec, () => drawEmptyCube(cache));
        }

        else {
            setup(envSpec, () => drawTexCube(cache));
        }
    }

    run();

    regl.frame(() => {

    });

    return {
        empty: () => {
            drawCube = drawEmptyCube;
        },
        texture: (spec) => {
            drawTexCube = texCube(spec, type);
        },
    }
}