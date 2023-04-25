import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
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
            sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 3, backgroundColor: "#000"}}
            elevation={6}
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
                    icon={<HomeOutlinedIcon color="grey" />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/listing/create"
                    icon={<AddCircleOutlineOutlinedIcon color="grey" fontSize="large"/>}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/profile"
                    icon={
                        <Badge color="error" variant="dot" size="large" invisible={!notification}>
                            <SwapHorizIcon color="grey" />
                        </Badge>
                    }
                />
            </BottomNavigation>
        </Paper>
    )
}
export default BottomNavBar;