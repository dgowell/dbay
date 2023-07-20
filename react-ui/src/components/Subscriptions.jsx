import React, { useEffect, useRef } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { createSubscription, getSubscriptions, deleteSubscription } from '../database/subscriptions';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, IconButton, Stack, TextField, Paper, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';
import { sendSubscriptionRequest } from '../minima';
import { sendMessage } from '../minima';
import { getMaximaContactAddress } from '../minima';
import Divider from '@mui/material/Divider';
import LoadingButton from "@mui/lab/LoadingButton";

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const formRef = useRef(null);

    useEffect(() => {
        getSubscriptions(function (response, error) {
            //log any errors and then set them
            if (error) {
                console.log(error);

                setError(error);

            }
            //if no errors, then clear the form
            else {
                if (response.rows.length > 0) {
                    setSubscriptions(response.rows);
                    console.log(response.rows);
                }
            }
        });
    }, []);

    function handleDeleteSubscription(address) {
        deleteSubscription({
            permanent_address: address,
            callback: function (response, error) {
                if (error) {
                    console.log(error);
                    setError(error);
                } else {
                    console.log(response);
                    getSubscriptions(function (response, error) {
                        //log any errors and then set them
                        if (error) {
                            console.log(error);

                            setError(error);
                        }
                        //if no errors, then clear the form
                        else {
                            if (response.rows.length > 0) {
                                setSubscriptions(response.rows);
                                console.log(response.rows);
                            }
                             else {
                                console.log("i'm hererererer");
                                setSubscriptions(null);
                             }
                        }
                    }
                    );
                }
            }
        })
    }


    async function handleAddSubscription(values, callback) {
        setLoading(true);
        let maximaContactAddress = await getMaximaContactAddress();
        //send max message to the permanent max address that was given in the form
        const data = { "type": "SELLER_INFO_REQUEST", "data": { "subscriber_address": maximaContactAddress } };
        const address = values.seller_address;
        const app = 'dbay';

        sendMessage({
            data, address, app, callback: function (res) {
                console.log('Send message: ' + res);
                if (res.status === "true" || res.status === true) {
                    //if the max address is valid, then add the subscription
                    createSubscription({
                        permanentAddress: values.seller_address, callback: function (response, error) {
                            //log any errors and then set them
                            if (error) {
                                console.log(error);
                                callback(null, error);
                            }
                            //if no errors, then clear the form
                            else {
                                console.log('Subscription Added');
                                window.MDS.log('Subscription Added');
                                callback(response, null);

                                setTimeout(function () {
                                    getSubscriptions(function (response, error) {
                                        //log any errors and then set them
                                        if (error) {
                                            console.log(error);

                                            setError(error);
                                            setLoading(false);

                                        }
                                        //if no errors, then clear the form
                                        else {
                                            if (response.rows.length > 0) {
                                                if (response.rows[0].seller_store_name !== null) {
                                                    setSubscriptions(response.rows);
                                                    console.log(response.rows);
                                                    setLoading(false);
                                                }

                                            }
                                        }
                                    });
                                }, 3000);
                            }
                        }
                    });
                } else {
                    callback(null, "Invalid Max Address");
                }
            }
        });
    }





    const formik = useFormik({
        initialValues: {
            seller_address: '',
            store_name: '',
        },
        validationSchema: Yup.object({
            //check the string right length
            seller_address: Yup.string()
                .min(600, 'Must be at least 600 characters')
                .max(650, 'Must be less than 650 characters')
                .required('Required'),
        }),
        onSubmit: values => {
            console.log(values);
            handleAddSubscription(values, function (response, error) {
                //log any errors and then set them
                if (error) {
                    console.log(error);
                    if (error.includes("Unique index or primary key violation")) {
                        setError("You already have a subscription for this store");
                    } else {
                        setError(error);
                    }
                }
                //if no errors, then clear the form
                else {
                    formik.resetForm();
                    console.log(response);
                }
            });
        },
    });


    return (
        <div>
            <h1>Subscriptions</h1>
            <Typography sx={{ mt: 2, mb: 1 }} variant="h6" component="div">Add a new subscription</Typography>
            <Box sx={{ marginTop: 3, maxWidth: 345, marginBottom: 3 }}>
                <form ref={formRef} onSubmit={formik.handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            disabled={formik.isSubmitting}
                            fullWidth
                            id="seller_address"
                            name="seller_address"
                            label="Seller Address"
                            placeholder='MAX#'
                            value={formik.values.seller_address}
                            onChange={formik.handleChange}
                            error={formik.touched.seller_address && Boolean(formik.errors.seller_address)}
                            helperText={formik.touched.seller_address && formik.errors.seller_address}
                        />
                        <LoadingButton
                            disabled={formik.isSubmitting}
                            loading={loading}
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ width: '50%' }}
                        >
                            Subscribe
                        </LoadingButton>
                    </Stack>

                </form>
            </Box>
            <Divider></Divider>
            {error && <Alert severity="error">{error.message ? error.message : String(error)}</Alert>}
            {subscriptions && subscriptions.length > 0 &&
                <>
                    <Typography sx={{ mt: 2, mb: 1 }} variant="h6" component="div">List of Subscriptions</Typography>
                    <Stack spacing={1} sx={{ marginTop: '15px', width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                        {subscriptions.map((subscription) => {
                            const labelId = `checkbox-list-secondary-label-${subscription.seller_store_name}`;
                            return (
                                <Paper sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                                    <ListItem
                                        key={subscription}
                                        onClick={() => sendSubscriptionRequest(subscription.seller_permanent_address, function (response, error) {
                                            if (error) {
                                                console.log(error);
                                                setError(error);
                                            }
                                            else {
                                                console.log(response);
                                            }
                                        }
                                        )}
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteSubscription(subscription.seller_permanent_address)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                        disablePadding
                                    >
                                        <ListItemButton>
                                            <ListItemText id={labelId} primary={subscription.seller_store_name} />
                                        </ListItemButton>
                                    </ListItem>
                                </Paper>
                            );
                        })}
                    </Stack>
                </>
            }



        </div>

    );
}