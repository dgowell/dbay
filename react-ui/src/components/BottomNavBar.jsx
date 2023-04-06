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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

function BottomNavBar() {
    const [activePage, setActivePage] = useState(0);
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
            sx={{backgroundColor:"#2C2C2C",  "& .Mui-selected, .Mui-selected > svg": {
                color: "#007A78!important"
              }}}
                showLabels
                value={activePage}
                onChange={(event, page) => {
                    setActivePage(page);
                }}
            >
                <BottomNavigationAction
                    sx={{color:"white"}}
                    component={Link}
                    to="/"
                    // label="Home"
                    icon={<HomeOutlinedIcon />}
                />
                {/* <BottomNavigationAction
                    component={Link}
                    to="/"
                    // label="Favourites"
                    icon={<FavoriteBorderOutlinedIcon />}
                /> */}
                <BottomNavigationAction
                     sx={{color:"white"}}
                    component={Link}
                    to="/listing/create"
                    // label="Sell"
                    icon={<AddCircleOutlineOutlinedIcon  fontSize="large"/>}
                />
                {/* <BottomNavigationAction
                    component={Link}
                    to="/"
                    // label="Inbox"
                    icon={<MailOutlinedIcon />}
                /> */}
                <BottomNavigationAction
                     sx={{color:"white"}}
                    component={Link}
                    to="/profile"
                    // label="Me"
                    icon={
                        <Badge color="secondary" variant="dot" invisible={!notification}>
                            <SwapHorizIcon />
                        </Badge>
                    }
                />
            </BottomNavigation>
        </Paper>
    )
}
export default BottomNavBar;