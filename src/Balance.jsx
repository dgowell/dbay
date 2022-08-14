import React from 'react';

const Balance = () => {
    const [balance, setBalance] = React.useState(null);

    const getBalance = React.useCallback(() => {
        window.MDS.cmd('balance', function (balance) {
            if (balance.response) {
                const minimaToken = balance.response.find(token => token.token === 'Minima');
                setBalance(minimaToken.confirmed);
            }
        })
    }, []);

    React.useEffect(() => {
        getBalance();
    }, [getBalance]);

    return <div>Balance Hello: {balance}</div>
}

export default Balance;