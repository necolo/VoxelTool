import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Container } from './components/main'; 
import { UI } from './client/ui';

const root = document.createElement('div');
document.body.appendChild(root);

const ui = new UI();

ReactDOM.render(
    <Container
        ui={ui}
    />,
    root,
)