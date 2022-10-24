import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { getKeys, getTokens } from '../mds-helpers';
import MarketplaceListItem from './MarketplaceListItem';


const Demo = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
}));

export default function MyItems() {
    const [tokens, setTokens] = React.useState();
    const [keys, setKeys] = React.useState();

    React.useEffect(() => {
        getTokens(setTokens);
        getKeys().then(function (result) {
            setKeys(result);
        })
    }, []);

    function isMarketplaceItem(value) {
        if (value.name.app === 'stampd') {
            return keys.map(getPublicKey).includes(value.name.sellers_address);
        }
    }

    function getPublicKey(key) {
        return key.publickey;
    }
    if (tokens && keys) {
        return (
            <Box sx={{ flexGrow: 1, maxWidth: 752 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} >
                        <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
                            My Items
                        </Typography>
                        <Demo>
                            <List>
                                {tokens.filter(isMarketplaceItem).map(token =>
                                    <MarketplaceListItem
                                        image={token.name.image}
                                        price={token.name.price}
                                        key={token.tokenid}
                                        primary={token.name.name}
                                        to={`/item/${token.tokenid}`}
                                        description={token.name.desciption} />
                                )}
                            </List>
                        </Demo>
                    </Grid>
                </Grid>
            </Box>
        );
    } else {
        return <p>You have no items. Please add one!</p>
    }
}
