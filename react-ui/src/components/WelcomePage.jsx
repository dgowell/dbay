import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router";
import CircularProgress from '@mui/material/CircularProgress';
import DbayLogo from "../assets/images/dbay-logo.png";

function WelcomePage() {

    return (
        <Box sx={{
            mt: 4,
            pt: 16,
            height: '100%',
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',

        }}>
            <Box
                m={1}
                display="flex"
                justifyContent="center"
            >
                <img width="130" alt='dbay logo' src={DbayLogo} />
                
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignSelf: 'center',
                marginTop: '40px'
            }} >
                <CircularProgress />  
            </Box>
        </Box>
    )
}
export default WelcomePage;