import { mat4 } from 'gl-matrix';
import { ControlBox } from 'control-box';

import { Face } from './texture';
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
}

export function glCube (canvas:HTMLCanvasElement, texture?:string) : DrawCubeT {
    const regl = require('regl')(canvas);
    const mouse = glMouse(canvas);

    mouse.preset({
        camera: [0, 0, 8],
    })

    const box = new ControlBox();

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
            color: [
                0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(purple)
                0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
                1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
                1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left(yellow)
                1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down(white)
                0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back(blue)
            ],
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
            model: regl.context('model'),
            projection: regl.context('projection'),
            view: regl.context('view'),
            lightColor: [1.0, 1.0, 1.0],
            lightPosition: [20, 0, 0],
            ambientLight: [0.2, 0.2, 0.2],
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
                attribute vec3 position, color, normal;
                uniform mat4 model, projection, view;
                varying vec4 v_cameraPosition;
                varying vec3 v_normaled, v_color;
            
                void main() {
                  vec4 cameraPosition = view * vec4(position, 1.);
                  gl_Position = projection * cameraPosition;

                  vec3 normaled = normalize((view * vec4(normal, 0.)).xyz);
                  v_color = color;
                  v_normaled = normaled;
                  v_cameraPosition = cameraPosition;
                }
                `,
                frag: `
                precision mediump float;
                uniform vec3 lightColor, lightPosition, ambientLight;
                varying vec3 v_normaled, v_color;
                varying vec4 v_cameraPosition;

                void main() {
                    vec3 lightDirection = normalize(lightPosition - v_cameraPosition.xyz / v_cameraPosition.w);
                    float nDotL = max(dot(lightDirection, v_normaled), 0.);
                    vec3 diffuse = lightColor * v_color * nDotL;
                    vec3 ambient = ambientLight * v_color.rgb;

                    gl_FragColor = vec4(diffuse + ambient, 1.);
                } 
                `,
                blend: {
                    enable: true,
                    func: {
                        src: 1,
                        dst: 'one minus src alpha',
                    }
                },
            });

            process = () => basicCube(undefined, () => drawCube());
        },
        texture: (spec:GLTextureSpec) => {
            const drawCube = regl({
                vert: `
                attribute vec3 position, color, normal;
                uniform mat4 model, projection, view;
                varying vec3 v_textureCoor;
                varying vec4 v_cameraPosition;
                varying vec3 v_normaled;
            
                void main() {
                  vec4 cameraPosition = view * vec4(position, 1.);
                  gl_Position = projection * cameraPosition;

                  v_textureCoor = position;
                  v_cameraPosition = cameraPosition;
                  v_normaled = normalize((view * vec4(normal, 0.)).xyz);
                }
                `,
                frag: `
                precision mediump float;
                uniform samplerCube cube; 
                uniform vec3 lightColor, lightPosition, ambientLight;
                varying vec3 v_textureCoor, v_normaled;
                varying vec4 v_cameraPosition;
        
                void main() {
                    vec4 textureColor = textureCube(cube, v_textureCoor);
                    vec3 lightDirection = normalize(lightPosition - v_cameraPosition.xyz / v_cameraPosition.w);
                    float nDotL = max(dot(lightDirection, v_normaled), 0.);
                    vec3 diffuse = textureColor.rgb * nDotL;
                    vec3 ambient = ambientLight * textureColor.rgb;

                    gl_FragColor = vec4(diffuse + ambient, textureColor.a);
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
                    process = () => basicCube(undefined, () => drawCube({
                        cube: regl.cube(...faces),
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