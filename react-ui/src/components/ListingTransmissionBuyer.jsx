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

import ListItemText from "@mui/material/ListItemText";

import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import BackButton from './BackButton';
import PaymentError from './PaymentError';
import BungalowIcon from "@mui/icons-material/Bungalow";
import Badge from '@mui/material/Badge';
import { hasSufficientFunds } from '../minima/buyer-processes';

function ListingCollectionBuyer(props) {
    const [listing, setListing] = useState();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const navigate = useNavigate();
    const [intro, setIntro] = useState('');

    useEffect(() => {
        if (listing) {
            setIntro(encodeURI(`Hi ${listing.created_by_name} this is ${listing.buyer_name} from dbay - when can I come and collect the ${listing.title}?`));
        }
    }, [listing]);


    useEffect(() => {
        getListingById(params.id).then(function (result) {
            setListing(result);
        });
    }, [params.id]);

    async function handleSend() {
        setLoading(true);
        setError(false);

        //check there is money to pay for the item first
        const hasFunds = await hasSufficientFunds(listing.price).catch(error => {
            setError('Insufficient Funds');
            setLoading(false);
            console.log(`Insufficient funds: ${error}`);
        });

        if (hasFunds) {
            purchaseListing({
                listingId: listing.listing_id,
                seller: listing.created_by_pk,
                walletAddress: listing.wallet_address,
                purchaseCode: listing.purchase_code,
                amount: listing.price,
                transmissionType: listing.transmission_type,
            }).then(
                () => navigate('/payment-success'),
                error => setError(error)
            )
        }
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
                            <Box>
                                <Typography mb={3} gutterBottom component="div">Please wait for the seller to arrange collection on Whatsapp.</Typography>
                                <Typography gutterBottom component="div">When you have collected the item and are happy with it, you can complete the purchase by paying the seller using the button below</Typography>
                            </Box>
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
                            <Stack mt={15} direction="row" spacing={2}>
                                <LoadingButton disabled={error} loading={loading} onClick={handleSend} variant="contained">
                                     PAY NOW
                                </LoadingButton>
                                <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
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