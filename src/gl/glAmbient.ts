import { glCacheFunc, glModules } from './glCache';
import { UI } from '../client/ui';

export function glAmbient(cache:glCacheFunc, ui:UI) {
    return function () {
        const { onAmbient } = ui.effects;

        if (onAmbient) {
            cache.set(glModules.ambient, {
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
                    vec3 ambient = ambientLight * color.rgb;

                    #ifdef LIGHT
                    gl_FragColor = vec4(light + ambient, color.a);

                    #else
                    gl_FragColor = vec4(ambient, color.a);

                    #endif
                    `,
                }
            });
        } else {
            cache.remove(glModules.ambient);
        }
    }
}