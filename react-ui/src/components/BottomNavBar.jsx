import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MailIcon from "@mui/icons-material/Mail";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Paper from "@mui/material/Paper";
import { getNotificationStatus } from '../database/listing';
import Badge from '@mui/material/Badge';

function BottomNavBar() {
    const [activePage, setActivePage] = useState();
    const [invisible, setInvisible] = useState(false);


    useEffect(() => {
        getNotificationStatus().then(
            status => setInvisible(status),
            error => console.error(`couldn't get notification status`)
        )
    });
    return (
        <Paper
            sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={activePage}
                onChange={(event, page) => {
                    setActivePage(page);
                }}
            >
                <BottomNavigationAction
                    component={Link}
                    to="/"
                    label="Home"
                    icon={<HomeIcon />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/"
                    label="Favourites"
                    icon={<FavoriteIcon />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/listing/create"
                    label="Sell"
                    icon={<AddCircleIcon />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/"
                    label="Inbox"
                    icon={<MailIcon />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/profile"
                    label="Me"
                    icon={
                        <Badge color="secondary" variant="dot" invisible={invisible}>
                            <AccountCircleIcon />
                        </Badge>
                    }
                />
            </BottomNavigation>
        </Paper>
    )
}
export default BottomNavBar;