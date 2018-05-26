import * as React from 'react';

import { UI } from '../client/ui';
import { Face } from '../client/texture';
import { Voxel, Thumbnail } from '../client/voxel';

import { EffectUI } from './effect';

interface props {
    ui:UI;
}

interface state {
}

export class RightPanel extends React.Component<props, state> {
    public add_category_input:HTMLInputElement|null = null;
    public element:HTMLElement|null = null;

    public componentDidMount() {
        this.props.ui.voxel.listener.subscribe(this);
    }

    public componentWillUnmount() {
        this.props.ui.voxel.listener.unsubscribe(this);
    }

    public render () {
        const { ui } = this.props;

        return (
            <div className="right_container" ref={ (e) => this.element = e }>
                <EffectUI ui={ui} />
                <br />
                <hr />

                <div className="box">
                    <span>Category</span>
                    <CategorySelect
                        ui={ui}
                    />
                </div>

                <div className="box">
                    <span>name</span>
                    <input type="text"
                        value={ui.voxel.name} 
                        onChange={(ev) => ui.voxel.setName(ev.target.value)}
                    />
                </div>

                <div className="box">
                    <span>transparent</span>
                    <input type="checkbox" 
                        onChange={(ev) => {
                            ui.voxel.updateSpec('transparent', !ui.voxel.spec.transparent);
                            ui.updateGL();
                        }}
                    />
                    {/* <span style={{fontSize: '12px'}}>如果上传的图片有透明度，请勾上这里</span> */}
                </div>

                <div className="box">
                    <span>color(rgba)</span>
                    { renderNumberInputs({
                        length: 4,
                        target: ui.voxel.spec.color,
                        onChange: (value, i) => ui.voxel.updateSpec('color', value, i) }) 
                    }
                </div>

                <div className="box">
                    <span>emissive(rgb)</span>
                    { renderNumberInputs({
                        length: 3,
                        target: ui.voxel.spec.emissive,
                        onChange: (value, i) => ui.voxel.updateSpec('emissive', value, i),
                    })}
                </div>

                <div className="box">
                    <span>friction</span>
                    <input type="number"
                        className="number_input"
                        value={ui.voxel.spec.friction}
                        onChange={(ev) => ui.voxel.updateSpec('friction', parseFloat(ev.target.value))}
                    />
                </div>

                <div className="box">
                    <span>restitution</span>
                    <input type="number"
                        className="number_input"
                        value={ui.voxel.spec.restitution}
                        onChange={(ev) => ui.voxel.updateSpec('restitution', parseFloat(ev.target.value))}
                    />
                </div>

                <div className="box">
                    <span>mass</span>
                    <input type="number"
                        className="number_input"
                        value={ui.voxel.spec.mass}
                        onChange={(ev) => ui.voxel.updateSpec('mass', parseFloat(ev.target.value))}
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
        this.props.ui.protocol.download_project((id, download_path) => {
            const element = document.createElement('a');
            element.href = window.location.href + download_path;
            element.download = this.props.ui.state.inProject + '.zip';
            if (this.element) {
                this.element.appendChild(element);
                element.click();
                this.element.removeChild(element);
            }
        })
    }

    public handleSaveVoxel = (ev) => {
        const { ui } = this.props;
        ui.voxel.save();
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
}

export function renderNumberInputs (spec:{
    length:number,
    target:any,
    onChange:(value:string, index:number) => void;
    className?:string,
    style?:{},
}) : JSX.Element[] {
    const res:JSX.Element[] = [];
    for (let i = 0; i < spec.length; i ++){
        res.push(
            <input type="number"
                className={spec.className || 'number_input'}
                style={spec.style || {}}
                value={spec.target[i]}
                onChange={(ev) => {
                    spec.onChange(ev.target.value, i);
                }} />
        )
    }
    return res;
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
            this.props.ui.voxel.spec.category = this.element.value;
        }
    }

    public handleChange = (ev) => {
        this.props.ui.voxel.updateSpec('category', ev.target.value);
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