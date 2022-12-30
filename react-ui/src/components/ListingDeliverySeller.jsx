import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById, updateListing } from "../database/listing";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import BackButton from "./BackButton";
import ListingDetailSkeleton from './ListingDetailSkeleton';

function ListingDeliverySeller() {
    const [listing, setListing] = useState();
    const params = useParams();

    useEffect(() => {
        getListingById(params.id).then(function (result) {
            setListing(result);
        });
    }, [params.id]);

    function handleItemSent() {
        updateListing(listing.listing_id, "status", "completed")
            .then(console.log('updated listing as completed!'))
            .catch((e)=>console.error(`Could not update listing as completed: ${e}`));
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
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h4" component="div">
                                You've successfully received payment from {listing.buyer_name}
                            </Typography>
                            <Typography gutterBottom variant="h6" component="div">
                                Please deliver item to:
                            </Typography>
                            <Typography gutterBottom component="div">
                                {listing.buyer_message
                                    ? listing.buyer_message
                                    : "No details supplied, please contact buyer!"}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Button onClick={handleItemSent}>Item Sent</Button>
                </div>
            ) : <ListingDetailSkeleton />}
        </div>
    );
}
export default ListingDeliverySeller;
