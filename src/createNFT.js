function checkName(token, name) {
    return token.token.name.name === name;
}
/*
 * Function to create NFT and return the tokenID
 */
function createNFT(name, link, description) {
    const command = `tokencreate amount:1 decimal:0 name:{"name":"${name}","link":"${link}","description":"${description}"}`;
    window.MDS.cmd(command, function (res) {
        if (res.response) {
            let token = res.response.outputs.find(e => checkName(e, name));
            return token['tokenid'];
        }
        return "no token created";
    })
}

export default createNFT;