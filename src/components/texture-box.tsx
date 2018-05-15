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
            ui.state.speculars[face].src = src;
            this.forceUpdate();
        })
    }

    public handleDropNormal = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        const { ui, face } = this.props;
        loadDropedImage(ev, (src) => {
            ui.state.normals[face].src = src;
            this.forceUpdate();
        })
    } 

    public handleDropEmissive = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        const { ui, face } = this.props;
        loadDropedImage(ev, (src) => {
            ui.state.emissives[face].src = src;
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
        const { textures, speculars, normals, emissives } = ui.state;
        return (
            <div className="texture_box">
                <select onChange={this.handleSelect} ref={(e) => this.selectElement = e} value={textures[face].name}>
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
                    {textures[face].src && 
                        <img src={textures[face].src || ''}></img>
                    }

                    {!textures[face].src &&
                        <span>
                            texture
                        </span> 
                    }
                </div>

                {textures[face].src && textures[face].name === Texture[face] &&
                <div>
                    <div className="box_image"
                        onDragOver={this.handleDragOver}
                        onDrop={this.handleDropSpecular}> 
                    {speculars[face].src && 
                        <img src={speculars[face].src || ''}></img>
                    }

                    {!speculars[face].src &&
                        <span>
                            specular
                        </span> 
                    }
                </div>
                
                <div className="box_image"
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDropNormal}> 
                    {normals[face].src && 
                        <img src={normals[face].src || ''}></img>
                    }

                    {!normals[face].src &&
                        <span>
                            normal
                        </span> 
                    }
                </div>                  

                <div className="box_image"
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDropEmissive}> 
                    {emissives[face].src && 
                        <img src={emissives[face].src || ''}></img>
                    }

                    {!emissives[face].src &&
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