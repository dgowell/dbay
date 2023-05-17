import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById, updateListing } from "../database/listing";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import LoadingButton from "@mui/lab/LoadingButton";
import ListingDetailSkeleton from './ListingDetailSkeleton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { useNavigate } from "react-router";
import { isContactByName } from "../minima";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

function ListingDeliverySeller() {
    const [listing, setListing] = useState();
    const params = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [status, setStatus] = useState();
    const [msg, setMsg] = useState();


    function handleAdd() {
        setStatus('success');
        setMsg("Contact added successfully!");
        setIsFriend(true);

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

    function handleItemSent() {
        setLoading(true);
        updateListing(listing.listing_id, "status", "completed")
            .then(() => {
                setLoading(false);
                navigate('/seller/listings')
            })
            .catch((e) => console.error(`Could not update listing as completed: ${e}`));
    }

    useEffect(() => {
        if (listing) {
            updateListing(listing.listing_id, 'notification', 'false').catch(e => console.error(`Couldn't reset notification ${e}`));
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
                            <Box sx={{ my: 3, mx: 2, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', boxShadow: "none" }}>
                                <Alert sx={{ width: "100%" }} severity='success' variant="outlined">
                                    {listing.transmission_type === "collection" ? `@${listing.buyer_name} has agreed to collect your item` : `@${listing.buyer_name} is waiting for the item to be sent`}
                                </Alert>
                                {listing.transmission_type === "collection" &&
                                    <>
                                        <Stack spacing={2} sx={{ paddingLeft: 2, paddingRight: 2 }}>
                                            <Typography sx={{}} variant="h3">MaxSolo</Typography>
                                            <Typography sx={{ fontSize: 15, paddingBottom: '30px' }} variant="p">{!isFriend ? `Add @${listing.buyer_name} as a contact and get in touch with them using the MaxSolo MiniDapp.` : `The buyer is already one of your contacts. Get in touch with @${listing.buyer_name} to arrange collection`}</Typography>
                                            {!isFriend &&
                                            <>
                                                <LoadingButton className={"custom-loading"} color="secondary" variant="contained" onClick={() => handleAdd()}>Add Contact</LoadingButton>
                                                {msg && <Alert sx={{ width: "100%" }} severity={status ? 'success' : 'error'} variant="outlined">{msg}</Alert>}
                                            </>}
                                        </Stack>
                                        <LoadingButton className={"custom-loading"} sx={{ marginTop: "60%" }} color="secondary" onClick={() => navigate("/")} variant="outlined">
                                            Close
                                        </LoadingButton>
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
                                        {!isFriend && <Stack spacing={2} sx={{ paddingLeft: 2, paddingRight: 2 }}>
                                            <Typography sx={{}} variant="h3">MaxSolo</Typography>
                                            <Typography sx={{ fontSize: 15, paddingBottom: '30px' }} variant="p">{!isFriend ? `Add the @${listing.buyer_name} as a contact and get in touch with them using the MaxSolo MiniDapp.` : `Great the buyer is already one of your contacts. get in touch with @${listing.buyer_name}`}</Typography>
                                            {!isFriend && <><LoadingButton className={"custom-loading"} color="primary" variant="contained" onClick={() => handleAdd()}>add Contact</LoadingButton>
                                                {msg && <Alert sx={{ width: "100%", backgroundColor: '#FFF' }} severity={status ? 'success' : 'error'} variant="outlined">{msg}</Alert>}
                                                <Typography sx={{ textAlign: 'center', marginTop: '15px', flex: 1 }} variant="caption">The @{listing.buyer_name} is expecting you to get in touch.</Typography></>}
                                        </Stack>}
                                        <LoadingButton className={"custom-loading"} sx={{ marginTop: "60%" }} loading={loading} fullWidth variant="contained" color={"secondary"} onClick={handleItemSent}>Item Sent</LoadingButton>
                                    </>
                                }
                            </Box>
                        </CardContent>
                    </Card>
                </div>
            ) : <ListingDetailSkeleton />}
        </div>
    );
}
export default ListingDeliverySeller;
