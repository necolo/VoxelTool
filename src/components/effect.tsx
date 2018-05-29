import * as React from 'react';

import { UI } from '../client/ui';
import { UIListener } from '../client/uiListener';

import { renderNumberInputs } from './right';

interface props {
    ui:UI;
}

interface state {

}

export class EffectUI extends React.Component<props, state> {
    public componentDidMount() {
        this.props.ui.effects.listener.subscribe(this);
    }

    public componentWillUnmount() {
        this.props.ui.effects.listener.unsubscribe(this);
    }

    public render () {
        const { effects } = this.props.ui;

        return (
        <div className="effect">
                <h3> Effects: </h3>
                <div className="box">
                    <span>turn on lights</span>
                    <input type="checkbox"
                        checked={effects.onLight}
                        onChange={(ev) => effects.updateProps('onLight', !effects.onLight)}
                    />
                </div>

               <div className="box">
                <span>light color</span>
                <input type="color"
                    value={vec2color(effects.light)}
                    onChange={(ev) => effects.updateProps('light', color2vec(ev.target.value))}
                />
               </div> 

                <div className="box">
                    <span>light position</span>
                    { renderNumberInputs({
                        length: 3,
                        target: effects.lightPosition,
                        onChange: (value, i) => effects.updateProps('lightPosition', value, i),
                    })}
                </div>

                <div className="box">
                    <span>turn on ambient light</span>
                    <input type="checkbox"
                        checked={effects.onAmbient}
                        onChange={() => effects.updateProps('onAmbient', !effects.onAmbient)}
                    />
                </div>

                <div className="box">
                    <span>ambient color</span>
                    <input type="color"
                        value={vec2color(effects.ambientLight)}
                        onChange={(ev) => effects.updateProps('ambientLight', color2vec(ev.target.value))}
                    />
                </div>
            </div>
        )
    }
}

function color2vec(color:string) {
    let r = color.substr(1, 2);
    let g = color.substr(3, 2);
    let b = color.substr(5, 2);

    return [r, g, b].map(hex2float);


    function hex2float(h:string) {
        return parseInt(h, 16) / 255;
    }
}

function vec2color (x:number[]) {
    return '#' + floatToHex(x[0]) + floatToHex(x[1]) + floatToHex(x[2]);

    function floatToHex (x:number) {
        const y = (Math.round(255 * x) | 0).toString(16);
        if (y.length < 2) {
            return '0' + y;
        }
        return y;
    }
}