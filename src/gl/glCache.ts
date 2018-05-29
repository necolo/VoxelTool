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
    vert:shaderT,
    frag:shaderT,
}[];

export type glCacheFunc = {
    set: (module:glModules, shader: {vert:shaderT, frag:shaderT}) => void,
    remove: (module:glModules) => void,
    build: () => glslT,
}

export enum glModules {
    base,
    light,
    ambient,
    length,
}

export function glCache () : glCacheFunc {
    const cache:glCacheT = new Array(glModules.length);

    function alloc() : {vert:shaderT, frag:shaderT}{
        return {
            vert: {prefix: '', main: ''},
            frag: {prefix: '', main: ''},
        }
    }

    return {
        set: (module:glModules, shader:{vert:shaderT, frag:shaderT}) => {
            cache[module] = shader;
        },
        remove: (module:glModules) => {
            cache[module] = alloc();
        },
        build: () : glslT => {
            const shaders = Object.keys(cache);
            const res = {
                vert: `
                attribute vec3 position;
                uniform mat4 projection, view;
                ${cache.map((shader) => shader.vert.prefix).join('')}

                void main() {
                    gl_Position = projection * view * vec4(position, 1.);
                    ${cache.map((shader) => shader.vert.main).join('')}
                }
                `,
                frag: `
                precision mediump float; 
                ${cache.map((shader) => shader.frag.prefix).join('')}

                void main () {
                    ${cache.map((shader) => shader.frag.main).join('')}
                }
                `,
            }
            return res;
        }
    }
}