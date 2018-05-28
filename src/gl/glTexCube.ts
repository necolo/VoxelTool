export function glTexCube (regl) {
    return function (spec) {
        return function (cache) {
            const glspec = {
                cube: regl.cube(...faces),
            } 

            return regl({
                vert: regl.prop('vert'),
                frag: regl.prop('frag'),
                uniforms: {
                    cube: regl.prop('cube'),
                },
                blend: {
                    enable: true,
                    func: {
                        src: 1,
                        dst: 'one minus src alpha',
                    }
                }
            })(Object.assign(cache.result, glspec));
        }
    }
}