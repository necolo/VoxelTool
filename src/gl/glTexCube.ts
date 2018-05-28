import { Face } from '../client/texture';
import { glCacheFunc } from './glCache';

import { CubeType } from './main';

export type GLTextureSpec = {
    tex:{[face:number]:{
        texture:string;
        emissive:string;
        specular:string;
        normal:string;
    }},
    transparent:boolean,
}

export function glTexCube (regl) {
    return function (spec:GLTextureSpec, type:CubeType) {
        let count = 0;
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

        const glspec = {
            cube: regl.cube(...faces),
        }

        function run() {
            if (count < 5) {
                count ++;
            } else {
                if (!allTheSame(faces, ['width', 'height'])) {
                    alert('the image size is incorrect');
                    return;
                }

                type = CubeType.texture;
            }    
        }

        return function (cache) {
            cache.set('base', {
                vert: {
                    prefix: `
                    varying vec3 v_texCoord,
                    `,
                    main: `
                    v_texCoord = position;
                    `,
                },
                frag: {
                    prefix: `
                    varying vec3 v_texCoord;
                    uniform samplerCube cube;
                    `,
                    main: `
                    gl_FragColor = textureCube(cube, v_texCoord); 
                    `,
                },
            });

            regl({
                vert: regl.prop('vert'),
                frag: regl.prop('frag'),
                uniforms: {
                    cube: regl.prop('cube'),
                },
                blend: {
                    enable: true,
                    func: {
                        src: 1,
                        dst: 'one minus src alpha',
                    }
                }
            })(Object.assign(cache.build(), glspec));
        }
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