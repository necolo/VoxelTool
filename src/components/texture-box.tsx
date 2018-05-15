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

    public handleDropTexture = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();

        const { ui, face } = this.props;
        loadDropedImage(ev, (src) => {
            if (this.selectElement) {
                this.selectElement.value = 'default';
            }

            ui.uploadTexture(face, src);
        })
    }


    public handleDropSpecular = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        const { ui, face } = this.props;
        loadDropedImage(ev, (src) => {
            ui.state.texData[face].specular = src;
            this.forceUpdate();
        })
    }

    public handleDropNormal = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        const { ui, face } = this.props;
        loadDropedImage(ev, (src) => {
            ui.state.texData[face].specular = src;
            this.forceUpdate();
        })
    } 

    public handleDropEmissive = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        const { ui, face } = this.props;
        loadDropedImage(ev, (src) => {
            ui.state.texData[face].emissive = src;
            this.forceUpdate();
        })
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
        const { texData } = ui.state;
        return (
            <div className="texture_box">
                <select onChange={this.handleSelect} ref={(e) => this.selectElement = e} value={texData[face].name}>
                    <option value='default'>default</option>
                    { (new Array(Texture.length)).fill('').map((s, i) => {
                        if (i !== face) {
                            return (
                                <option value={Texture[i]} key={i}>same to {Texture[i]}</option>
                            )
                        } else return null;
                    }) }
                </select>

                <span>{ Texture[face] }</span>
                    
                <div className="box_image"
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDropTexture}> 
                    {texData[face].texture && 
                        <img src={texData[face].texture || ''}></img>
                    }

                    {!texData[face].texture &&
                        <span>
                            texture
                        </span> 
                    }
                </div>

                {texData[face].texture && texData[face].name === Texture[face] &&
                <div>
                    <div className="box_image"
                        onDragOver={this.handleDragOver}
                        onDrop={this.handleDropSpecular}> 
                    {texData[face].specular && 
                        <img src={texData[face].specular || ''}></img>
                    }

                    {!texData[face].specular &&
                        <span>
                            specular
                        </span> 
                    }
                </div>
                
                <div className="box_image"
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDropNormal}> 
                    {texData[face].normal && 
                        <img src={texData[face].normal || ''}></img>
                    }

                    {!texData[face].normal &&
                        <span>
                            normal
                        </span> 
                    }
                </div>                  

                <div className="box_image"
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDropEmissive}> 
                    {texData[face].emissive && 
                        <img src={texData[face].emissive || ''}></img>
                    }

                    {!texData[face].emissive &&
                        <span>
                            emissive
                        </span> 
                    }
                </div>                   
            </div>}
            </div> 
        )
    }
}


function loadDropedImage(ev, next:(src:string) => void) {
    if (ev.dataTransfer.items && ev.dataTransfer.items.length === 1) {
        const item = ev.dataTransfer.items[0];
        if (item.kind === 'file') {
            const file = item.getAsFile();
            if (!file) { return; }
            if (file.type === 'image/jpeg' || file.type === 'image/png') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    next(reader.result);
                };

                reader.readAsDataURL(file);
            }
        }
    }
}