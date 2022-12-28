import { useNavigate } from "react-router";
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function BackButton(props){
    const navigate = useNavigate();
    const handleBack = () => {
        navigate(props.route);
    }
    return <Button sx={{ justifyContent: 'flex-start'}} onClick={handleBack}><ArrowBackIcon /></Button>
}