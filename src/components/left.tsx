import * as React from 'react';

import { UI } from '../client/ui';

interface props {
    ui:UI;
}

interface state {
    add_project:string;
}

export class LeftPanel extends React.Component<props, state> {
    public state = {
        add_project: '',
    }

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
                        ui={this.props.ui}
                    />
                )}

                <div className="add_project">
                    <input type="text"
                        value={this.state.add_project}
                        onChange={(ev) => this.setState({add_project: ev.target.value})}
                        onKeyDown={(ev) => {
                            if (ev.keyCode === 13) {
                                this.handleAddProject(ev);
                            }
                        }}
                    />
                    <button onClick={this.handleAddProject}>add project</button>
                </div>
            </div>
        )
    }


    public handleAddProject = (ev) => {
        this.props.ui.protocol.new_project(this.state.add_project, (id, success) => {
            if (success) {
                this.props.ui.update_projects();
                this.setState({
                    add_project: '',
                })
            } else {
                alert('add project failed');
            }
        })
    }
}

interface ListProp {
    name:string;
    ui:UI;
}

interface ListState {

}

class ListProject extends React.Component<ListProp, ListState> {
    public element:HTMLButtonElement|null = null;

    public render () {
        const selected = this.props.ui.state.inProject === this.props.name;
        return (
            <button className={selected ? 'project_item_selected' : 'project_item'}
                onClick={this.handleClick} 
                ref={(e) => this.element = e}
            >
                {this.props.name}
            </button>
        )
    }

    public handleClick = (ev) => {
        this.props.ui.setProject(this.props.name);
    }
}