import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LoadingButton from '@mui/lab/LoadingButton';
import { getListingById } from '../database/listing';
import { useNavigate } from "react-router";
import { purchaseListing, cancelCollection } from '../minima/buyer-processes';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';

import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import BackButton from './BackButton';
import PaymentError from './PaymentError';
import BungalowIcon from "@mui/icons-material/Bungalow";
import Badge from '@mui/material/Badge';

function ListingCollectionBuyer(props) {
    const [listing, setListing] = useState();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const navigate = useNavigate();


    useEffect(() => {
        getListingById(params.id).then(function (result) {
            setListing(result);
        });
    }, [params.id]);

    function handleSend() {
        setLoading(true);
        setError(false);

        purchaseListing({
            listingId: listing.listing_id,
            seller: listing.created_by_pk,
            walletAddress: listing.wallet_address,
            purchaseCode: listing.purchase_code,
            amount: listing.price,
        }).then(
            () => navigate('/payment-success'),
            error => setError(error)
        )
    }
    function handleCancel() {
        cancelCollection({
            listingId: listing.listing_id,
            seller: listing.created_by_pk
        })
    }

    if (listing) {
        if (!error) {
            return (
                <Box sx={{
                    pt: 2,
                    pb: 10,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <Box mb={4} >
                        <BackButton />
                    </Box>
                    <List>
                        <ListItem>
                            <ListItemAvatar>
                                {listing.image ? (
                                    <Avatar alt={listing.title} src={listing.image.split("(+_+)")[0]} style={{ borderRadius: "5px" }} />
                                ) : (
                                    <Badge anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }} color="secondary" variant="dot" invisible={!(listing.notification === 'true')}>
                                        <Avatar>
                                            <BungalowIcon />
                                        </Avatar>
                                    </Badge>
                                )}
                            </ListItemAvatar>
                            <ListItemText primary={`M$${listing.price}`} secondary={listing.title} />
                        </ListItem>
                    </List>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        p: 2,
                        gap: 3,
                    }}>
                        {listing.transmission_type === 'collection' &&
                            <Typography>Please arrange collection with seller</Typography>
                        }
                        {listing.transmission_type === 'delivery' &&
                            <Typography>Please wait for your delivery</Typography>
                        }
                    </Box>
                    <Box
                        m={1}
                        gap={3}
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                    >
                        {listing.transmission_type === 'collection' &&
                            <Stack direction="row" spacing={2}>
                                <LoadingButton disabled={error} loading={loading} onClick={handleSend} variant="contained">
                                    Collect & Pay
                                </LoadingButton>
                                <Button onClick={handleCancel}>Cancel</Button>
                            </Stack>
                            }
                    </Box>
                </Box>
            );
        } else {
            return (
                <PaymentError error={error} />
            );
        }
    } else {
        return null;
    }
}
export default ListingCollectionBuyer