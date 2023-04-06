import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById, deleteListing } from "../database/listing";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import ShareIcon from "@mui/icons-material/Share";
import Card from "@mui/material/Card";
import Tooltip from "@mui/material/Tooltip";
import { sendListingToContacts } from "../minima";
import BackButton from "./BackButton";
import ListingDetailSkeleton from './ListingDetailSkeleton';
import Carousel from 'react-material-ui-carousel'
import DeleteIcon from '@mui/icons-material/Delete';
import CardActions from "@mui/material/CardActions";
import Alert from '@mui/material/Alert';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Divider from "@mui/material/Divider";
import LocationOnIcon from '@mui/icons-material/LocationOn';

function ListingDetailSeller() {
    const [listing, setListing] = useState();
    const [images, setImages] = useState([]);
    const [deleted, setDeleted] = useState(false);
    const [error, setError] = useState(false);
    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        getListingById(params.id).then(function (result) {
            setListing(result);
            setImages(result.image.split("(+_+)"))
        });
    }, [params.id]);

    function handleShare() {
        sendListingToContacts(listing.listing_id);
        //TODO:show to user that the listing has been shared
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

    return (
        <div>
            {listing ? (
                <div>
                    <Card sx={{ maxWidth: 345, marginTop: 2, marginBottom: 8,boxShadow:"none" }}>
                        <CardHeader
                            // avatar={
                            //     <BackButton />
                            // }
                            action={
                                <Tooltip title="Share to all your contacts" placement="top">
                                    <IconButton
                                        onClick={() => handleShare()}
                                        aria-label="share"
                                    >
                                        <ShareIcon />
                                    </IconButton>
                                </Tooltip>
                            }
                        />
                        <Carousel animation="slide" navButtonsAlwaysVisible={true}>
                            {
                                images.map((image, i) => (
                                    <CardMedia
                                        component="img"
                                        width="100%"
                                        image={image}
                                        alt="Test Image"
                                    />))
                            }
                        </Carousel>

                        <CardContent>
                            <Typography gutterBottom variant="h4" component="div">
                                M${listing.price}
                            </Typography>
                            <Typography gutterBottom variant="h6" component="div">
                                {listing.title}
                            </Typography>
                            <Typography gutterBottom component="div">
                                {listing.description}
                            </Typography>
                        </CardContent>
                        <Divider />
                        <List>
                            {listing.collection === "true"
                                ?
                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <LocationOnIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Collection"
                                            secondary="Coordinates saved to listing"/>
                                    </ListItemButton>
                                </ListItem>
                                : null}
                            {listing.delivery === "true"
                                ?
                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <LocalShippingIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`Shipping £${listing.shipping_cost}`}
                                            secondary={listing.shipping_countries}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                : null}
                        </List>
                        <CardActions disableSpacing>
                            <IconButton aria-label="add to favorites" onClick={() => handleDelete()}>
                                <DeleteIcon />
                                {error && <Alert severity="error">{error}</Alert>}
                            </IconButton>
                        </CardActions>
                    </Card>
                </div>
            ) : <ListingDetailSkeleton />}
        </div>
    );
}
export default ListingDetailSeller;
