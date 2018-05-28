import { glCacheFunc } from './glCache';
import { UI } from '../client/ui';

export function glAmbient(cache:glCacheFunc, ui:UI) {
    return function () {
        const { onAmbient } = ui.effects;

        if (onAmbient) {
            cache.set('embient', {
                vert: {
                    prefix: `
                    `,
                    main: `
                    `,
                },
                frag: {
                    prefix: `
                    uniform vec3 ambientLight;
                    `,
                    main: `
                    gl_FragColor = vec4(gl_FragColor.rgb + ambientLight, gl_FragColor.a);
                    `,
                }
            });
        } else {
            cache.remove('embient');
        }
    }
}