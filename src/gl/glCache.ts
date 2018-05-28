import { UI } from '../client/ui';

export type glslT = {
    vert:string,
    frag:string,
}

export type shaderT = {
    prefix:string,
    main:string,
}

export type glCacheT = {
    [name:string]:{
        vert:shaderT,
        frag:shaderT,
    },
}

export type glCacheFunc = {
    set: (name:string, shader: {vert:shaderT, frag:shaderT}) => void,
    remove: (name:string) => void,
    build: () => glslT,
}

export function glCache () {
    const cache:glCacheT = {};

    return {
        set: (name, shader) => {
            cache[name] = shader;
        },
        remove: (name) => {
            delete cache[name];
        },
        build: () : glslT => {
            const shaders = Object.keys(cache);
            const res = {
                vert: `
                attribute vec3 position;
                uniform mat4 projection, view;
                ${shaders.map((shader) => cache[shader].vert.prefix).join('')}

                void main() {
                    gl_Position = projection * view * vec4(position, 1.);
                    ${cache.base.vert.main}
                    ${shaders.map((shader) => {
                        if (shader !== 'base') return cache[shader].vert.main;
                        else return '';
                    }).join('')}
                }
                `,
                frag: `
                precision mediump float; 
                ${shaders.map((shader) => cache[shader].frag.prefix).join('')}

                void main () {
                    ${cache.base.frag.main}
                    ${shaders.map((shader) => {
                        if (shader !== 'base') return cache[shader].frag.main;
                        else return '';
                    }).join('')}
                }
                `,
            }

            console.log(res.vert);
            console.log(res.frag);
            return res;
        }
    }
}