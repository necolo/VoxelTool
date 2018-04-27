import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Container } from './components/main'; 
import { UI } from './client/ui';
import { ClientProtocol } from './client/protocol';
import { SocketInterface } from './spec';


export = function (socket:SocketInterface) {
    const root = document.createElement('div');
    document.body.appendChild(root);
    
    const protocol = new ClientProtocol(socket);
    const ui = new UI(protocol);
    
    ReactDOM.render(
        <Container
            ui={ui}
        />,
        root,
    )
}