import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Typography from "@mui/material/Typography";
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from "react-router-dom";
import Badge from '@mui/material/Badge';
import { getNotificationStatus } from '../database/listing';
import { getHost } from "../database/settings";

function Profile() {
    const [hasNotification, setHasNotification] = useState(false);
    const [name, setName] = useState("");

    const navigate = useNavigate();
    useEffect(() => {
        getNotificationStatus().then(
            status => setHasNotification(status),
            error => console.error(`couldn't get notification status ${error}`)
        )
        getHost().then((data)=>{
            setName(data.name);
        }
        )
        
       
    });

    return (<>
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mt: 6,
            mb: 6
        }}>
            <AccountCircleIcon />
            <Typography variant="h6" mt={1}>@{name}</Typography>
        </Box>
        <Box sx={{
            m: 2,
        }}>
            <Typography variant="h3">Transactions</Typography>
            <nav aria-label="main mailbox folders">
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate('/purchases')}>
                            <ListItemText primary="Purchases" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>

                        <ListItemButton onClick={() => navigate('/seller/listings')}>
                            <Badge anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }} color="secondary" variant="dot" invisible={!hasNotification}>
                                <ListItemText primary="My Listings" />
                            </Badge>
                        </ListItemButton>

                    </ListItem>
                </List>
            </nav>
            <Typography variant="h3">Account</Typography>
            <nav aria-label="main mailbox folders">
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate('/address')}>
                            <ListItemText primary="My Address" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate('/my-name')}>
                            <ListItemText primary="My Name" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </nav>
        </Box>
    </>
    )
}
export default Profile;