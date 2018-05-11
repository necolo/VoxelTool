import { mat4 } from 'gl-matrix';

type MouseT = {
    tick: () => void;
    model: () => mat4;
}

export = function (canvas:HTMLCanvasElement) : MouseT{
    const handleWheel = (ev) => {
        ev.preventDefault();
        console.log(ev.deltaY);
    }

    const handleDragmove = (ev) => {
        ev.preventDefault();
        console.log(ev.movementX, ev.movementY);
    }

    canvas.addEventListener('mousewheel', handleWheel);
    canvas.addEventListener('mousedown', () => canvas.addEventListener('mousemove', handleDragmove));
    canvas.addEventListener('mouseup', () => canvas.removeEventListener('mousemove', handleDragmove));

    const res:MouseT = {} as MouseT;
    res.tick = () => {
        
    }

    return res;
}