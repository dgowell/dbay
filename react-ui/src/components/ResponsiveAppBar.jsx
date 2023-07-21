import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router";
import { ReactComponent as Logo } from '../assets/images/logo.svg';
import Button from '@mui/material/Button';

const ResponsiveAppBar = () => {
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate('/marketplace');
    };

    return (
        <AppBar elevation={0} position="sticky" sx={{backgroundColor:"#2C2C2C"}}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
                    <IconButton sx={{color:"white"}} onClick={()=>navigate(-1)}>
                        <ArrowBackIcon color="white" />
                    </IconButton>
                    <Button onClick={handleLogoClick}>
                        <IconButton size='small' sx={{color:"white", height: "40px"}}>
                            <Logo />
                        </IconButton>
                    </Button>
                </Toolbar>
            </Container>
        </AppBar >
    );
};
export default ResponsiveAppBar;

