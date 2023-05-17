import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById, updateListing } from "../database/listing";
import CircularProgress from "@mui/material/CircularProgress";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import ShareIcon from "@mui/icons-material/Share";
import Card from "@mui/material/Card";
import Tooltip from "@mui/material/Tooltip";
import { getHost } from "../database/settings";
import { sendListingToContacts, getMaximaContactAddress } from "../minima";
import { checkAvailability, hasSufficientFunds } from '../minima/buyer-processes';
import { useNavigate } from "react-router";
import { Stack } from "@mui/system";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";
import ListingDetailSkeleton from "./ListingDetailSkeleton";
import PaymentError from "./PaymentError";
import Carousel from 'react-material-ui-carousel';
import haversine from 'haversine-distance';
import PersonPinCircleOutlinedIcon from '@mui/icons-material/PersonPinCircleOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ForwardOutlinedIcon from '@mui/icons-material/ForwardOutlined';
import LoadingButton from "@mui/lab/LoadingButton";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} {...props} />;
});

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
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: ''
  })
  const [navButtonsVisible, setNavButtonsVisible] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSent(false);
  };

  function handleShare() {
    sendListingToContacts(listing.listing_id)
      .then(() => {
        console.log('sent to all contacts!');
        setSent(true);
      }).catch((e) => console.error(e));
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    function showPosition(position) {
      setCoordinates({
        latitude: (position.coords.latitude.toFixed(3)),
        longitude: (position.coords.longitude.toFixed(3))
      });
    };
  }, []);


  useEffect(() => {
    // check there is a value for the location
    if ((coordinates.latitude !== '') && listing && listing.location) {
      const location = JSON.parse(listing.location);
      console.log(`Listing Location: ${location}, My location: ${coordinates}, havsine distance: ${haversine(coordinates, location)}`);
      window.MDS.log(`Listing Location: ${JSON.stringify(location)}, My location: ${JSON.stringify(coordinates)}, havsine distance: ${haversine(coordinates, location)}`);
      var dist = (haversine(coordinates, location) / 1000).toFixed(1);
      setDistance(isNaN(dist) ? 0 : dist);
    }
  }, [coordinates, listing])

  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
      console.log(result.description);
      setImages(result.image.split("(+_+)"))
      if (result.image.split("(+_+)").length > 1) {
        setNavButtonsVisible(true)
      }
    }).catch((e) => console.error(e));
  }, [params.id]);

  useEffect(() => {
    getMaximaContactAddress().then((address) => {
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
      if (process.env.REACT_APP_MODE !== "testvalue") {
        navigate(`/info`, { state: { action: "error", main: "Insufficient Funds!", sub: "It looks like you don't have enough $M to purchase this item" } });
        // setError('Insufficient Funds');
        setLoading(false);
      }
      console.log(`Insufficient funds: ${error}`);
      return false;
    });
    console.log("hasFunds",hasFunds);

    if (hasFunds || (process.env.REACT_APP_MODE === "testvalue")) {
      const isAvailable = await checkAvailability({
        seller: listing.created_by_pk,
        buyerPk: buyerAddress,
        listingId: listing.listing_id,
      }).catch(error => {
        console.log(`Item is not available ${error}`);
        navigate(`/info`, { state: { action: "error", main: (error ? "Not available" : "Seller not available"), sub: (error ? "It looks like someone has recently bought this item or the seller has removed it from sale" : `Seller is not a contact. Try contacting @${listing.sent_by_name} to see if they can put you in touch.`) } });
        setError(`Not available`);
        setLoading(false);
      });

      if (isAvailable) {
        //take the user to pay for the item
        navigate(`/listing/${listing.listing_id}/purchase`)
      }
    }//close if
  }

  checkingAvailability && <AvailabilityCheckScreen />

  return (
    error
      ? <PaymentError error={error} />
      : <div>
        {listing && buyerAddress && buyerName ? (
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
                      alt="Test Image"
                    />))
                }
              </Carousel>
              <CardContent sx={{ marginTop: 2, padding: 0 }} >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb="1rem">
                  <Typography gutterBottom variant="h5" component="div" mb="0">
                    $M{listing.price}
                  </Typography>
                  <Tooltip title="Share to all your contacts" placement="top">
                    <IconButton
                      onClick={() => handleShare()}
                      aria-label="share"
                    >
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Typography gutterBottom variant="h6" component="div">
                  {listing.title}
                </Typography>
                <Typography gutterBottom component="div" mb="1.5rem">
                  {listing.description
                    ? listing.description
                    : "This item has no description"}
                </Typography>
              </CardContent>
              <List>
                {listing.collection === "true"
                  ?
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <PersonPinCircleOutlinedIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Collection"
                      secondary={distance
                        ? `${distance}km away ${listing.location_description ? ', ' + listing.location_description : ''}`
                        : listing.location_description ? listing.location_description : ''
                      }
                    />
                  </ListItem>
                  : null}
                {listing.delivery === "true"
                  ?
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <LocalShippingOutlinedIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary="Shipping" secondary={`$M${listing.shipping_cost}`} />
                  </ListItem>
                  : null}
                <ListItem disablePadding>
                  <ListItemIcon>
                    <StorefrontOutlinedIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText primary="Seller" secondary={`@${listing.created_by_name}`} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <ForwardOutlinedIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText primary="Shared by" secondary={`@${listing.sent_by_name}`} />
                </ListItem>
              </List>


            </Card>
            <Snackbar open={sent} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
              <Alert onClose={handleClose} color="secondary" variant="filled" sx={{ width: '100%' }}>
                Item shared with contacts
              </Alert>
            </Snackbar>
            <Stack spacing={2} mt={4}>
              {listing.status === "purchased"
                ? null
                : <LoadingButton
                  className={"custom-loading"}
                  color="secondary"
                  variant="contained"
                  onClick={handleBuy}
                  loading={loading}
                >
                  I WANT IT
                </LoadingButton>}
            </Stack>
          </div>
        ) : <ListingDetailSkeleton />
        }
      </div >
  );
}
export default ListingDetail;
