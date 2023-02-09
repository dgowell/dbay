import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Paper from "@mui/material/Paper";
import Badge from '@mui/material/Badge';
import { getNotificationStatus } from "../database/listing";

function BottomNavBar() {
    const [activePage, setActivePage] = useState();
    const [notification, setNotifcation] = useState(false);


    useEffect(() => {
        getNotificationStatus().then(
            status => setNotifcation(status),
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
                    // label="Home"
                    icon={<HomeOutlinedIcon />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/"
                    // label="Favourites"
                    icon={<FavoriteBorderOutlinedIcon />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/listing/create"
                    // label="Sell"
                    icon={<AddCircleOutlineOutlinedIcon />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/"
                    // label="Inbox"
                    icon={<MailOutlinedIcon />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/profile"
                    // label="Me"
                    icon={
                        <Badge color="secondary" variant="dot" invisible={!notification}>
                            <AccountCircleOutlinedIcon />
                        </Badge>
                    }
                />
            </BottomNavigation>
        </Paper>
    )
}
export default BottomNavBar;