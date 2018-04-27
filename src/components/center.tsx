import * as React from 'react';

import { TextureSrc, UI, SIDES } from '../client/ui';

import { TextureBox } from './texture-box';

interface props {
    ui:UI;
}

interface state {
    texture_type:number
}

export class CenterPanel extends React.Component<props, state> {
    public render () {
        return (
           <div style={{
                WebkitFlex: 2,
                flex: 2,
           }}>
                <canvas width={800} height={800}></canvas>

                <div style={{
                    display: 'inline-block',
                }}>
                    { SIDES.map((side) => 
                        <TextureBox 
                            ui={this.props.ui}
                            side={side}
                        />
                    )}
                </div>
           </div> 
        )
    }
}