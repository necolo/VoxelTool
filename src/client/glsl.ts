import { UI } from './ui';

export const glsl = {
    light: {
        vert: `
            attribute vec3 normal;
            varying vec4 v_cameraPosition;
            varying vec3 v_normal;

            void runLight () {
                v_cameraPosition = view * vec4(position, 1.);
                v_normal = normalize((view * vec4(normal, 0.)).xyz);
            } 
        `,

        frag: `
            uniform vec3 lightColor, lightPosition;
            varying vec4 v_cameraPosition;
            varying vec3 v_normal;

            vec3 getLight (vec4 color) {
                vec3 lightDirection = normalize(lightPosition - v_cameraPosition.xyz / v_cameraPosition.w);
                float nDotL = max(dot(lightDirection, v_normal), 0.);
                vec3 diffuse = lightColor * color.rgb * nDotL;
                return diffuse;
            }
        `,
    },

    ambient: {
        frag: `
            uniform vec3 ambientLight;

            vec3 getAmbient (vec4 color) {
                return ambientLight * color.rgb;
            }
        `,
    },
}

export type cubeGLSL = {
    emptyCube: glslT,
    texCube: glslT,
}

export type glslT = {
    vert:string,
    frag:string,
}

export function createGLSL (ui:UI) : cubeGLSL {
    const res = {
        emptyCube: {
            vert: '',
            frag: '',
        },
        texCube: {
            vert: '',
            frag: '',
        },
    }

    const { onLight, onAmbient } = ui.effects;

    const texCube = {
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
            gl_FragColor = textureCube(cube, v_texCoord);
            `,
        }
    }

    const emptyCube = {
        vert: {
            prefix: `
            attribute vec3 color;
            varying vec3 v_color;
            `,
            main: `
            v_color = color;
            `,
        },
        frag: {
            prefix: `
            varying vec3 v_color;
            `,
            main: `
            gl_FragColor = vec4(v_color, 1.);
            `,
        }
    }

    if (!onLight && !onAmbient) {
        res.emptyCube = initGLSL(emptyCube);
        res.texCube = initGLSL(texCube);
    } else if (onLight && !onAmbient) {
        res.emptyCube = initGLSL(emptyCube, glsl.light);        
        res.texCube = initGLSL(texCube, glsl.light);
    } else if (!onLight && onAmbient) {
        res.emptyCube = initGLSL(emptyCube, glsl.ambient);
        res.texCube = initGLSL(texCube, glsl.ambient);
    } else {
        res.emptyCube = initGLSL(emtpyCube, glsl.light, glsl.ambient);
        res.texCube = initGLSL(texCube, glsl.light, glsl.ambient);
    }

    function createVert (prefix:string, main:string) : string {
        return `
        attribute vec3 position;
        uniform mat4 model, projection, view;
        ${prefix} 

        void main () {
            gl_Position = projection * view * vec4(position, 1.);
            ${main}
        }
        `;
    }

    function createFrag(prefix:string, main:string) : string {
        return `
        precision mediump float;
        ${prefix}

        void main () {
            ${main}
        }
        `;
    }

    return res;
}