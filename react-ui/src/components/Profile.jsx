import Box from "@mui/material/Box";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Typography from "@mui/material/Typography";
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from "react-router-dom";

function Profile() {

    const navigate = useNavigate();
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
            <Typography variant="h6" mt={1}>Monthrie</Typography>
        </Box>
        <Box sx={{
            m:2,
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
                            <ListItemText primary="My Listings" />
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