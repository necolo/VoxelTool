import * as React from 'react';

import { UI } from '../client/ui';

interface props {
    ui:UI;
}

interface state {

}

export class LeftPanel extends React.Component<props, state> {
    public componentDidMount() {
        this.props.ui.leftPanelListener.subscribe(this);
    }

    public componentWillUnmount() {
        this.props.ui.leftPanelListener.unsubscribe(this);
    }

    public render () {
        return (
            <div className="left_container">
                { this.props.ui.state.projects.map((project, index) => 
                    <ListProject
                        key={index}
                        name={project}
                    />
                )}
            </div>
        )
    }
}

interface ListProp {
    name:string;
}

interface ListState {

}

class ListProject extends React.Component<ListProp, ListState> {
    public state = {
        selected: false,
    }

    public render () {
        return (
            <div className="project_item">
                {this.props.name}
            </div>
        )
    }
}