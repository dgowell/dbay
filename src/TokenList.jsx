import React from 'react';
import Token from './Token';

const TokenList = () => {
    const [tokens, setTokens] = React.useState();

    function handleClick() {
        window.MDS.cmd('tokens', function (Token) {
            if (Token.status) {
                const minimaToken = Token.response;
                setTokens(minimaToken);
            }
        })
    }

    return (
        <ul> {tokens
            ? tokens.map((token) =>
                <Token key={token.tokenid.toString()} name={token.name.name} id={token.tokenid} />
            )
            : <button onClick={handleClick}>View Tokens</button>
        }
        </ul>

    )
}

export default TokenList;