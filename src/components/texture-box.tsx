import * as React from 'react';

import { UI } from '../client/ui';
import { Face, Texture } from '../client/texture';

interface props {
    ui:UI;
    face:Face;
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
        this.props.ui.state.texList[this.props.face].listener.subscribe(this);
    }

    public componentWillUnmount() {
        this.props.ui.state.texList[this.props.face].listener.unsubscribe(this);
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
            ui.state.texList[face].specular = src;
            this.forceUpdate();
        })
    }

    public handleDropNormal = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        const { ui, face } = this.props;
        loadDropedImage(ev, (src) => {
            ui.state.texList[face].specular = src;
            this.forceUpdate();
        })
    } 

    public handleDropEmissive = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        const { ui, face } = this.props;
        loadDropedImage(ev, (src) => {
            ui.state.texList[face].emissive = src;
            this.forceUpdate();
        })
    }

    public handleSelect = (ev) => {
        const { ui, face } = this.props;
        const thisTex = ui.state.texList[face];

        if (ev.target.value !== 'default') {
            const linkface = Face[ev.target.value as keyof Face];
            thisTex.linkto(ui.state.texList[linkface]);
            ui.updateGL();
        } else {
            // people cant choose this

            // Texture.removeLink(thisTex, ui.state.texList);
            // thisTex.nolinkto();
        }
    }

    public render () {
        const { face, ui } = this.props;
        const { texList } = ui.state;
        return (
            <div className="texture_box">
                <select onChange={this.handleSelect} ref={(e) => this.selectElement = e} value={texList[face].name}>
                    <option value='default'>default</option>
                    { (new Array(Face.length)).fill('').map((s, i) => {
                        if (i !== face) {
                            return (
                                <option value={Face[i]} key={i}>same to {Face[i]}</option>
                            )
                        } else return null;
                    }) }
                </select>

                <span>{ Face[face] }</span>
                    
                <div className="box_image"
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDropTexture}> 
                    {texList[face].texture && 
                        <img src={texList[face].texture || ''}></img>
                    }

                    {!texList[face].texture &&
                        <span>
                            texture
                        </span> 
                    }
                </div>

                {texList[face].texture && texList[face].name === Face[face] &&
                <div>
                    <div className="box_image"
                        onDragOver={this.handleDragOver}
                        onDrop={this.handleDropSpecular}> 
                    {texList[face].specular && 
                        <img src={texList[face].specular || ''}></img>
                    }

                    {!texList[face].specular &&
                        <span>
                            specular
                        </span> 
                    }
                </div>
                
                <div className="box_image"
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDropNormal}> 
                    {texList[face].normal && 
                        <img src={texList[face].normal || ''}></img>
                    }

                    {!texList[face].normal &&
                        <span>
                            normal
                        </span> 
                    }
                </div>                  

                <div className="box_image"
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDropEmissive}> 
                    {texList[face].emissive && 
                        <img src={texList[face].emissive || ''}></img>
                    }

                    {!texList[face].emissive &&
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