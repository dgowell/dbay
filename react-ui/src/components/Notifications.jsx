//functional comonent to return the notifications

import { useEffect, useState } from "react";
import { getNotifications } from "../database/notifications";
import { Link } from "react-router-dom";


export default function Notifications() {
    const [notifications, setNotifications] = useState([]);

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
            { notifications.length === 0
                ? <p>There are no notifications</p>
                : <ul>
                    {notifications.map((notification) => (
                        <li key={notification.id}>
                            <Link to={`/listing/${notification.listing_id}`}>
                                {notification.message}
                            </Link>
                        </li>
                    ))}
                </ul>
            }
        </div >
    );
}

