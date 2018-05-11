import { mat4 } from 'gl-matrix';

  // Create a cube
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

export = function (canvas:HTMLCanvasElement, texture?:string) {
    const regl = require('regl')(canvas);
    const camera = require('canvas-orbit-camera')(canvas);

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
            textureCoor: insertArray(TEXTURE_COOR, [
                0, 1, 2, 3,
                3, 0, 1, 2,
                3, 2, 1, 0,
                2, 3, 0, 1,
                1, 2, 3, 0,
                0, 3, 2, 1,
            ]),
        },

        uniforms: {
            model: ({tick}) => {
                let m = mat4.create();
                const t = tick * 0.01;
                mat4.translate(m, m, [-0.0, 0.0, -6.0]); 
                mat4.rotate(m, m, t, [0, 1, 0]);
                return m;
            },
            projection: ({viewportWidth, viewportHeight}) => 
                mat4.perspective(
                    mat4.create(),
                    45 * Math.PI / 180,
                    viewportWidth / viewportHeight,
                    0.1,
                    100.0,
                ),
            view: () => camera.view(),
            cube: regl.prop('cube'),
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
    
    const posX = new Image();
    posX.onload = function() {
        regl.frame(() => {
            clear();
            camera.tick();
            drawCube({
                cube: regl.cube(
                    posX,
                    posX,
                    posX,
                    posX,
                    posX,
                    posX, 
                )
            })
        })
    }
    posX.src = './grass_side.png';
    const negX = new Image();
    const posY = new Image();
    const negY = new Image();
    const posZ = new Image();
    const negZ = new Image();

    function clear() {
        regl.clear({
            depth: 1,
            color: [0, 0, 0, 1],
        });
    }
}

function insertArray (insert:number[][], order:number[]) : number[][] {
    const res:number[][] = [];
    for (let i = 0; i < order.length; i ++) {
        res.push(insert[order[i]]);         
    }
    return res;
}