import React, { useState } from 'react';

const CreateTokenButton = () => {
    const [token, setToken] = useState(null);
    const [values, setValues] = useState({
        tokenName: ''
    })

    function checkName(token, name) {
        return token.token.name.name === name;
    }

    const handleTokenNameInputChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            tokenName: event.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const command = `tokencreate amount:1 decimal:0 name:{"name":"${values.tokenName}","link":"http:vango.com","description":"Super tent that can withstand the rain and snow of the arctic."}`;
        window.MDS.cmd(command, function (Token) {
            if (Token.status) {
                //const transaction = Token.response.transactionid;
                const minimaToken = Token.response.outputs.find(e => checkName(e, values.tokenName));
                setToken(minimaToken.token.tokenid);
            }
        })
    }

    if (token === null) {
        return (
            <form onSubmit={handleSubmit}>
                <label>
                    Token Name:
                    <input
                        id="token-name"
                        class="form-field"
                        type="text"
                        placeholder="Token Name"
                        name="tokenName"
                        value={values.tokenName}
                        onChange={handleTokenNameInputChange}
                    />
                </label>
                <input type="submit" value="Create Token" />
            </form>
        )
    }
    return token ? <p> Token ID: {token} </p> : '';
}

export default CreateTokenButton;