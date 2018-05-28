import * as React from 'react';

import { UI } from '../client/ui';
import { Face } from '../client/texture';
import { glMain } from '../gl/main';

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

        const { ui } = this.props;

        const cube = glMain(this.canvasElement, ui);
        ui.glCube = cube;
        ui.effects.add_glCube(cube);
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