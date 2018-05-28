import { glCacheFunc } from './glCache';
import { UI } from '../client/ui';

export function glLight(cache:glCacheFunc, ui:UI) {
    const { onLight } = ui.effects;

    return function () {
        if (onLight) {
            cache.set('light', {
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
                    `,
                    main: `
                    vec3 lightDirection = normalize(lightPosition - v_cameraPosition.xyz / v_cameraPosition.w);
                    float nDotL = max(dot(lightDirection, v_normal), 0.);
                    gl_FragColor = vec4(lightColor * gl_FragColor.rgb * nDotL, gl_FragColor.a);
                    `,
                }
            });
        } else {
            cache.remove('light');
        }
    }
}