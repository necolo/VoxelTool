# Instruction
don't know what to say yet. 

# Install
```
npm install
npm run watch
npm run start2
```


# todo

baisc：
- background image
- save image to server side

further：
- read all voxels from server
- select voxel and modify the data


```js

const glsl = {
    prefix: {
        vert: `
            attribute vec3 position;
            uniform mat4 model, projection, view;

            void runPrefix () {
                gl_Position = projection * view * vec4(position, 1.);
            }
        `,

        frag: `
            precision mediump float;
        `,
    },

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

            vec3 getLight (vec3 color) {
                vec3 lightDirection = normalize(lightPosition - v_cameraPosition.xyz / v_cameraPosition.w);
                float nDotL = max(dot(lightDirection, v_normal), 0.);
                vec3 diffuse = lightColor * color * nDotL;
                return diffuse
            }
        `,
    },

    ambient: {
        frag: `
            uniform vec3 ambientLight;

            vec3 getAmbient (vec3 color) {
                return ambientLight * color.rgb;
            }
        `,
    }
}

const emptyCube = {
    vert: `
        ${glsl.prefix.vert}
        ${glsl.light.vert}
        attribute vec3 color;
        varying vec3 v_color;

        void main () {
            runPrefix();
            runLight();

            v_color = color;
        }
    `,
    frag: `
        ${glsl.prefix.frag}
        ${glsl.light.frag}
        ${glsl.ambient.frag}
        varying vec3 v_color;

        void main () {
            vec3 light = getLight(v_color);
            vec3 ambient = getAmbient(v_color);
            gl_FragColor = vec4(light + ambient, 1.);
        }
    `,
}

const texCube = {
    vert: `
        ${glsl.prefix.vert}
        ${glsl.light.vert}
        varying vec3 v_texCoord;

        void main () {
            runPrefix();
            runLight();
            v_texCoord = position;
        }
    `,

    frag: `
        ${glsl.prefix.frag}
        ${glsl.light.frag}
        ${glsl.ambient.frag}
        varying vec3 v_texCoord;
        uniform samplerCube cube;

        void main () {
            vec4 color = textureCube(cube, v_texCoord);
            vec3 light = getLight(color);
            vec3 ambient = getAmbient(color);
            gl_FragColor = vec4(light + ambient, color.a);
        }
    `,
}

```