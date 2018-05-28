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

export function glMain (canvas:HTMLCanvasElement, ui:UI) : glMainT {
    const regl = require('regl')(canvas);
    const mouse = glMouse(canvas);
    const drawEmptyCube = glEmptyCube(regl);
    const drawTexCube = glTexCube(regl);
    const drawLight = glLight();
    const drawAmbient = glAmbient();
    const cache = glCache();
    const setup = glSetup(regl, mouse);

    mouse.preset({
        camera: [0, 0, 8],
    });
    
    let drawCube = drawEmptyCube;

    regl.frame(() => {
        regl.clear({
            depth: 1,
            color: [0, 0, 0, 1],
        })
        
        mouse.tick();

        drawLight(cache);
        drawAmbient(cache);
        
        setup(undefined, () => draw(drawCube, cache));
    });

    return {
        empty: () => {
            drawCube = drawEmptyCube;
        },
        texture: (spec) => {
            drawCube = drawTexCube(spec);
        },
    }
}

function draw (drawCube, cache) {
    drawCube(cache);
}