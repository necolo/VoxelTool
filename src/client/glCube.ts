import { mat4 } from 'gl-matrix';

import { Texture } from './ui';
import { glMouse } from './glMouse';

  // cube points
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

const POSITION:[number, number, number][] = [
    [1.0, 1.0, 1.0],
    [-1.0, 1.0, 1.0],
    [-1.0, -1.0, 1.0],
    [1.0, -1.0, 1.0],
    [1.0, -1.0, -1.0],
    [1.0, 1.0, -1.0],
    [-1.0, 1.0, -1.0],
    [-1.0, -1.0, -1.0],
]

const TEXTURE_COOR:[number, number][] = [
    [1.0, 1.0],
    [0.0, 1.0],
    [0.0, 0.0],
    [1.0, 0.0],
]

export type GLTextureSpec = {
    [face:number]:{
        texture:string;
        emissive:string;
        specular:string;
        normal:string;
    }
}

export type DrawCubeT = {
    empty: () => void,
    texture: (spec:GLTextureSpec) => void,  
}

export function glCube (canvas:HTMLCanvasElement, texture?:string) : DrawCubeT {
    const regl = require('regl')(canvas);
    const mouse = glMouse(canvas);

    const basicCube = regl({
        attributes: {
            position: insertArray(POSITION, [
                0, 1, 2, 3,
                4, 5, 6, 7,
                0, 1, 6, 5,
                2, 3, 4, 7,
                0, 3, 4, 5,
                1, 2, 7, 6,
            ]),
            color: [
                0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
                0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
                1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
                1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
                1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
                0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
            ],
        },
        uniforms: {
            model: regl.context('model'),
            projection: regl.context('projection'),
            view: regl.context('view'),
        },
        elements: [
            0, 1, 2,   0, 2, 3,    // front
            4, 5, 6,   4, 6, 7,    // right
            8, 9,10,   8,10,11,    // up
           12,13,14,  12,14,15,    // left
           16,17,18,  16,18,19,    // down
           20,21,22,  20,22,23     // back  
        ],
        context: {
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
        }
    })

    let process:() => void = () => {}; 

    regl.frame(() => {
        regl.clear({
            depth: 1,
            color: [0, 0, 0, 1],
        })
        mouse.tick();
        process();
    })
    
    return {
        empty: () => {
            const drawCube = regl({
                vert: `
                attribute vec3 position, color;
                uniform mat4 model, projection, view;
                varying vec4 v_color;
            
                void main() {
                  v_color = vec4(color, 1.0);
                  gl_Position = projection * view * model * vec4(position, 1.);
                }   
                `,
                frag: `
                precision mediump float;
                varying vec4 v_color;

                void main() {
                    gl_FragColor = v_color;
                } 
                `,
            });

            process = () => basicCube(undefined, () => drawCube());
        },
        texture: (spec) => {
            const drawCube = regl({
                vert: `
                attribute vec3 position, color;
                uniform mat4 model, projection, view;
                varying vec4 v_color;
                varying vec3 v_textureCoor;
            
                void main() {
                  v_color = vec4(color, 1.0);
                  v_textureCoor = position;
                  gl_Position = projection * view * model * vec4(position, 1.);
                }
                `,
                frag: `
                precision mediump float;
                uniform samplerCube cube; 
                varying vec4 v_color;
                varying highp vec3 v_textureCoor;
        
                void main() {
                    gl_FragColor = textureCube(cube, v_textureCoor);
                } 
                `,
                uniforms: {
                    cube: regl.prop('cube'),
                }
            });

            const faces:HTMLImageElement[] = new Array(6);
            // posX, negX, posY, negY, posZ, negZ

            for (let i = 0; i < faces.length; i ++) {
                faces[i] = new Image();
                faces[i].onload = run;
            }

            faces[0].src = spec[Texture.right].texture;
            faces[1].src = spec[Texture.left].texture;
            faces[2].src = spec[Texture.top].texture;
            faces[3].src = spec[Texture.bottom].texture;
            faces[4].src = spec[Texture.front].texture;
            faces[5].src = spec[Texture.back].texture;
            
            let count = 0;

            function run () {
                if (count < 5) {
                    count ++;
                } else {
                    process = () => basicCube(undefined, () => drawCube({
                        cube: regl.cube(...faces)
                    }))
                }
            }
        },
    }
}

function insertArray (insert:number[][], order:number[]) : number[][] {
    const res:number[][] = [];
    for (let i = 0; i < order.length; i ++) {
        res.push(insert[order[i]]);         
    }
    return res;
}