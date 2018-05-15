import * as React from 'react';

import { UI } from '../client/ui';
import { glCube } from '../client/glCube';
import { Face } from '../client/texture';

import { TextureBox } from './texture-box';

interface props {
    ui:UI;
}

interface state {
}

export class MiddlePanel extends React.Component<props, state> {
    public canvasElement:HTMLCanvasElement|null = null;

    public componentDidMount() {
        if (!this.canvasElement) { return; }

        const gl = this.canvasElement.getContext('webgl');
        if (!gl) {
            alert("your browser not support WebGL");
            return;
        }

        const cube = glCube(this.canvasElement);
        this.props.ui.glCube = cube;
        cube.empty();
    }

    public render () {
        return (
           <div className="middle_container">
                <canvas width={600} height={600} ref={(e) => this.canvasElement = e}></canvas>

                <div className="texture_box_container">

                    { (new Array(Face.length)).fill('').map((s, i) => 
                    <TextureBox
                        key={i}
                        ui={this.props.ui}
                        face={i}
                    />    
                    )}

                </div>
           </div> 
        )
    }
}