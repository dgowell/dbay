import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById, deleteListing, updateListing } from "../database/listing";
import CardContent from "@mui/material/CardContent";
import Button from '@mui/material/Button';
import CardMedia from "@mui/material/CardMedia";
import Card from "@mui/material/Card";
import { sendListingToContacts, addContact, link, sendMessage } from "../minima";
import ListingDetailSkeleton from './ListingDetailSkeleton';
import Carousel from 'react-material-ui-carousel'
import DeleteIcon from '@mui/icons-material/Delete';
import MuiAlert from '@mui/material/Alert';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PersonPinCircleOutlinedIcon from '@mui/icons-material/PersonPinCircleOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { Stack } from "@mui/system";
import Snackbar from '@mui/material/Snackbar';
import Divider from "@mui/material/Divider";
import LoadingButton from "@mui/lab/LoadingButton";



const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function ListingDetailSeller() {
    const [listing, setListing] = useState();
    const [images, setImages] = useState([]);
    const [deleted, setDeleted] = useState(false);
    const [error, setError] = useState(false);
    const [sent, setSent] = useState(false);
    const params = useParams();
    const navigate = useNavigate();
    const [navButtonsVisible, setNavButtonsVisible] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [maxsoloError, setMaxsoloError] = useState('');
    const [loading, setLoading] = useState(false);


    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSent(false);
    };
    useEffect(() => {
        getListingById(params.id).then(function (result) {
            setListing(result);
            setImages(result.image.split("(+_+)"))
            if (result.image.split("(+_+)").length > 1) {
                setNavButtonsVisible(true)
            }
        });
    }, [params.id]);

    async function handleAdd() {
        const { msg, status } = await addContact(listing.buyer_address);
        console.log(msg, status);
        if (status === "success") {
            setIsFriend(true);
        }
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

    function handleShare() {
        sendListingToContacts(listing.listing_id)
            .then(() => {
                console.log('sent to all contacts!');
                setSent(true);
            }).catch((e) => console.error(e));
    }

    function handleDelete() {
        deleteListing(listing.listing_id).then(
            () => setDeleted(true),
            error => setError(`Couldn't delete listing`)
        );
    }

    if (deleted) {
        setTimeout(() => {
            navigate(`/`);
        }, 2500);
        return (
            <Alert mt={8} severity="info">Item has been deleted</Alert>
        )
    }
    function handleItemSent() {
        setLoading(true);
        updateListing(listing.listing_id, { "status": "completed" })
            .then(() => {
                setLoading(false);
                const data = {
                    "type": "ITEM_SENT_CLICKED",
                    "data": {
                        "listing_id": listing.listing_id
                    }
                }
                sendMessage({
                    data, address: listing.buyer_pk, app: 'dbay', function(res) {
                        console.log(res);
                        navigate('/seller/listings')
                    }
                });
            })
            .catch((e) => console.error(`Could not update listing as completed: ${e}`));
    }
    return (
        <div>
            {listing ? (
                <div>
                    <Card sx={{ maxWidth: '100%', marginTop: 2, border: "none", boxShadow: "none" }}>
                        <Carousel indicators={false} height="350px" animation="slide" navButtonsAlwaysVisible={navButtonsVisible}>
                            {
                                images.map((image, i) => (
                                    <CardMedia
                                        component="img"
                                        width="100%"
                                        height="100%"
                                        minHeight="100%"
                                        minWidth="100%"
                                        objectFit="cover"
                                        position="center"
                                        image={image}
                                    />))
                            }
                        </Carousel>

                        <CardContent sx={{ padding: '15px 0 0', wordWrap: 'break-word' }} >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb="1rem">
                                <Typography gutterBottom variant="h5" component="div" mb="0">
                                    $M{listing.price}
                                </Typography>
                            </Stack>
                            <Snackbar open={sent} autoHideDuration={6000} onClose={handleClose}>
                                <Alert onClose={handleClose} color="secondary" severity="success" sx={{ width: '100%' }}>
                                    Item shared with contacts
                                </Alert>
                            </Snackbar>

                            <Typography gutterBottom variant="h6" component="div">
                                {listing.title}
                            </Typography>
                            <Typography gutterBottom component="div" mb="1.5rem">
                                {listing.description
                                    ? <p style={{ fontFamily: 'inherit' }}>{listing.description}</p>
                                    : "This item has no description"}
                            </Typography>
                        </CardContent>
                        <Divider style={{ marginTop: "30px", marginBottom: "10px" }}></Divider>
                        <List>
                            {listing.collection === "true"
                                ?
                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <PersonPinCircleOutlinedIcon color="secondary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Collection"
                                        />
                                    </ListItemButton>
                                </ListItem>
                                : null}
                            {listing.delivery === "true"
                                ?
                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <LocalShippingOutlinedIcon color="secondary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`Shipping`}
                                            secondary={`$M${listing.shipping_cost}`}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                : null}
                        </List>
                        <Stack mt={3} direction="column" spacing={2}>
                            {listing.status === "available" &&
                                <Button xs={{ width: '100%' }} aria-label="share" onClick={() => handleShare()} variant="contained" color="secondary">
                                    {error && <Alert severity="error">{error}</Alert>}
                                    Reshare Listing
                                </Button>
                            }
                            <Button xs={{ width: '100%' }} aria-label="delete listing" onClick={() => handleDelete()} startIcon={<DeleteIcon />} variant="outlined" color="error">
                                {error && <Alert severity="error">{error}</Alert>}
                                Delete Listing
                            </Button>
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
                                    <Typography>Notify the buyer that you have sent the item so they can expect it.</Typography>
                                    <LoadingButton disabled={listing.status === 'completed'} className={"custom-loading"} loading={loading} fullWidth variant="contained" color={"secondary"} onClick={handleItemSent}>Confirm Item Sent</LoadingButton>
                                </>
                            }
                        </Stack>
                    </Card>
                </div>
            ) : <ListingDetailSkeleton />}
        </div>
    );
}
export default ListingDetailSeller;
