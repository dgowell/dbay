import React, { useEffect, useRef } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { createSubscription, getSubscriptions, deleteSubscription } from '../database/subscriptions';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, Card, IconButton, Stack, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';
import { sendSubscriptionRequest } from '../minima';

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = React.useState(null);
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


    function handleAddSubscription(values, callback) {
        //use the values passed in to create a new subscription
        createSubscription({
            permanentAddress: values.seller_address,
            storeName: values.store_name,
            callback: function (response, error) {
                console.log(response);
                console.log(error);
                //log any errors and then set them
                if (error) {
                    console.log(error);

                    callback(null, error);
                }
                //if no errors, then clear the form
                else {
                    callback(response, null);
                    setSubscriptions([...subscriptions, { seller_store_name: values.store_name, seller_address: values.seller_address }]);
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
            store_name: Yup.string()
                .min(1, 'Must be at least 1 characters')
                .max(50, 'Must be less than 50 characters')
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
            <p>Here you can see all your subscriptions</p>
            {subscriptions && subscriptions.length > 0 &&
                <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    {subscriptions.map((subscription) => {
                        const labelId = `checkbox-list-secondary-label-${subscription.seller_store_name}`;
                        return (
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
                                    <IconButton edge="end" aria-label="delete" onClick={() => deleteSubscription(subscription.seller_permanent_address)}>
                                        <DeleteIcon />
                                    </IconButton>
                                }
                                disablePadding
                            >
                                <ListItemButton>
                                    <ListItemText id={labelId} primary={subscription.seller_store_name} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            }
            <Card sx={{ marginTop: 10, maxWidth: 345 }}>
                <form ref={formRef} onSubmit={formik.handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            disabled={formik.isSubmitting}
                            fullWidth
                            id="seller_address"
                            name="seller_address"
                            label="Seller Address"
                            value={formik.values.seller_address}
                            onChange={formik.handleChange}
                            error={formik.touched.seller_address && Boolean(formik.errors.seller_address)}
                            helperText={formik.touched.seller_address && formik.errors.seller_address}
                        />
                        <TextField
                            disabled={formik.isSubmitting}
                            fullWidth
                            id="store_name"
                            name="store_name"
                            label="Store Name"
                            value={formik.values.store_name}
                            onChange={formik.handleChange}
                            error={formik.touched.store_name && Boolean(formik.errors.store_name)}
                            helperText={formik.touched.store_name && formik.errors.store_name}
                        />
                        <Button
                            disabled={formik.isSubmitting}
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Subscribe
                        </Button>
                    </Stack>
                </form>
            </Card>
            {error && <Alert severity="error">{error.message ? error.message : String(error)}</Alert>}



        </div>

    );
}