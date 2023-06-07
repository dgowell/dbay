import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById, updateListing } from "../database/listing";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import LoadingButton from "@mui/lab/LoadingButton";
import ListingDetailSkeleton from './ListingDetailSkeleton';
import Box from '@mui/material/Box';
import { useNavigate } from "react-router";
import { isContactByName, sendMessage } from "../minima";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { addContact, link } from "../minima";
import Alert from '@mui/material/Alert';
import { Button } from "@mui/material";

function ListingDeliverySeller() {
    const [listing, setListing] = useState();
    const params = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [status, setStatus] = useState();
    const [msg, setMsg] = useState();
    const [maxsoloError, setMaxsoloError] = useState('');

    async function handleAdd() {
        const { msg, status } = await addContact(listing.created_by_pk);
        console.log(msg, status);
        setStatus(status);
        setMsg(msg);
        if (status === "success") {
            setIsFriend(true);
        }
    }
    useEffect(() => {
        getListingById(params.id).then(function (result) {
            setListing(result);
            console.log("listing", result);
            isContactByName(result.buyer_name).then((res) => {
                console.log("isfriend", res)
                setIsFriend(res)
            })
        });

    }, [params.id]);

    function handleConfirmCollection() {
        setLoading(true);
        updateListing(listing.listing_id, { "status": "collection_confirmed" })
            .then(() => {

                const message = { "type": "COLLECTION_CONFIRMED", "data": { "listing_id": listing.listing_id } };
                const address = listing.buyer_pk;
                const app = 'dbay';

                sendMessage(message, address, app, function (res) {
                    console.log(res);
                    setLoading(false);
                    navigate('/seller/listings')
                });
            });
    }

    function handleRejectCollection() {
        setLoading(true);
        updateListing(listing.listing_id, { "status": "available" })
            .then(() => {

                const message = { "type": "COLLECTION_REJECTED", "data": { "listing_id": listing.listing_id } };
                const address = listing.buyer_pk;
                const app = 'dbay';

                sendMessage(message, address, app, function (res) {
                    console.log(res);
                    setLoading(false);
                    navigate('/seller/listings')
                });
            })
            .catch((e) => console.error(`Could not update listing as available: ${e}`));
    }
    function handleMaxSoloLink() {
        if (!isFriend) {
            handleAdd();
        }
        link('maxsolo', function (res) {
            if (res.status === false) {
                if (res.error.includes('permission escalation')) {
                    setMaxsoloError('Linking to MaxSolo requires that you have WRITE permissions set on dbay.');
                } else {
                    setMaxsoloError(res.error);
                }
            } else if (res.status === true) {
                setMaxsoloError('');
                window.open(res.base, '_blank');
            }
        });
    }

    function handleItemSent() {
        setLoading(true);
        updateListing(listing.listing_id, { "status": "completed" })
            .then(() => {
                setLoading(false);
                navigate('/seller/listings')
            })
            .catch((e) => console.error(`Could not update listing as completed: ${e}`));
    }

    useEffect(() => {
        if (listing) {
            updateListing(listing.listing_id, { 'notification': 'false' }).catch(e => console.error(`Couldn't reset notification ${e}`));
        }
    }, [listing]);

    return (
        <div>
            {listing ? (
                <div>
                    <Card sx={{ marginTop: 2, marginBottom: 8, boxShadow: "none" }}>
                        <CardHeader
                            sx={{ textAlign: "center" }}
                            title={listing.transmission_type === "collection" ? "Collection" : "Delivery"}
                            subheader={`${listing.title} $M${listing.price}`}
                        />
                        <CardContent>
                            <Box sx={{ my: 3, mx: 2, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'space-between', justifyContent: 'space-between', boxShadow: "none" }}>
                                {/*`@${listing.buyer_name} is waiting for the item to be sent`*/}
                                {listing.transmission_type === "collection" &&
                                    <>
                                        <Typography>@{listing.buyer_name} has requested to collect your item.</Typography>
                                        <Stack direction="column" spacing={2} sx={{ paddingLeft: 2, paddingRight: 2 }}>
                                        <Button className={"custom-loading"} onClick={handleMaxSoloLink} color="secondary" variant="contained">Chat Now</Button>
                                            {maxsoloError && <Alert severity="error">{maxsoloError}</Alert>}
                                            {listing.status === "ongoing" &&
                                                <>
                                                    <LoadingButton className={"custom-loading"} loading={loading} fullWidth variant="contained" color={"secondary"} onClick={handleConfirmCollection}>Confirm request</LoadingButton>
                                                    <LoadingButton className={"custom-loading"} loading={loading} fullWidth variant="outlined" color={"secondary"} onClick={handleRejectCollection}>Reject request</LoadingButton>
                                                </>
                                            }
                                        </Stack>
                                    </>



                                }
                                {listing.transmission_type === "delivery" &&
                                    <>
                                        {listing.buyer_message
                                            ? <>
                                                <Typography gutterBottom variant="h6" component="div">Please send the item to:</Typography>
                                                <Typography gutterBottom sx={{ textAlign: "left" }} component="p">{listing.buyer_message.split("\n").map((i, key) => {
                                                    return <p key={key}>{i}</p>;
                                                })}</Typography>
                                            </>
                                            : "Buyer has missed the delivery details , you can contact buyer via maxSolo for missing details"
                                        }
                                        <Divider />
                                        <LoadingButton className={"custom-loading"} sx={{ marginTop: "60%" }} loading={loading} fullWidth variant="contained" color={"secondary"} onClick={handleItemSent}>Item Sent</LoadingButton>
                                    </>
                                }
                            </Box>
                        </CardContent>
                    </Card>
                </div>
            ) : <ListingDetailSkeleton />
            }
        </div >
    );
}
export default ListingDeliverySeller;
