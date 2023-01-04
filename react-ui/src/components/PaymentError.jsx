import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router";
import Alert from '@mui/material/Alert';

function PaymentError(props) {
    const navigate = useNavigate();

    function handleClick() {
        navigate('/');
    }

    return (
        <Box sx={{
            mt: 4,
            pt: '25vh',
            height: '100%',
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',

        }}>
            <Alert severity="error">{props.error}</Alert>
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