import React, { useState } from 'react';

const CreateTokenButton = () => {
    const [token, setToken] = useState(null);
    const [values, setValues] = useState({
        name: '',
        link: '',
        description: ''
    })

    function checkName(token, name) {
        return token.token.name.name === name;
    }

    const handleNameInputChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            name: event.target.value,
        }));
    };
    const handleLinkInputChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            link: event.target.value,
        }));
    };
    const handleDescriptionInputChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            description: event.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const command = `tokencreate amount:1 decimal:0 name:{"name":"${values.name}","link":"${values.link}","description":"${values.description}"}`;
        window.MDS.cmd(command, function (Token) {
            if (Token.status) {
                //const transaction = Token.response.transactionid;
                const minimaToken = Token.response.outputs.find(e => checkName(e, values.name));
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
                        className="form-field"
                        type="text"
                        placeholder="Token Name"
                        name="name"
                        value={values.name}
                        onChange={handleNameInputChange}
                    />
                </label>
                <label>
                    Link:
                    <input
                        id="token-link"
                        className="form-field"
                        type="text"
                        placeholder="Token Link"
                        name="link"
                        value={values.link}
                        onChange={handleLinkInputChange}
                    />
                </label>
                <label>
                    Description:
                    <input
                        id="token-description"
                        className="form-field"
                        type="textarea"
                        placeholder="Description"
                        name="link"
                        value={values.description}
                        onChange={handleDescriptionInputChange}
                    />
                </label>
                <input type="submit" value="Create Token" />
            </form >
        )
    }
    return token ? <p> You have successfully created a token with ID: {token} </p> : '';
}

export default CreateTokenButton;