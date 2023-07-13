import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Paper from "@mui/material/Paper";
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';



function BottomNavBar() {
    const [activePage, setActivePage] = useState(0);

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
                    icon={<HomeOutlinedIcon color="grey" />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/subscriptions"
                    icon={<FavoriteIcon color="grey" />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/listing/create"
                    icon={<AddCircleOutlineOutlinedIcon color="grey" fontSize="large" />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/notifications"
                    icon={<NotificationsIcon color="grey" />}
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