import React, { useState, useEffect } from 'react';

const useIsVaultLocked = () => {
    const [isVaultLocked, setVaultLocked] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await new Promise((resolve, reject) => {
                    window.MDS.cmd('status', (res) => {
                        if (!res.status) reject(res.error ? res.error : 'RPC Failed');
                        resolve(res.response);
                    });
                });

                if (response.locked) {
                    setVaultLocked(true);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchStatus();
    }, []);

    return isVaultLocked;
};

export default useIsVaultLocked;
