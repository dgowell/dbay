import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById } from "../database/listing";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import ShareIcon from "@mui/icons-material/Share";
import Card from "@mui/material/Card";
import TestImage from "../assets/images/test.jpg";
import Tooltip from "@mui/material/Tooltip";
import { sendListingToContacts } from "../maxima";
import BackButton from "./BackButton";
import ListingDetailSkeleton from './ListingDetailSkeleton';

function ListingDetailSeller() {
    const [listing, setListing] = useState();
    const params = useParams();

    useEffect(() => {
        getListingById(params.id).then(function (result) {
            setListing(result);
        });
    }, [params.id]);

    function handleShare() {
        sendListingToContacts(listing.listing_id);
        //TODO:show to user that the listing has been shared
    }

    return (
        <div>
            {listing ? (
                <div>
                    <Card sx={{ maxWidth: 345, marginTop: 2, marginBottom: 8 }}>
                        <CardHeader
                            avatar={
                                <BackButton route={-1} />
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
                        <CardMedia
                            component="img"
                            width="100%"
                            image={TestImage}
                            alt="Test Image"
                        />
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
                    </Card>
                </div>
            ) : <ListingDetailSkeleton/>}
        </div>
    );
}
export default ListingDetailSeller;
