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
            justifyContent: 'center',
            alignContent: 'space-between',
            width: '100%',
            backgroundColor: '#D9D9D9'
        }}>
            <Typography>Something went wrong, please try again</Typography>
            <CancelIcon color="error"/>
            <Button variant="outlined" onClick={handleClick}>Home</Button>
        </Box>
    )
}
export default PaymentError;