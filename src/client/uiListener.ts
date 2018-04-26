import * as React from 'react';

export class UIListener {
    private _components:React.Component[] = [];

    public subscribe(component:React.Component) {
        this._components.push(component);
    }

    public notify() {
        for (let i = 0; i < this._components.length; i++) {
            this._components[i].forceUpdate();
        }
    }

    public unsubscribe(component:React.Component) {
        const index = this._components.indexOf(component);
        this._components.splice(index, 1);
    }
}
