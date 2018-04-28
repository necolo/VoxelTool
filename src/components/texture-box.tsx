import * as React from 'react';

import { Texture, UI } from '../client/ui';

interface props {
    ui:UI;
    face:Texture;
}

interface state {
    src:string;
}

export class TextureBox extends React.Component<props, state> {
    public selectElement:HTMLSelectElement|null = null;

    public state = {
        src: '',
    };

    public componentDidMount() {
        this.props.ui.textureBoxListeners[this.props.face].subscribe(this);
    }

    public componentWillUnmount() {
        this.props.ui.textureBoxListeners[this.props.face].unsubscribe(this);
    }

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
                        if (this.selectElement) {
                            this.selectElement.value = 'default';
                        }

                        this.props.ui.uploadTextureImg(this.props.face, reader.result);
                    };

                    reader.readAsDataURL(file);
                }
            }
        }
    }

    public handleSelect = (ev) => {
        const { ui, face } = this.props;
        if (ev.target.value !== 'default') {
            ui.linkBlockSide(face, Texture[ev.target.value as keyof Texture]);
        } else {
            ui.linkBlockSide(face, face);
        }
    }

    public render () {
        const { face, ui } = this.props;
        return (
            <div className="texture_box">
                <select onChange={this.handleSelect} ref={(e) => this.selectElement = e} value={ui.state.texture_data[face].name}>
                    <option value='default'>default</option>
                    { (new Array(Texture.length)).fill('').map((s, i) => {
                        if (i !== face) {
                            return (
                                <option value={Texture[i]} key={i}>same to {Texture[i]}</option>
                            )
                        } else return null;
                    }) }
                </select>
                    
                <div className="box_image"
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDrop}> 
                    {ui.state.texture_data[face].src && 
                        <img src={ui.state.texture_data[face].src || ''}></img>
                    }

                    {!ui.state.texture_data[face].src &&
                        <span>
                            drag image here
                        </span> 
                    }
                </div>

                <br />
                <span>{ Texture[face] }</span>
            </div> 
        )
    }
}