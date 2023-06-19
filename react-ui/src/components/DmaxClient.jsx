import React, { useEffect, useRef, useState } from 'react';
import { handleDmaxClientSubmit, sendP2PIdentityRequest } from '../minima';
import { getServerP2PIdentity } from '../database/settings';
import useIsVaultLocked from '../hooks/useIsVaultLocked';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';




const DmaxClient = () => {
    const [P2PIdentity, setP2PIdentity] = useState(null);
    const formRef = useRef(null);
    const userLockedVault = useIsVaultLocked();
    const [error, setError] = useState(null);

    useEffect(() => {
        sendP2PIdentityRequest(function (msg) {
            console.log(msg);
            console.log('Sent request for p2p identity');
        });
    }, []);

    useEffect(() => {
        // Define the checkDatabase function inside the useEffect hook
        function checkDatabase() {
            // Perform a database query or check for the desired response
            // Example: Fetch data from the database
            getServerP2PIdentity()
                .then((response) => {
                    // Check if the desired response is received
                    if (typeof response === "string") {
                        debugger;
                        // Perform further actions or handle the response
                        setP2PIdentity(response);   
                    } else {
                        // If the desired response is not received, continue checking
                        setTimeout(checkDatabase, 2000); // Wait for 2 seconds before checking again
                    }
                })
                .catch((error) => {
                    // Handle any errors that occur during the database check
                    console.error('Error checking the database:', error);
                });
        }

        // Start the initial check
        checkDatabase();

        // Clean up the interval if the component unmounts
        return () => {
            clearTimeout(checkDatabase);
        };
    }, []); // Empty dependency array ensures that the effect runs only once on component mount


    const formik = useFormik({
        initialValues: {
            amount: 1,
            password: '',
        },
        validationSchema: Yup.object({
            amount: Yup.number()
                .min(1, 'Must be 1 or more')
                .max(100, 'Must be 100 or less')
                .required('Required'),
            password: Yup.string()
                .min(8, 'Must be 8 characters or more')
                .required('Required'),
        }),
        onSubmit: values => {
            console.log(values);
            handleDmaxClientSubmit(values);
        },
    });




    return (
        //a form with amount input and only password input if vault is locked, using mui components

        <Card variant="outlined">
            <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    1 Minima = 1 Day of Dmax
                </Typography>
                <Typography variant="h5" component="div">
                    Dmax Client
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    How many days of Dmax do you want?
                </Typography>
                <form ref={formRef} onSubmit={formik.handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            disabled={formik.isSubmitting}
                            fullWidth
                            id="amount"
                            name="amount"
                            label="Amount"
                            value={formik.values.amount}
                            onChange={formik.handleChange}
                            error={formik.touched.amount && Boolean(formik.errors.amount)}
                            helperText={formik.touched.amount && formik.errors.amount}
                        />
                        {userLockedVault &&
                            <TextField
                                disabled={formik.isSubmitting}
                                fullWidth
                                id="password"
                                name="password"

                                label="Password"
                                type="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                            />
                        }
                        <Button
                            disabled={formik.isSubmitting || !P2PIdentity}
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Submit
                        </Button>
                    </Stack>
                </form>
                {error && <p>{error}</p>}
            </CardContent>
        </Card>
    );
};

export default DmaxClient;