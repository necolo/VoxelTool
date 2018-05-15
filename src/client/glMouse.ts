import { mat4, vec3 } from 'gl-matrix';

export type MouseT = {
    tick: () => void;
    model: () => mat4;
    view: () => mat4;
}

export function glMouse (canvas:HTMLCanvasElement) : MouseT {
    const { height, width }  = canvas;

    let radius = -8;

    let lat = -0.3;
    let lon = -0.72;

    let rotate:mat4 = mat4.create();

    let lastMouseX = 0;
    let lastMouseY = 0;

    const handleWheel = (ev) => {
        ev.preventDefault();
        radius -= ev.deltaY * 0.001;
    }

    const handleDragmove = (ev) => {
        ev.preventDefault();
        lon += ev.movementX * 0.01;

        if (lat < 1.57 && lat > -1.57) {
            lat -= ev.movementY * 0.01;
        } else {
            lat = (lat > 0) ? 1.56 : -1.56;
        }
    }

    canvas.addEventListener('mousewheel', handleWheel);
    canvas.addEventListener('mousedown', (ev) => canvas.addEventListener('mousemove', handleDragmove));
    canvas.addEventListener('mouseup', (ev) => canvas.removeEventListener('mousemove', handleDragmove));

    const res:MouseT = {} as MouseT;
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
    }

    return res;
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function radToDeg(radian) {
    return radian * 180 / Math.PI;
}