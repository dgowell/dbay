import React from 'react';

function Token(props) {
    return (
        <div className="Token">
            <h2 className="Token-name">
                {props.name}
            </h2>
            <p>{props.id}</p>
        </div>
    )
}
export default Token;