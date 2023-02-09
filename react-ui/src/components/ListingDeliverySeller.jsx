import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById, updateListing } from "../database/listing";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import BackButton from "./BackButton";
import ListingDetailSkeleton from './ListingDetailSkeleton';
import Alert from '@mui/material/Alert';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Person4Icon from '@mui/icons-material/Person4';
import Box from '@mui/material/Box';
import { useNavigate } from "react-router";

function ListingDeliverySeller() {
    const [listing, setListing] = useState();
    const params = useParams();
    const [intro, setIntro] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getListingById(params.id).then(function (result) {
            setListing(result);
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
            setIntro(encodeURI(`Hi ${listing.buyer_name} this is ${listing.created_by_name} from dbay - when would you like to come and collect the ${listing.title}?`));
        }
    }, [listing]);

    return (
        <div>
            {listing ? (
                <div>
                    <Card sx={{ maxWidth: 345, marginTop: 2, marginBottom: 8 }}>
                        <CardHeader
                            avatar={
                                <BackButton />
                            }
                        />
                        <CardContent>
                            <Box sx={{ my: 3, mx: 2, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                                <Alert severity="success">
                                    @{listing.buyer_name} has paid for your item {listing.title}
                                </Alert>
                                {listing.transmission_type === "collection" &&
                                    <>
                                        {listing.buyer_message
                                            ? <Box>
                                                <Typography gutterBottom component="div">Please contact them to arrange collection:</Typography>
                                                <ListItem disablePadding>
                                                    <ListItemButton>
                                                        <ListItemIcon>
                                                            <Person4Icon />
                                                        </ListItemIcon>
                                                        <ListItemText primary={listing.buyer_message} secondary={listing.buyer_name} />
                                                    </ListItemButton>
                                                </ListItem>
                                                <Button fullWidth target="_blank" variant="outlined" startIcon={<WhatsAppIcon />} href={`https://api.whatsapp.com/send?phone=${listing.buyer_message}&text=${intro}`}>Send Message</Button>
                                            </Box>
                                            : "No details supplied! Not really sure what you can do now sorry!"
                                        }
                                    </>
                                }
                                {listing.transmission_type === "delivery" &&
                                    <>
                                        {listing.buyer_message
                                            ?<>
                                                <Typography gutterBottom variant="h6" component="div">Please send the item to:</Typography>
                                                <Typography gutterBottom sx={{textAlign:"left"}} component="p">{listing.buyer_message.split("\n").map((i, key) => {
                                                                                            return <p key={key}>{i}</p>;
                                                                                            })}</Typography>
                                            </>
                                            : "Buyer supplied no contact details, enjoy your free money"
                                        }
                                        <Alert severity="info">Let the buyer know you've sent the item</Alert>
                                        <LoadingButton  loading={loading} fullWidth variant="contained" onClick={handleItemSent}>Item Sent</LoadingButton>
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
