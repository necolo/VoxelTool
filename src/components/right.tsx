import * as React from 'react';

import { UI } from '../client/ui';

interface props {
    ui:UI;
}

interface state {
    category:string;
    name:string;
    transparent:boolean;
    color:[number, number, number, number]|number[];
    emssive:[number, number, number]|number[];
    friction:number,
    restitution:number,
    mass:number,
}

export class RightPanel extends React.Component<props, state> {
    public add_category_input:HTMLInputElement|null = null;

    public boxStyle = {

    }

    public state = {
        category: '',
        name: '',
        transparent: false,
        color: [1, 1, 1, 1],
        emssive: [0, 0, 0],
        friction: 1, 
        restitution: 0,
        mass: 1,
    }

    public componentDidMount() {
        this.props.ui.rightPanelListener.subscribe(this);
    }

    public componentWillUnmount() {
        this.props.ui.rightPanelListener.unsubscribe(this);
    }

    public render () {
        const { ui } = this.props;

        return (
            <div style={{
                WebkitFlex: 1,
                flex: 1,
            }}>
                <div style={this.boxStyle}>
                    <span>Category</span>
                    <select onChange={(ev) => this.setState({category: ev.target.value})}>
                        { ui.state.categoryList.map((cat) => 
                            <option value={cat}>{cat}</option>
                        )}
                    </select>
                </div>

                <div style={this.boxStyle}>
                    <span>name</span>
                    <input type="text"
                        value={this.state.name} 
                        onChange={(ev) => this.setState({name: ev.target.value})}
                    />
                </div>

                <div style={this.boxStyle}>
                    <span>transparent</span>
                    <input type="checkbox" 
                        onChange={(ev) => {
                            if (ev.target.value === 'false') {
                                this.setState({transparent: false});                                
                            } else if (ev.target.value === 'true') {
                                this.setState({transparent: true});
                            }
                        }}
                    />
                </div>

                <div style={this.boxStyle}>
                    <span>color</span>
                    { this.renderNumberInputs(4, 'color') }
                </div>

                <div style={this.boxStyle}>
                    <span>emssive</span>
                    { this.renderNumberInputs(3, 'emssive') }
                </div>

                <div style={this.boxStyle}>
                    <span>friction</span>
                    <input type="number"
                        value={this.state.friction}
                        onChange={(ev) => this.setState({friction: parseFloat(ev.target.value)})}
                    />
                </div>

                <div style={this.boxStyle}>
                    <span>restitution</span>
                    <input type="number"
                        value={this.state.friction}
                        onChange={(ev) => this.setState({restitution: parseFloat(ev.target.value)})}
                    />
                </div>

                <div style={this.boxStyle}>
                    <span>mass</span>
                    <input type="number"
                        value={this.state.friction}
                        onChange={(ev) => this.setState({mass: parseFloat(ev.target.value)})}
                    />
                </div>

                <br />
                <hr />
                
                <div style={this.boxStyle}>
                    <span>add category</span>
                    <input type="text"
                        onChange={(ev) => ev.target.placeholder = ''}
                        onKeyDown={(ev) => {
                            if (ev.keyCode === 13) {
                                this.handleAddCategory(ev);
                            }
                        }}
                        ref={(e) => this.add_category_input = e}
                    />
                    <button onClick={this.handleAddCategory}>send</button>
                </div>

                <button style={{

                }}
                    onClick={(ev) => {
                        //todo:
                    }}
                >
                    SAVE
                </button>

            </div>
        )
    }

    public handleSaveVoxel = (ev) => {
        //todo: should also gen thumbnail and texture data
        //todo: this.setState to default value
    }

    public handleAddCategory = (ev) => {
        if (this.add_category_input) {
            this.props.ui.protocol.add_category(
                this.add_category_input.value,
                (data) => {
                    if (data && this.add_category_input) {
                        this.add_category_input.value = '';
                        this.add_category_input.placeholder = 'success!';
                    }
                }
            )
        }
    }

    public renderNumberInputs (length:number, target:string) {
        const res:JSX.Element[] = [];
        for (let i = 0; i < length; i ++) {
            res.push(
                <input type="number" 
                    value={this.state[target][i]}
                    onChange={(ev) => this.setState((prevState) => {
                        const t = prevState[target];
                        t[i] = parseFloat(ev.target.value);
                        const res = {};  
                        res[target] = t;
                        return res;
                    })}
                />
            )
        }
    }
}