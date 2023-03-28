import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from "react-router";

const ResponsiveAppBar = () => {
    const navigate = useNavigate();
    return (
        <AppBar elevation={0} position="static" sx={{backgroundColor:"#D9D9D9"}}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>

                    <IconButton sx={{color:"#222222"}} onClick={()=>navigate(-1)}>
                        <ArrowBackIcon/>
                    </IconButton>
                    <IconButton  sx={{color:"#222222"}} onClick={()=>navigate("/profile")}>
                        <PersonIcon/>
                    </IconButton>

                </Toolbar>
            </Container>
        </AppBar >
    );
};
export default ResponsiveAppBar;
