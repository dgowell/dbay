import React, { useState } from 'react';

const SendTokenButton = () => {
    const [token, setToken] = useState(null);
    const [values, setValues] = useState({
        address: '',
        tokenId: ''
    })

    const handleAddressInputChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            address: event.target.value,
        }));
    };
    const handleTokenIdInputChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            tokenId: event.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const command = `send address:${values.address} amount:1 tokenid:${values.tokenId}`;
        window.MDS.cmd(command, function (Token) {
            //we want to know when the transaction has been successful
            if (Token.status) {
                console.log(`succesfully sent ${values.tokenId} to ${values.address}`)
            } else {
                console.log(Token.error);
            }
        })
    }

    if (token === null) {
        return (
            <form onSubmit={handleSubmit}>
                <label>
                    Address to send to:
                    <input
                        id="address"
                        className="form-field"
                        type="text"
                        placeholder="Receivers Address"
                        name="name"
                        value={values.address}
                        onChange={handleAddressInputChange}
                    />
                </label>
                <label>
                    Token ID:
                    <input
                        id="token-id"
                        className="form-field"
                        type="text"
                        placeholder="Token Id"
                        name="link"
                        value={values.tokenId}
                        onChange={handleTokenIdInputChange}
                    />
                </label>
                <input type="submit" value="Send" />
            </form >
        )
    }
    return token ? <p> Token ID: {token} </p> : 'No coins to display';
}

export default SendTokenButton;