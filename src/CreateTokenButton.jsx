import React from 'react';

const CreateTokenButton = () => {
    const [token, setToken] = React.useState(null);

    function checkName(token, name) {
        return token.token.name.name === name;
    }

    function handleClick() {
        window.MDS.cmd('tokencreate amount:1 decimal:0 name:{"name":"Vango Tent 204","link":"http:vango.com","description":"Super tent that can withstand the rain and snow of the arctic."}', function (Token) {
            if (Token.status) {
                //const transaction = Token.response.transactionid;
                const minimaToken = Token.response.outputs.find(e => checkName(e, "Vango Tent 204"));
                setToken(minimaToken.token.tokenid);
            }
        })
    }

    if (token === null) {
        return <button onClick={handleClick}>Create Token</button>
    }
    return token ? <p> Token ID: {token} </p> : '';
}

export default CreateTokenButton;