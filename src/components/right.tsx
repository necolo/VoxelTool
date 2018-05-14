import * as React from 'react';

import { UI, Texture, Thumbnail } from '../client/ui';
import { VoxelSpec } from '../spec';

interface props {
    ui:UI;
}

interface state {
    name:string;
    transparent:boolean;
    color:number[];
    emissive:number[];
    friction:number,
    restitution:number,
    mass:number,
}

export class RightPanel extends React.Component<props, state> {
    public add_category_input:HTMLInputElement|null = null;

    public state = {
        name: '',
        transparent: false,
        color: [1, 1, 1, 1],
        emissive: [0, 0, 0],
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
            <div className="right_container">
                <div className="box">
                    <span>Category</span>
                    <CategorySelect
                        ui={ui}
                    />
                </div>

                <div className="box">
                    <span>name</span>
                    <input type="text"
                        value={this.state.name} 
                        onChange={(ev) => this.setState({name: ev.target.value})}
                    />
                </div>

                <div className="box">
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

                <div className="box">
                    <span>color</span>
                    { this.renderNumberInputs(4, 'color') }
                </div>

                <div className="box">
                    <span>emissive</span>
                    { this.renderNumberInputs(3, 'emissive') }
                </div>

                <div className="box">
                    <span>friction</span>
                    <input type="number"
                        className="number_input"
                        value={this.state.friction}
                        onChange={(ev) => this.setState({friction: parseFloat(ev.target.value)})}
                    />
                </div>

                <div className="box">
                    <span>restitution</span>
                    <input type="number"
                        className="number_input"
                        value={this.state.restitution}
                        onChange={(ev) => this.setState({restitution: parseFloat(ev.target.value)})}
                    />
                </div>

                <div className="box">
                    <span>mass</span>
                    <input type="number"
                        className="number_input"
                        value={this.state.mass}
                        onChange={(ev) => this.setState({mass: parseFloat(ev.target.value)})}
                    />
                </div>

                <br />
                <hr />
                
                <div className="box">
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
                    <button className="btn_send" onClick={this.handleAddCategory}>send</button>
                </div>

                <button className="btn_save"
                    onClick={this.handleSaveVoxel}>
                    SAVE
                </button>

                <button className="btn_save" 
                    onClick={this.handleDownloadProject}>
                    Download project
                </button>
            </div>
        )
    }

    public handleDownloadProject = (ev) => {
        this.props.ui.protocol.download_project((id, data) => {
            //todo:
        })
    }

    public handleSaveVoxel = (ev) => {
        const { ui } = this.props;
        if (this.state.name === '') {
            alert('error: name is empty');
            return;
        }

        if (ui.state.category === '') {
            alert('error: category is empty');
            return;
        }

        const { texture_data } = ui.state;

        for (let i = 0; i < texture_data.length; i ++) {
            const texture = texture_data[i];
            if (!texture.src || !texture.name) {
                alert(`error: texture ${Texture[i]} not set`);
                return;
            }
        }

        const name = this.state.name;
        ui.protocol.get_voxel(name, (id, data) => {
            if (data) {
                alert(`error: already exist voxel ${name}`)
                return;
            }

            const thumbnail:string[] = new Array(Thumbnail.length);
            const texture:string[] = new Array(Texture.length); 
    
            for (let i = 0; i < Texture.length; i ++) {
                texture[i] = `${this.state.name}_${texture_data[i].name}`;
            }
    
            for (let i = 0; i < Thumbnail.length; i ++) {
                thumbnail[i] = texture[Texture[Thumbnail[i]]];
            }
    
            const spec:VoxelSpec = {
                thumbnail,
                texture,
                transparent: this.state.transparent,
                color: this.state.color,
                emissive: this.state.emissive,
                friction: this.state.friction,
                mass: this.state.mass,
                category: ui.state.category,
                restitution: this.state.restitution,
            };
    
            ui.protocol.add_voxel(name, spec, (id, success) => {
                if (success) {
                    this.setState({
                        name: '',
                        transparent: false,
                        color: [1, 1, 1, 1],
                        emissive: [0, 0, 0],
                        friction: 1, 
                        restitution: 0,
                        mass: 1,            
                    })
                    ui.init_texture_data();
                } else {
                    alert('error: save failed')
                }
            })
        })
    }

    public handleAddCategory = (ev) => {
        if (this.add_category_input) {
            this.props.ui.protocol.add_category(
                this.add_category_input.value,
                (id, success) => {
                    if (success && this.add_category_input) {
                        this.add_category_input.value = '';
                        this.add_category_input.placeholder = 'success!';
                        this.props.ui.update_category_list();
                    }
                }
            )
        }
    }

    public renderNumberInputs (length:number, target:string) : JSX.Element[] {
        const res:JSX.Element[] = [];
        for (let i = 0; i < length; i ++) {
            res.push(
                <input type="number" 
                    key={i}
                    className="number_input"
                    value={this.state[target][i]}
                    onChange={(ev) => {
                        const value = ev.target.value;
                        this.setState((prevState) => {
                            const t = prevState[target].concat();
                            t[i] = parseFloat(value);
                            const res = {};  
                            res[target] = t;
                            return res;
                        })
                    }}
                />
            )
        }
        return res;
    }
}

interface CategorySelectState {
}

interface CategorySelectProps {
    ui:UI;
}

export class CategorySelect extends React.Component<CategorySelectProps, CategorySelectState> {
    public element:HTMLSelectElement|null = null;

    public componentDidMount () {
        this.props.ui.categoryListener.subscribe(this);
        this.props.ui.update_category_list();
    }

    public componentWillUnmount () {
        this.props.ui.categoryListener.unsubscribe(this);
    }

    public componentDidUpdate () {
        if (this.element) {
            this.props.ui.set_category(this.element.value);
        }
    }

    public handleChange = (ev) => {
        this.props.ui.set_category(ev.target.value);
    }

    public render () {
        return (
            <select onChange={this.handleChange} ref={(e) => this.element = e}>
                { this.props.ui.state.categoryList.map((cat, index) => 
                    <option value={cat} key={index}>{cat}</option>
                )}
            </select>
        )
    }
}