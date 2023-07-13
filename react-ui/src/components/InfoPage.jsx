import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate, useLocation } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';


export default function InfoPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { main, sub, action } = state ?? { main: 'Successfull', sub: '', action: 'success' };

  return (
    <Box mt={3} sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignContent: 'space-between',
      flexWrap: 'wrap',
      height: 'calc(100vh - 160px)'
    }}>
      <Typography sx={{
        fontFamily: 'Roboto',
        textAlign: 'center',
        fontStyle: 'normal',
        fontWeight: '400',
        fontSize: '24px',
        lineHeight: '31px',
      }} gutterBottom>
        {main ?? 'Successfull'}
      </Typography>
      <Box mt={3} sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        flexWrap: 'wrap',
      }}>
        {(!action || action === 'success') ? <CheckCircleIcon sx={{ alignSelf: 'center', fontSize: '4.5rem' }} color="success" />
          :
          <CancelIcon sx={{ alignSelf: 'center', fontSize: "4.5rem" }} color="error" />
        }
        {sub ?
          <Typography sx={{
            padding: '20px',
            textAlign: 'center',
          }} gutterBottom>
            {sub ?? ''}
          </Typography>
          : null}
      </Box>
      <LoadingButton className={"custom-loading"}
        fullWidth
        variant="outlined"
        color="secondary"
        sx={{
          alignSelf: 'end',
          borderRadius: "6px",
          background: "secondary",
          boxShadow: "none",
        }}
        onClick={() => { navigate("/") }}>Return Home</LoadingButton>
    </Box>
  );
}