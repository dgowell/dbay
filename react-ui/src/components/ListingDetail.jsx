import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById } from "../database/listing";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import ShareIcon from "@mui/icons-material/Share";
import Card from "@mui/material/Card";
import TestImage from "../assets/images/test.jpg";
import Button from "@mui/material/Button";


function ListingDetail() {
  const params = useParams();
  const [listing, setListing] = React.useState();

  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
    });
  }, [params.id]);

  return (
    <div>
      {listing ? (
        <Card sx={{ maxWidth: 345, marginTop: 2 }}>
          <CardMedia
            component="img"
            width="100%"
            image={TestImage}
            alt="green iguana"
          />
          <CardContent>
            <Typography gutterBottom variant="h4" component="div">
              £{listing.price}
            </Typography>
            <Typography gutterBottom variant="h6" component="div">
              {listing.name}
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
            <Button size="small">Buy Now</Button>
            <Button size="small">Contact Seller</Button>
            <IconButton aria-label="share">
              <ShareIcon />
            </IconButton>
          </CardActions>
        </Card>
      ) : null}
    </div>
  );
}
export default ListingDetail;
