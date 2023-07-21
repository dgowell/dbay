import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router";

function  CollectionSuccess() {
    const navigate = useNavigate();

    function handleClick() {
        navigate('/marketplace');
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
                <Typography>You've successfully notified the seller that you will collect the item.</Typography>
                <Typography>They will be in contact with you through the number you provided them.</Typography>
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
export default CollectionSuccess;