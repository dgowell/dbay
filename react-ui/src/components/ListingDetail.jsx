import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById, updateListing } from "../database/listing";
import CardHeader from "@mui/material/CardHeader";
import CircularProgress from "@mui/material/CircularProgress";
import LoadingButton from "@mui/lab/LoadingButton";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import ShareIcon from "@mui/icons-material/Share";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { getHost } from "../database/settings";
import { sendListingToContacts, getMaximaContactAddress } from "../minima";
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
import ForwardOutlinedIcon from "@mui/icons-material/ForwardOutlined";
import SendIcon from "@mui/icons-material/Send";
import PaymentIcon from "@mui/icons-material/Payment";
import Box from "@mui/material/Box";
import BackButton from "./BackButton";
import ListingDetailSkeleton from "./ListingDetailSkeleton";
import PaymentError from "./PaymentError";
import { useErrorHandler } from 'react-error-boundary'
import Carousel from 'react-material-ui-carousel';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import haversine from 'haversine-distance';
import Alert from '@mui/material/Alert';

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
  const [alert, setAlert] = useState(false);
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
        latitude: (position.coords.latitude.toFixed(3)),
        longitude: (position.coords.longitude.toFixed(3))
      });
      console.log(JSON.stringify(coordinates));
    };
  }, []);


  useEffect(() => {
    if ((coordinates.latitude !== '') && listing) {
      const location = JSON.parse(listing.location);
      console.log(`Listing Location: ${location}, My location: ${coordinates}, havsine distance: ${haversine(coordinates, location)}`)
      window.MDS.log(`Listing Location: ${JSON.stringify(location)}, My location: ${JSON.stringify(coordinates)}, havsine distance: ${haversine(coordinates, location)}`)
      setDistance((haversine(coordinates, location) / 1000).toFixed(1));
    }
  }, [coordinates, listing])

  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
      console.log(result.description);
      setImages(result.image.split("(+_+)"))
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
      if(process.env.REACT_APP_MODE!=="mainnet"){
        setError('Insufficient Funds');
        setLoading(false);
      }
      console.log(`Insufficient funds: ${error}`);
      return true;
    });
    if (hasFunds || (process.env.REACT_APP_MODE==="mainnet")) {
      const isAvailable = await checkAvailability({
        seller: listing.created_by_pk,
        buyerPk: buyerAddress,
        listingId: listing.listing_id,
      }).catch(error => {
        console.log(`Item is not available ${error}`);
        navigate(`/info`,{state:{action:"error",main:"Not available",sub:"It looks like someone has recently bought this item or the seller has removed it from sale"}});
        setError(`Not available`);
        setLoading(false);
      });

      if (isAvailable) {
        //take the user to pay for the item
        navigate(`/listing/${listing.listing_id}/purchase`)
      }
    }
  }

async  function handleShare() {
   await sendListingToContacts(listing.listing_id);
  setAlert(true);
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
            <Card sx={{ maxWidth: '100%', marginTop: 2,border: "none", boxShadow: "none"  }}>
              <CardHeader
                //  title="Listing Detail"
                // avatar={
                //   <BackButton />
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
              <CardContent sx={{padding:0}} >
                <Typography gutterBottom variant="h4" component="div">
                  $M{listing.price}
                </Typography>
                <Typography gutterBottom variant="h6" component="div">
                  {listing.title}
                </Typography>
                <Typography gutterBottom component="div">
                  {listing.description
                    ?  <pre style={{ fontFamily: 'inherit' }}>{listing.description}</pre>
                    : "This is a temporary description."}
                </Typography>
              </CardContent>
              <Divider />
              <List>
                {listing.collection === "true"
                  ?
                  <ListItem sx={{mb:2}} disablePadding>
                    <span style={{fontWeight: 400,fontSize: "20px",color:"#2C2C2C"}}>Collection</span> <span style={{marginLeft:"55%",color:"#888787"}}>{distance ? `${distance} km` : null}</span>
                  </ListItem>
                  : null}
                {listing.delivery === "true"
                  ?
                  <ListItem sx={{mb:2}} disablePadding>
                    <span style={{fontWeight: 400,fontSize: "20px",color:"#2C2C2C"}}>Shipping</span> <span style={{marginLeft:"60%",color:"#888787"}}>{`$M${listing.shipping_cost}`}</span>
                  </ListItem>
                  : null}
                <Divider />
                <ListItem sx={{mt:2}} disablePadding>
                <span style={{fontWeight: 400,fontSize: "20px",color:"#2C2C2C"}}>Vendor</span> <span style={{marginLeft:"60%",color:"#888787"}}>{`@${listing.created_by_name}`}</span>
                </ListItem>
              </List>
            </Card>
           {alert && <Alert sx={{width:"100%"}} severity={'success'} variant="outlined">{"Success fully shared with contacts!"}</Alert>}
            <Stack spacing={2} mt={4} mb={8}>
              {listing.status === "purchased"
                ? null
                : <Button
                    className={"custom-loading"}
                    style={{color:"#2C2C2C"}}
                  variant="contained"
                  onClick={handleBuy}
                >
                 I WANT IT
                </Button>}
            </Stack>
          </div>
        ) : <ListingDetailSkeleton />}
      </div>
  );
}
export default ListingDetail;
