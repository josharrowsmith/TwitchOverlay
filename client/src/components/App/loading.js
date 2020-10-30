import React from 'react';
import "./loading.css"

export default class SpinnerDotsScale extends React.Component {
    render() {
        return (
            <div className="Spinner">
                <div className="spinner-dot" />
                <div className="spinner-dot" />
                <div className="spinner-dot" />
            </div>
        );
    }
}
