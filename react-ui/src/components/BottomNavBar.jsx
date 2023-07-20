import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from '@mui/icons-material/Home';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Paper from "@mui/material/Paper";
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Badge from '@mui/material/Badge';
import { useNotification } from "../hooks/useNotification";



function BottomNavBar() {
    const [activePage, setActivePage] = useState(0);
    const { notificationCount } = useNotification();

    //add a notification badge to the notifications icon

    return (
        <Paper
            sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 3, backgroundColor: "#000" }}
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
                    icon={<HomeIcon color="grey" />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/subscriptions"
                    icon={<FavoriteIcon color="grey" />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/listing/create"
                    icon={<AddCircleOutlineOutlinedIcon color="grey" />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/notifications"
                    icon={
                        <Badge badgeContent={notificationCount} color="secondary">
                            <NotificationsIcon color="grey" />
                        </Badge>}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/profile"
                    icon={<PersonIcon color="grey" />}
                />


            </BottomNavigation>
        </Paper>
    )
}
export default BottomNavBar;