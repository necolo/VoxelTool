import { mat4, vec3 } from 'gl-matrix';

export type Vector3 = [number, number, number];

//todo: add:
// set_camera (distance, lat, lon)
// set_wheelSpeed
// set_moveSpeed
export type MouseT = {
    tick: () => void;
    model: () => mat4;
    view: () => mat4;
    lightDirection: () => Vector3|Vector3[];
    lightPosition: () => Vector3|Vector3[];
    set_lightDirection: (direction:Vector3[]) => void;
    set_lightPoint: (position:Vector3[]) => void;
}

export function glMouse (canvas:HTMLCanvasElement) : MouseT {
    const { height, width }  = canvas;

    let radius = -8;
    let lat = -0.3;
    let lon = -0.72;

    let rotate:mat4 = mat4.create();

    let lastMouseX = 0;
    let lastMouseY = 0;

    let latAngle = 0;
    let lonAngle = 0;

    const handleWheel = (ev) => {
        ev.preventDefault();
        radius -= ev.deltaY * 0.001;
    }

    const handleDragmove = (ev) => {
        ev.preventDefault();
        lon += ev.movementX * 0.01;
        lonAngle += ev.movementX * 0.01;

        if (lat < 1.57 && lat > -1.57) {
            lat -= ev.movementY * 0.01;
            latAngle += ev.movementX * 0.01;
        } else {
            lat = (lat > 0) ? 1.56 : -1.56;
        }
    }

    const res:MouseT = {} as MouseT;

    const light_direction:Vector3[] = [];
    res.set_lightDirection = (direction) => {
        for (let i = 0; i < direction.length; i ++) {
            light_direction.push(direction[i])
        }
    }

    const light_position:Vector3[] = [];
    res.set_lightPoint = (position) => {
        for (let i = 0; i < position.length; i ++) {
            light_position.push(position[i]);
        }
    }

    res.tick = () => {
        const circleX = radius * Math.cos(lon) * Math.cos(lat);
        const circleY = radius * Math.sin(lat);
        const circleZ = radius * Math.sin(lon) * Math.cos(lat);
        res.view = () => mat4.lookAt(
            mat4.create(),
            [circleX, circleY, circleZ],
            [0, 0, 0],
            [0, 1, 0],
        );

        // calculate the directional light
        if (light_direction.length > 0) {
            res.lightDirection = () => {
                for (let i = 0; i < light_direction.length; i ++) {
                    const [x, y, z] = light_direction[i];
                    light_direction[i] = [
                        Math.cos(-lonAngle) * Math.cos(-latAngle),
                        Math.sin(-latAngle),
                        Math.sin(-lonAngle) * Math.cos(-latAngle),
                    ];
                }

                if (light_direction.length === 1) {
                    return light_direction[0];
                }
                return light_direction;
            }
        }

        // calculate the point light
    }

    canvas.addEventListener('mousewheel', handleWheel);
    canvas.addEventListener('mousedown', (ev) => canvas.addEventListener('mousemove', handleDragmove));
    canvas.addEventListener('mouseup', (ev) => canvas.removeEventListener('mousemove', handleDragmove));

    return res;
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function radToDeg(radian) {
    return radian * 180 / Math.PI;
}