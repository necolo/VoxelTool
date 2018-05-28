import { glCacheFunc } from './glCache';

export function glEmptyCube(regl, cache:glCacheFunc) {
    cache.set('base', {
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
    });

    return function () {
        const glSpec = cache.build();
        return function () {
            regl({
                vert: regl.prop('vert'),
                frag: regl.prop('frag'),
                attributes: {
                    color: [
                        0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(purple)
                        0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
                        1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
                        1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left(yellow)
                        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down(white)
                        0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back(blue)
                    ],
                },
                blend: {
                    enable: true,
                    func: {
                        src: 1,
                        dst: 'one minus src alpha',
                    }
                },
            })(glSpec);
        }

    }
}