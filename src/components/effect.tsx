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
                <div className="box">
                    <span>turn on lights</span>
                    <input type="checkbox"
                        checked={effects.onLight}
                        onChange={(ev) => effects.updateProps('onLight', !effects.onLight)}
                    />
                </div>

                <div className="box">
                    <span>light color</span>
                    { renderNumberInputs({
                        length: 3,
                        target:  effects.light,
                        onChange: (value, i) => effects.updateProps('light', value, i),
                    })}
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
                    { renderNumberInputs({
                        length: 3,
                        target: effects.ambientLight,
                        onChange: (value, i) => effects.updateProps('ambientLight', value, i),
                    })}
                </div>
            </div>
        )
    }
}