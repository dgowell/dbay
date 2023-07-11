//functional comonent to return the notifications

import { useEffect, useState } from "react";
import { getNotifications, markNotificationAsRead } from "../database/notifications";
import Stack from '@mui/material/Stack';
import { useNavigate } from "react-router-dom";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Badge from '@mui/material/Badge';
import Skeleton from '@mui/material/Skeleton';

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [fetchingNotifications, setFetchingNotifications] = useState(true);

    function handleGoToListing(listing_id) {
        navigate(`/seller/listing/delivery/${listing_id}`);
    }

    function handleMarkAsRead(id) {
        console.log(id);
        markNotificationAsRead({
            notificationId: id,
            callback: function (data, error) {
                if (error) {
                    console.log(error);
                    return;
                }
                else {
                    console.log(`results:`, data);
                    getNotifications(function (data, error) {
                        if (error) {
                            console.log(error);
                            return;
                        }
                        else {
                            console.log(`results:`, data);
                            setNotifications(data);
                            setFetchingNotifications(false);
                        }
                    });
                }
            }
        });
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
                setFetchingNotifications(false);
            }
        });

        return;
    }, []);

    return (
        <div>
            <h1>Notifications</h1>
            {notifications.length === 0 && fetchingNotifications
                ? <Stack mt={4} spacing={1}>
                    <Skeleton variant="rounded" width='100%' height={60} />
                    <Skeleton variant="rounded" width='100%' height={60} />
                    <Skeleton variant="rounded" width='100%' height={60} />
                </Stack>
                : notifications.length === 0 
                    ? <p>There are no notifications</p>
                    : <Stack spacing={2}>
                    {notifications.map((notification) => (
                        <Card sx={{
                            minWidth: 275,
                            borderColor: notification.unread === "true" ? "rgb(111, 131, 255)" : "rgba(0, 0, 0, 0.12)",
                            borderWidth: notification.unread === "true" ? "2px" : "1px",
                        }} key={notification.notification_id} variant="outlined">
                            <CardContent>
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                    {formatDate(notification.created_at)}
                                </Typography>
                                <Typography variant="body2">
                                    {notification.message}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                {notification.listing && <Button onClick={() => handleGoToListing(notification.listing)} size="small" color="secondary" endIcon={<ArrowForwardIcon />}>Go to listing</Button>}
                                {notification.unread === "true" && <Button onClick={() => handleMarkAsRead(notification.notification_id)} size="small" color="secondary">Mark as Read</Button>}
                            </CardActions>

                        </Card>

                    ))}
                </Stack>
            }
        </div >
    );
}

