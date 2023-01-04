import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router";

function PaymentSuccess() {
    const navigate = useNavigate();

    function handleClick() {
        navigate('/');
    }

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
                <CheckCircleIcon color="success" />
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignSelf: 'center'
            }} >
                <Typography>Payment Successful</Typography>
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                height: 60,
                flex: 1
            }} >
                <Button variant="outlined" onClick={handleClick}>Home</Button>
            </Box>
        </Box>
    )
}
export default PaymentSuccess;