import { mat4 } from 'gl-matrix';
import { ControlBox } from 'control-box';

import { Face } from './texture';
import { glMouse, Vector3 } from './glMouse';

  // cube points
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

const POINTS:[number, number, number][] = [
    [1.0, 1.0, 1.0],
    [-1.0, 1.0, 1.0],
    [-1.0, -1.0, 1.0],
    [1.0, -1.0, 1.0],
    [1.0, -1.0, -1.0],
    [1.0, 1.0, -1.0],
    [-1.0, 1.0, -1.0],
    [-1.0, -1.0, -1.0],
]

const POSITION = insertArray(POINTS, [
    0, 1, 2, 3,
    0, 3, 4, 5,
    0, 5, 6, 1,
    1, 6, 7, 2,
    7, 4, 3, 2,
    4, 7, 6, 5,    
]);

const COLOR = [
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(purple)
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left(yellow)
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down(white)
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back(blue)    
];

const NORMAL = [
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
];

const ELEMENTS = [
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back  
]

const TEXTURE_COOR = [
    [1.0, 1.0],
    [0.0, 1.0],
    [0.0, 0.0],
    [1.0, 0.0],
];

export type GLTextureSpec = {
    tex:{[face:number]:{
        texture:string;
        emissive:string;
        specular:string;
        normal:string;
    }},
    transparent:boolean,
}

export type glFaceData = {
    position:number[],
    normal:number[],
    color:number[],
    elements:number[],
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

    const setup = regl({
        uniforms: {
            projection:  ({viewportWidth, viewportHeight}) => 
            mat4.perspective(
                mat4.create(),
                45 * Math.PI / 180,
                viewportWidth / viewportHeight,
                0.1,
                100.0,
            ),
            view: () => mouse.view(),
            lightColor: [1.0, 1.0, 1.0],
            lightPosition: [20, 0, 0],
            ambientLight: [0.8, 0.8, 0.8],
        },
    })
    mouse.tick();

    let process:() => void = () => {}; 

    // regl.frame(() => {
    //     regl.clear({
    //         depth: 1,
    //         color: [0, 0, 0, 1],
    //     })
    //     mouse.tick();
    //     process();
    // })

    return {
        empty: () => {
            const drawCube = regl({
                vert: `
                attribute vec3 position, color, normal;
                uniform mat4 projection, view;
                varying vec4 v_cameraPosition;
                varying vec3 v_normal, v_color;
            
                void main() {
                  vec4 cameraPosition = view * vec4(position, 1.);
                  gl_Position = projection * cameraPosition;

                  v_normal = normalize((view * vec4(normal, 0.)).xyz);
                  v_color = color;
                  v_cameraPosition = cameraPosition;
                }
                `,
                frag: `
                precision mediump float;
                uniform vec3 lightColor, lightPosition, ambientLight;
                varying vec3 v_normal, v_color;
                varying vec4 v_cameraPosition;

                void main() {
                    vec3 lightDirection = normalize(lightPosition - v_cameraPosition.xyz / v_cameraPosition.w);
                    float nDotL = max(dot(lightDirection, v_normal), 0.);
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
                attributes: {
                    position: POSITION,
                    color: COLOR,
                    normal: NORMAL,
                },
                elements: ELEMENTS,
            });

            process = () => setup(undefined, () => drawCube());
        },
        texture: (spec:GLTextureSpec) => {
            const drawCube = regl({
                vert: `
                attribute vec3 position, normal;
                attribute vec2 texCoord;
                uniform mat4 projection, view;
                varying vec2 v_texCoord;
                varying vec4 v_cameraPosition;
                varying vec3 v_normal;
            
                void main() {
                  vec4 cameraPosition = view * vec4(position, 1.);
                  gl_Position = projection * cameraPosition;

                  v_texCoord = texCoord;
                  v_cameraPosition = cameraPosition;
                  v_normal = normalize((view * vec4(normal, 0.)).xyz);
                }
                `,
                frag: `
                precision mediump float;
                uniform sampler2D texture; 
                uniform vec3 lightColor, lightPosition, ambientLight;
                varying vec2 v_texCoord;
                varying vec3 v_normal;
                varying vec4 v_cameraPosition;
        
                void main() {
                    vec4 color = texture2D(texture, v_texCoord);
                    // vec3 lightDirection = normalize(lightPosition - v_cameraPosition.xyz / v_cameraPosition.w);
                    // float nDotL = max(dot(lightDirection, v_normal), 0.);
                    // vec3 diffuse = lightColor * color.rgb * nDotL;
                    // vec3 ambient = ambientLight * color.rgb;

                    // gl_FragColor = vec4(diffuse + ambient, color.a);
                    gl_FragColor = color;
                } 
                `,
                uniforms: {
                    texture: regl.prop('texture'),
                },
                blend: {
                    enable: true,
                    func: {
                        src: 1,
                        dst: 'one minus src alpha',
                    }
                },
                attributes: {
                    position: getFaceData(regl.prop('face')).position,
                    normal: getFaceData(regl.prop('face')).normal,
                    texCoord: [
                        0.0,  0.0,
                        1.0,  0.0,
                        1.0,  1.0,
                        0.0,  1.0,
                    ],
                },
                count: 4,
            });

            const faces:HTMLImageElement[] = new Array(6);
            const order = [Face.right, Face.left, Face.top, Face.bottom, Face.front, Face.back];
            // posX, negX, posY, negY, posZ, negZ

            const drawFaces:(() => void)[] = new Array(Face.length);
            for (let i = 0; i < faces.length; i ++) {
                faces[i] = new Image();
                faces[i].src = spec.tex[order[i]].texture;
                faces[i].onload = () => {
                    setup(undefined, () => drawCube({
                        face: i,
                        texture: regl.texture(faces[i]),
                    })) 
                }
                // drawFaces[i] = () => setup(undefined, () => drawCube({
                //     face: i,
                //     texture: regl.texture(faces[i]),
                // }))
                // drawFaces[i]();
            }

            regl.clear({
                depth: 1,
                color: [0, 0, 0, 1],
            })

            process = () => {
                for (let drawFace of drawFaces) {
                    drawFace();
                }
            }
        },
    }
}

function insertArray (insert:number[][], order:number[]) : number[] {
    const res:number[] = [];
    for (let i = 0; i < order.length; i ++) {
        res.push(...insert[order[i]]);
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

function getFaceData (face:Face) : glFaceData {
    const order = [Face.front, Face.right, Face.top, Face.left, Face.bottom, Face.back];
    const index = order.indexOf(face);

    return {
        position: POSITION.slice(index * 4 * 3, 4 * 3 * (index + 1)),
        color: COLOR.slice(index * 4 * 3, 4 * 3 * (index + 1)),
        normal: NORMAL.slice(index * 4 * 3, 4 * 3 * (index + 1)),
        elements: ELEMENTS.slice(index * 6, 6 * (index + 1)),
    }
}

console.log(POSITION);
console.log(getFaceData(Face.front));