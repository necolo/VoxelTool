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

export function glCache () {
    const cache:glCacheT = {};

    return {
        set: (name:string, shader:{vert:shaderT, frag:shaderT}) => {
            cache[name] = shader;
        },
        build: () : glslT => {
            const shaders = Object.keys(cache);
            return {
                vert: `
                attribute vec3 position;
                uniform mat4 projection, view;
                ${shaders.map((shader) => cache[shader].vert.prefix)}

                void main() {
                    gl_Position = projection * vew * vec4(position, 1.);
                    ${shaders.map((shader) => cache[shader].vert.main)}
                }
                `,
                frag: `
                precision mediump float; 
                ${shaders.map((shader) => cache[shader].frag.prefix)}

                void main () {
                    ${shaders.map((shader) => cache[shader].frag.main)}
                }
                `,
            }
        }
    }
}