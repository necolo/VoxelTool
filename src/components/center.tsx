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
                textAlign: 'center',
           }}>
                <canvas width={600} height={600} style={{
                    border: '1px solid black',
                }}></canvas>

                <div style={{
                    display: "flex",
                    textAlign: 'center',
                }}>
                    { SIDES.map((side, index) => 
                        <TextureBox 
                            key={index}
                            ui={this.props.ui}
                            side={side}
                        />
                    )}
                </div>
           </div> 
        )
    }
}