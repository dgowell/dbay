//functional comonent to return the notifications

import { useEffect, useState } from "react";
import { getNotifications } from "../database/notifications";
import Stack from '@mui/material/Stack';
import { useNavigate } from "react-router-dom";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    function handleGoToListing(listing_id) {
        navigate(`/seller/listing/delivery/${listing_id}`);
    }

    //show timestamp in 14 JUN format
    function formatDate(date) {
        const d = new Date(date * 1000);
        const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
        const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
        const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
        return `${da} ${mo}`;
    }

    
    useEffect(() => {
        getNotifications(function (data, error) {
            if (error) {
                console.log(error);
                return;
            }
            else {
                console.log(`results:`, data);
                setNotifications(data);
            }
        });

        return;
    }, []);

    return (
        <div>
            <h1>Notifications</h1>
            {notifications.length === 0
                ? <p>There are no notifications</p>
                : <Stack spacing={2}>
                    {notifications.map((notification) => (
                        <Card sx={{ minWidth: 275 }}>
                            <CardContent>
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                    {formatDate(notification.created_at)}
                                </Typography>
                                <Typography variant="body2">
                                    {notification.message}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button onClick={() => handleGoToListing(notification.listing)} size="small" color="secondary" endIcon={<ArrowForwardIcon />}>Go to listing</Button>
                            </CardActions>
                        </Card>
                    ))}
                </Stack>
            }
        </div >
    );
}

