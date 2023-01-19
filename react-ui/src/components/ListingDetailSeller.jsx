import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById, deleteListing } from "../database/listing";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import ShareIcon from "@mui/icons-material/Share";
import Card from "@mui/material/Card";
import TestImage from "../assets/images/test.jpg";
import Tooltip from "@mui/material/Tooltip";
import { sendListingToContacts } from "../minima";
import BackButton from "./BackButton";
import ListingDetailSkeleton from './ListingDetailSkeleton';
import Carousel from 'react-material-ui-carousel'
import DeleteIcon from '@mui/icons-material/Delete';
import CardActions from "@mui/material/CardActions";
import Alert from '@mui/material/Alert';

function ListingDetailSeller() {
    const [listing, setListing] = useState();
    const [images,setImages]=useState([]);
    const [deleted, setDeleted] = useState(false);
    const [error, setError] = useState(false);
    const params = useParams();

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
        return (
            <Typography>Item has been deleted</Typography>
        )
    }

    return (
        <div>
            {listing ? (
                <div>
                    <Card sx={{ maxWidth: 345, marginTop: 2, marginBottom: 8 }}>
                        <CardHeader
                            avatar={
                                <BackButton />
                            }
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
                                images.map( (image, i) =>(
                                <CardMedia
                                    component="img"
                                    width="100%"
                                    image={image}
                                    alt="Test Image"
                                />) )
                            }
                         </Carousel>

                        <CardContent>
                            <Typography gutterBottom variant="h4" component="div">
                                £{listing.price}
                            </Typography>
                            <Typography gutterBottom variant="h6" component="div">
                                {listing.name}
                            </Typography>
                            <Typography gutterBottom component="div">
                                {listing.description
                                    ? listing.description
                                    : "This is a fake description while there is no description available. The item for sale is perfect, you should definetly buy it right now before it is too late. In fact fuck it i'm gonna buy it."}
                            </Typography>
                        </CardContent>
                        <CardActions disableSpacing>
                            <IconButton aria-label="add to favorites" onClick={()=> handleDelete()}>
                                <DeleteIcon />
                                {error && <Alert severity="error">{error}</Alert>}
                            </IconButton>
                        </CardActions>
                    </Card>
                </div>
            ) : <ListingDetailSkeleton/>}
        </div>
    );
}
export default ListingDetailSeller;
