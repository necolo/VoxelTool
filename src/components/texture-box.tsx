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
        this.props.ui.voxel.texList[this.props.face].listener.subscribe(this);
    }

    public componentWillUnmount() {
        this.props.ui.voxel.texList[this.props.face].listener.unsubscribe(this);
    }

    public handleDragOver = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
    }

    public handleDropTexture = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();

        const { ui, face } = this.props;
        const { texList } = ui.voxel;
        loadDropedImage(ev, (src) => {
            if (this.selectElement) {
                this.selectElement.value = 'default';
            }

            const noneTexUploaded = checkValue('texture', '', texList);
            if (noneTexUploaded) {
                //for the first texture, link all other faces to it. 
                const tex = texList[face];
                tex.udpateTexture(src);
    
                for (let i = 0; i < texList.length; i ++) {
                    if (i === face) { continue; }
                    const linked_tex = texList[i];
                    linked_tex.setLinkto(tex);
                }
            } else {
                const tex = texList[face];
                tex.udpateTexture(src);
            }

            ui.updateGL();
        })
    }

    public handleDropSpecular = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        const { ui, face } = this.props;
        loadDropedImage(ev, (src) => {
            ui.voxel.texList[face].updateSpecular(src);
            ui.updateGL();
        })
    }

    public handleDropNormal = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        const { ui, face } = this.props;
        loadDropedImage(ev, (src) => {
            ui.voxel.texList[face].updateNormal(src);
            ui.updateGL();
        })
    } 

    public handleDropEmissive = (ev:React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        const { ui, face } = this.props;
        loadDropedImage(ev, (src) => {
            ui.voxel.texList[face].updateEmissive(src);
            ui.updateGL();
        })
    }

    public handleSelect = (ev) => {
        const { ui, face } = this.props;
        const { texList } = ui.voxel;
        const thisTex = texList[face];

        if (ev.target.value !== 'default') {
            const linkface = Face[ev.target.value as keyof Face];
            const linkTex = texList[linkface];

            if (linkTex.link && linkTex.link.face === face) {
                alert('warning: you cannot link two sides each to other');
                return;
            }

            thisTex.setLinkto(linkTex);
            ui.updateGL();
        } else {
            // people cant choose this
        }
    }

    public render () {
        const { face, ui } = this.props;
        const { blank } = ui.voxel;
        const tex = ui.voxel.texList[face];
        const { texture, emissive, normal, specular } = tex.getSrc();

        return (
            <div className="texture_box">
                <select onChange={this.handleSelect} ref={(e) => this.selectElement = e} value={tex.getLinkName()}>
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
                    { texture &&
                        <img src={texture}></img>
                    }

                    { !texture &&
                        <span>
                            texture
                        </span> 
                    }
                </div>

                {!tex.link && !blank && 
                <div>
                    <div className="box_image"
                        onDragOver={this.handleDragOver}
                        onDrop={this.handleDropSpecular}> 

                    {specular && 
                        <img src={specular}></img>
                    }

                    {!specular &&
                        <span>
                            specular
                        </span> 
                    }
                </div>
                
                <div className="box_image"
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDropNormal}> 
                    {normal && 
                        <img src={normal}></img>
                    }

                    {!normal &&
                        <span>
                            normal
                        </span> 
                    }
                </div>                  

                <div className="box_image"
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDropEmissive}> 
                    {emissive && 
                        <img src={emissive || ''}></img>
                    }

                    {!emissive &&
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
function checkValue (param:string, value:any, list:{}[]) : boolean {
    let res:boolean = true;

    for (let i = 0; i < list.length; i ++) {
        if (list[i][param] !== value) {
            res = false;
            break;
        }
    } 

    return res;
}