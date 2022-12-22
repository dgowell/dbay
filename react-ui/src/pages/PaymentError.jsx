import CancelIcon from '@mui/icons-material/Cancel';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router";

function PaymentError() {
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
                <CancelIcon color="error" />
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignSelf: 'center'
            }} >
                <Typography>Something went wrong, payment failed!</Typography>
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
export default PaymentError;