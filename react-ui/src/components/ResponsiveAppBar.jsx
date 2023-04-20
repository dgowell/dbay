import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from "react-router";
import { ReactComponent as Logo } from '../assets/images/logo.svg';


const ResponsiveAppBar = () => {
    const navigate = useNavigate();
    return (
        <AppBar elevation={0} position="sticky" sx={{backgroundColor:"#2C2C2C"}}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>

                    <IconButton sx={{color:"white"}} onClick={()=>navigate(-1)}>
                        <ArrowBackIcon/>
                    </IconButton>
                    {process.env.REACT_APP_MODE==="mainnet" && <Typography>Test Mode</Typography>}
                    <IconButton size='small' sx={{color:"white", height: "40px"}}>
                        <Logo />
                    </IconButton>

                </Toolbar>
            </Container>
        </AppBar >
    );
};
export default ResponsiveAppBar;
