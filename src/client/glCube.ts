import { mat4 } from 'gl-matrix';

import { UI } from './ui';
import { Face } from './texture';
import { glMouse } from './glMouse';
import { Effects } from './effects';
import { glsl, createGLSL } from './glsl';


export type GLTextureSpec = {
    tex:{[face:number]:{
        texture:string;
        emissive:string;
        specular:string;
        normal:string;
    }},
    transparent:boolean,
}

export type DrawCubeT = {
    empty: () => void,
    texture: (spec:GLTextureSpec) => void,  
    effect: (effects:Effects) => void,
}

export function glCube (canvas:HTMLCanvasElement, ui:UI) : DrawCubeT {
    const regl = require('regl')(canvas);
    const mouse = glMouse(canvas);

    mouse.preset({
        camera: [0, 0, 8],
    })

    const { effects } = ui;

    const basicCube = regl({
        attributes: {
            position: insertArray(POSITION, [
                0, 1, 2, 3,
                0, 3, 4, 5,
                0, 5, 6, 1,
                1, 6, 7, 2,
                7, 4, 3, 2,
                4, 7, 6, 5,
            ]),
            normal: [
                0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
                1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
                0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
               -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
                0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
                0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
            ],
        },
        uniforms: {
            model: mat4.create(),
            projection: ({viewportWidth, viewportHeight}) => 
                mat4.perspective(
                    mat4.create(),
                    45 * Math.PI / 180,
                    viewportWidth / viewportHeight,
                    0.1,
                    100.0,
                ),
            view: () => mouse.view(),
            lightColor: regl.prop('lightColor'),
            lightPosition: regl.prop('lightPosition'),
            ambientLight: regl.prop('ambientLight'),
        },
        elements: [
            0, 1, 2,   0, 2, 3,    // front
            4, 5, 6,   4, 6, 7,    // right
            8, 9,10,   8,10,11,    // up
           12,13,14,  12,14,15,    // left
           16,17,18,  16,18,19,    // down
           20,21,22,  20,22,23     // back  
        ],
    })

    let process:() => void = () => {}; 

    regl.frame(() => {
        regl.clear({
            depth: 1,
            color: [0, 0, 0, 1],
        })
        mouse.tick();

        basicCube({
            lightColor: effects.light,
            lightPosition: effects.lightPosition,
            ambientLight: effects.ambientLight,            
        }, () => process());
    })

    return {
        empty: () => {
            const drawCube = regl({
                vert: `
                ${glsl.prefix.vert}
                ${glsl.light.vert}
                attribute vec3 color;
                varying vec3 v_color;
        
                void main () {
                    runPrefix();
                    runLight();
        
                    v_color = color;
                }
                `,
                frag: `
                ${glsl.prefix.frag}
                ${glsl.light.frag}
                ${glsl.ambient.frag}
                varying vec3 v_color;
        
                void main () {
                    vec3 light = getLight(v_color);
                    vec3 ambient = getAmbient(v_color);
                    gl_FragColor = vec4(light + ambient, 1.);
                }
                `,
                blend: {
                    enable: true,
                    func: {
                        src: 1,
                        dst: 'one minus src alpha',
                    }
                },
                attributes: {
                    color: [
                        0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(purple)
                        0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
                        1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
                        1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left(yellow)
                        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down(white)
                        0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back(blue)
                    ],
                }
            });

            process = () => drawCube();
        },
        texture: (spec:GLTextureSpec) => {
            const drawCube = regl({
                vert: `
                ${glsl.prefix.vert}
                ${glsl.light.vert}
                varying vec3 v_texCoord;
        
                void main () {
                    runPrefix();
                    runLight();
                    v_texCoord = position;
                }
                `,
                frag: `
                ${glsl.prefix.frag}
                ${glsl.light.frag}
                ${glsl.ambient.frag}
                varying vec3 v_texCoord;
                uniform samplerCube cube;
        
                void main () {
                    vec4 color = textureCube(cube, v_texCoord);
                    vec3 light = getLight(color.xyz);
                    vec3 ambient = getAmbient(color.xyz);
                    gl_FragColor = vec4(light + ambient, color.a);
                }
                `,
                uniforms: {
                    cube: regl.prop('cube'),
                },
                blend: {
                    enable: true,
                    func: {
                        src: 1,
                        dst: 'one minus src alpha',
                    }
                },
            });

            const faces:HTMLImageElement[] = new Array(6);
            // posX, negX, posY, negY, posZ, negZ

            for (let i = 0; i < faces.length; i ++) {
                faces[i] = new Image();
                faces[i].onload = run;
            }

            faces[0].src = spec.tex[Face.right].texture;
            faces[1].src = spec.tex[Face.left].texture;
            faces[2].src = spec.tex[Face.top].texture;
            faces[3].src = spec.tex[Face.bottom].texture;
            faces[4].src = spec.tex[Face.front].texture;
            faces[5].src = spec.tex[Face.back].texture;
            
            let count = 0;

            function run () {
                if (count < 5) {
                    count ++;
                } else {
                    if (!allTheSame(faces, ['width', 'height'])) {
                        alert('the image size is incorrect');
                        return;
                    }
                    process = () => drawCube({
                        cube: regl.cube(...faces),
                    });
                }
            }
        },
        effect: (effects) => {
            const { onLight, onAmbient } = effects;

            if (!onLight && !onAmbient) {
                
            }
        },
    }
}


function allTheSame (compileList:any[], props:string[]) : boolean {
    const data1 = {};
    for (let i = 0; i < props.length; i ++) {
        data1[props[i]] = compileList[0][props[i]];
    }

    for (let i = 1; i < compileList.length; i ++) {
        for (let j = 0; j < props.length; j ++) {
            const name = props[j];
            if (compileList[i][name] !== data1[name]) {
                return false;
            }
        }
    }

    return true;
}