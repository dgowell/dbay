import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import BungalowIcon from '@mui/icons-material/Bungalow';

const MarketplaceListItem = ({ token, secondary }) => {
    if (token) {
        return (
            <ListItem
                key={token.tokenid}
                secondaryAction={
                    <IconButton edge="end" aria-label="delete">
                        <ListItemText
                            primary={token.name.sale_price ? `£${token.name.sale_price}` : null}
                        />
                    </IconButton>
                }
            >
                <ListItemAvatar>
                    {token.name.image
                        ? <Avatar alt={token.name.name} src={token.name.image} />
                        : <Avatar>
                            <BungalowIcon />
                        </Avatar>
                    }
                </ListItemAvatar>
                <ListItemText
                    primary={token.name.name}
                    secondary={token.secondary ? token.name.description : null}
                />
            </ListItem>
        )
    } else {
        return '';
    }
}
export default MarketplaceListItem;