import { Face } from '../client/texture';
import { glCacheFunc, glModules } from './glCache';

export type GLTextureSpec = {
    tex:{[face:number]:{
        texture:string;
        emissive:string;
        specular:string;
        normal:string;
    }},
    transparent:boolean,
}

export function glTexCube (regl, cache:glCacheFunc) {
    return function (spec:GLTextureSpec, next:(gl: () => void) => void) {
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

        cache.set(glModules.base, {
            vert: {
                prefix: `
                varying vec3 v_texCoord;
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
                vec4 color = textureCube(cube, v_texCoord); 
                gl_FragColor = color; 
                `,
            },
        });

        function run() {
            if (count < 5) {
                count ++;
            } else {
                if (!allTheSame(faces, ['width', 'height'])) {
                    alert('the image size is incorrect');
                    return;
                }

                const glSpec = Object.assign(cache.build(), {
                    cube: regl.cube(...faces),
                });

                next(() => {
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
                    })(glSpec);
                })
            }
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