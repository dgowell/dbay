import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById, updateListing, removeListing } from "../database/listing";
import CardHeader from "@mui/material/CardHeader";
import CircularProgress from "@mui/material/CircularProgress";
import LoadingButton from "@mui/lab/LoadingButton";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import ShareIcon from "@mui/icons-material/Share";
import Card from "@mui/material/Card";
import TestImage from "../assets/images/test.webp";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { getHost } from "../database/settings";
import { sendListingToContacts, getPublicKey } from "../minima";
import { checkAvailability, hasSufficientFunds } from '../minima/buyer-processes';
import { useNavigate } from "react-router";
import Divider from "@mui/material/Divider";
import { Stack } from "@mui/system";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ForwardIcon from "@mui/icons-material/Forward";
import SendIcon from "@mui/icons-material/Send";
import PaymentIcon from "@mui/icons-material/Payment";
import Box from "@mui/material/Box";
import BackButton from "./BackButton";
import ListingDetailSkeleton from "./ListingDetailSkeleton";
import PaymentError from "./PaymentError";
import { ErrorBoundary, useErrorHandler } from 'react-error-boundary'
import Carousel from 'react-material-ui-carousel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import haversine from 'haversine-distance';

function AvailabilityCheckScreen() {
  return (
    <Box
      sx={{
        mt: 4,
        gap: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        verticalAlign: "middle"
      }}
    >Checking availability
      <CircularProgress />
    </Box>
  );
}

function ListingDetail() {
  const [listing, setListing] = useState();
  const [buyerAddress, setBuyerAddress] = useState();
  const [buyerName, setBuyerName] = useState();
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [distance, setDistance] = useState(0);
  const navigate = useNavigate();
  const params = useParams();
  const handleError = useErrorHandler();
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: ''
  })

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    function showPosition(position) {
      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    };
  }, []);


  useEffect(() => {
    if ((coordinates.latitude !== '') && listing) {
      const location = JSON.parse(listing.location);
      setDistance(Math.round(haversine(coordinates, location)));
    }
  },[coordinates, listing])

  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
      setImages(result.image.split("(+_+)"))
    }).catch((e) => console.error(e));
  }, [params.id]);

  useEffect(() => {
    getPublicKey().then((address) => {
      setBuyerAddress(address);
    }).catch((e) => console.error(e))
  }, []);

  //get the host name and pk
  useEffect(() => {
    if (listing) {
      getHost().then((host) => {
        setBuyerName(host.name);
      }).catch((e) => console.error(e));
    }
  }, [listing]);

  async function handleBuy() {
    //ensure user knows it's doing something
    setCheckingAvailability(true);
    setLoading(true);

    //reset listing in order to check the availability
    updateListing(listing.listing_id, "status", "unchecked")
      .catch((e) => console.error(`Error resetting listing status to unchecked: ${e}`));


    //check there is money to pay for the item first
    const hasFunds = await hasSufficientFunds(listing.price).catch(error => {
      setError('Insufficient Funds');
      setLoading(false);
      console.log(`Insufficient funds: ${error}`);
    });

    if (hasFunds) {
      const isAvailable = await checkAvailability({
        seller: listing.created_by_pk,
        buyerPk: buyerAddress,
        listingId: listing.listing_id,
      }).catch(error => {
        console.log(`Item is not available ${error}`);
        setError(`Not available`);
        setLoading(false);
      });

      if (isAvailable) {
        //take the user to pay for the item
        navigate(`/listing/${listing.listing_id}/purchase`)
      }
    }
  }

  function handleShare() {
    sendListingToContacts(listing.listing_id);
    //TODO:show to user that the listing has been shared
  }

  function handleContact() {
    console.log('contact seller clicked!');
  }

  checkingAvailability && <AvailabilityCheckScreen />

  return (
    error
      ? <PaymentError error={error} />
      : <div>
        {listing && buyerAddress && buyerName ? (
          <div>
            <Card sx={{ maxWidth: '100%', marginTop: 2 }}>
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
                  £{listing.price}
                </Typography>
                <Typography gutterBottom variant="h6" component="div">
                  {listing.title}
                </Typography>
                <Typography gutterBottom component="div">
                  {listing.description
                    ? listing.description
                    : "This is a temporary description."}
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
                        secondary={distance ? `${distance} km from me` : null}
                      />
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
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <StorefrontIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Sold by: ${listing.created_by_name}`}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <ForwardIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Sent by: ${listing.sent_by_name}`}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Card>
            <Stack spacing={2} mt={4} mb={8}>
              {listing.status === "purchased"
                ? null
                : <Button
                  variant="contained"
                  onClick={handleBuy}
                  startIcon={<PaymentIcon />}
                >
                  I want it
                </Button>}
              <LoadingButton loading={loading} variant="outlined" onClick={handleContact} endIcon={<SendIcon />} >
                Contact Seller
              </LoadingButton>
            </Stack>
          </div>
        ) : <ListingDetailSkeleton />}
      </div>
  );
}
export default ListingDetail;
