import { useState } from "react";
import { getUnreadNotificationCount } from "../database/notifications";

export function useNotification() {
    const [notificationCount, setNotificationCount] = useState(0);
    
    getUnreadNotificationCount(function (count) {
        setNotificationCount(count);
    });

    return { notificationCount };
}

