import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import { getTokens } from './mds-helpers';


const Demo = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
}));

export default function InteractiveList() {
    const [dense, setDense] = React.useState(false);
    const [secondary, setSecondary] = React.useState(false);
    const [tokens, setTokens] = React.useState();

    React.useEffect(() => {
        getTokens(setTokens);
    }, []);

    function isMarketplaceItem(value) {
        return value.name.app === 'stampd';
    }

    if (tokens) {
        return (
            <Box sx={{ flexGrow: 1, maxWidth: 752 }}>
                <FormGroup row>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={dense}
                                onChange={(event) => setDense(event.target.checked)}
                            />
                        }
                        label="Enable dense"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={secondary}
                                onChange={(event) => setSecondary(event.target.checked)}
                            />
                        }
                        label="Enable secondary text"
                    />
                </FormGroup>
                <Grid container spacing={2}>
                    <Grid item xs={12} >
                        <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
                            Marketplace
                        </Typography>
                        <List dense={dense}>
                            {tokens.filter(isMarketplaceItem).map(token =>
                                <ListItem
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="delete">
                                            <ListItemText
                                                primary={token.name.sale_price ? `£${token.name.sale_price}` : null}
                                            />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar>
                                            <FolderIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={token.name.name}
                                        secondary={secondary ? token.name.description : null}
                                    />
                                </ListItem>,
                            )}
                        </List>
                    </Grid>
                </Grid>
            </Box>
        );
    } else {
        return <p>You have no items. Please add one!</p>
    }
}
