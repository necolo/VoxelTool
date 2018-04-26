import * as React from 'react';

import { TextureSrc, UI } from '../client/ui';

interface props {
    ui:UI;
    side:string;
}

interface state {
    showimg:boolean;
    linked:boolean;
}

export class TextureBox extends React.Component<props, state> {
    public state = {
        showimg: false,
        linked: false,
    };

    public handleDragOver = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
    }

    public handleDrop = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        if (ev.dataTransfer.items && ev.dataTransfer.items.length === 1) {
            const item = ev.dataTransfer.items[0];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (!file) { return; }
                if (file.type === 'image/jpeg' || file.type === 'image/png') {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.setState({ showimg: true })
                        this.props.ui.setTextureSrc(this.props.side, reader.result);
                    };

                    reader.readAsDataURL(file);
                }
            }
        }
    }

    public handleSelect = (ev) => {
        const { ui, side } = this.props;
        if (ev.target.value !== 'default') {
            ui.setTextureSrc(
                side,
                ui.state.texture_src[ev.target.value],
            );
            this.setState({
                linked: true,
                showimg: false,
            })
        } else {
            this.setState({
                linked: true,
            })
        }
    }

    public render () {
        const { side, ui } = this.props;
        return (
            <div>
                <select onChange={this.handleSelect}>
                    <option value="default">default</option>
                    {side !== 'left' && <option value="left">same to left</option>}
                    {side !== 'right' && <option value="right">same to right</option>}
                    {side !== 'top' && <option value="top">same to top</option>}
                    {side !== 'bottom' && <option value="bottom">same to bottom</option>}
                    {side !== 'front' && <option value="front">same to front</option>}
                    {side !== 'back' && <option value="back">same to back</option>}
                </select>

                { !this.state.linked &&
                <div style={{
                    border: '1px solid black',
                    width: '200px',
                    height: '200px',
                }}
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDrop}
                >
                    {this.state.showimg && 
                        <img src={ui.state.texture_src[side]}></img>
                    }

                    {!this.state.showimg &&
                        <span style={{

                        }}>
                            drag image here
                        </span> 
                    }
                </div> }

            </div> 
        )
    }
}