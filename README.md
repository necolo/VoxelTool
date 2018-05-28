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

                attribute vec3 position;
                uniform mat4 projection, view;
                attribute vec3 normal;
                varying vec4 v_cameraPosition;
                varying vec3 v_normal;
                attribute vec3 color;
                varying vec3 v_color;

                void main() {
                    gl_Position = projection * view * vec4(position, 1.);
                    v_color = color;
                    v_cameraPosition = view * vec4(position, 1.);
                    v_normal = normalize((view * vec4(normal, 0.)).xyz);
                }

                precision mediump float; 
                uniform vec3 lightColor, lightPosition;
                varying vec4 v_cameraPosition;
                varying vec3 v_normal;
                uniform vec3 ambientLight;
                varying vec3 v_color;

                void main () {
                    gl_FragColor = vec4(v_color, 1.);
                    vec3 lightDirection = normalize(lightPosition - v_cameraPosition.xyz / v_cameraPosition.w);
                    float nDotL = max(dot(lightDirection, v_normal), 0.);
                    gl_FragColor = vec4(lightColor * gl_FragColor.rgb * nDotL, gl_FragColor.a);
                    gl_FragColor = vec4(gl_FragColor.rgb * ambientLight, gl_FragColor.a);
                }