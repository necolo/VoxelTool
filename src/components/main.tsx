import * as React from 'react';

import { LeftPanel } from './left';
import { RightPanel } from './right';
import { CenterPanel } from './center';

interface props {

}

interface state {

}
export class Container extends React.Component<props, state> {
    public render() {
        return (
            <div>
                <LeftPanel>

                </LeftPanel>

                <CenterPanel>

                </CenterPanel>

                <RightPanel>

                </RightPanel>
            </div>
        )
    }
}