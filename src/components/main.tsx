import * as React from 'react';

import { UI } from '../client/ui';

import { LeftPanel } from './left';
import { RightPanel } from './right';
import { MiddlePanel } from './center';

interface props {
    ui:UI
}

interface state {

}

export class Container extends React.Component<props, state> {
    public render() {
        return (
            <div className="container">
                <LeftPanel 
                    ui={this.props.ui}
                />

                <MiddlePanel
                    ui={this.props.ui}
                />

                <RightPanel
                    ui={this.props.ui}
                />
            </div>
        )
    }
}