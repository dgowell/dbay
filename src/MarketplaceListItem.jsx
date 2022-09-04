import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';

import BungalowIcon from '@mui/icons-material/Bungalow';
import { Link as RouterLink } from 'react-router-dom';


const MarketplaceListItem = (props) => {
    const { image, price, primary, secondary, to, description } = props;

    const renderLink = React.useMemo(
        () =>
            React.forwardRef(function Link(itemProps, ref) {
                return <RouterLink to={to} ref={ref} {...itemProps} role={undefined} />;
            }),
        [to],
    );


    return (
        <li>
            <ListItem button component={renderLink}
                secondaryAction={<ListItemText primary={price ? `£${price}` : null} />} >
                <ListItemAvatar>
                    {image
                        ? <Avatar alt={primary} src={image} />
                        : <Avatar>
                            <BungalowIcon />
                        </Avatar>
                    }
                </ListItemAvatar>
                <ListItemText
                    primary={primary}
                    secondary={secondary ? description : null}
                />
            </ListItem>
        </li>
    )
}
export default MarketplaceListItem;