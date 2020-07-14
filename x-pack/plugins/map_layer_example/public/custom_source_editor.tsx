import React, { Fragment } from 'react';

export class CustomSourceEditor extends React.Component {

    _isMounted: boolean;

    state = {
    };
    
    constructor(props) {
        super(props);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
    }

    render() {
        return (
            <Fragment>
                <strong>Test</strong>
            </Fragment>
        );
    }
};