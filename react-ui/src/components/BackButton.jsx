import { useNavigate } from "react-router";
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function BackButton(route){
    const navigate = useNavigate();
    const handleBack = () => {
        navigate(route);
    }
    return <Button onClick={handleBack}><ArrowBackIcon /></Button>
}