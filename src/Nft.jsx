import React from 'react';

const Nft = () => {
    const [nft, setNft] = React.useState(null);

    const getNft = React.useCallback(() => {
        window.MDS.cmd('tokens', function (Nft) {
            if (Nft.response) {
                const minimaToken = Nft.response.find(token => token.name === 'Minima');
                setNft(minimaToken.tokenid);
            }
        })
    }, []);

    React.useEffect(() => {
        getNft();
    }, [getNft]);

    return <div>Nft: {nft}</div>
}

export default Nft;