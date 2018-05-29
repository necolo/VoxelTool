import { glCacheFunc, glModules } from './glCache';
import { UI } from '../client/ui';

export function glLight(cache:glCacheFunc, ui:UI) {
    return function () {
        const { onLight } = ui.effects;
        if (onLight) {
            cache.set(glModules.light, {
                vert: {
                    prefix: `
                    attribute vec3 normal;
                    varying vec4 v_cameraPosition;
                    varying vec3 v_normal;
                    `,
                    main: `
                    v_cameraPosition = view * vec4(position, 1.);
                    v_normal = normalize((view * vec4(normal, 0.)).xyz);
                    `,
                },
                frag: {
                    prefix: `
                    uniform vec3 lightColor, lightPosition;
                    varying vec4 v_cameraPosition;
                    varying vec3 v_normal;

                    #define LIGHT
                    `,
                    main: `
                    vec3 lightDirection = normalize(lightPosition - v_cameraPosition.xyz / v_cameraPosition.w);
                    float nDotL = max(dot(lightDirection, v_normal), 0.);
                    vec3 light = lightColor * color.rgb * nDotL;

                    gl_FragColor = vec4(light, color.a);
                    `,
                }
            });
        } else {
            cache.remove(glModules.light);
        }
    }
}