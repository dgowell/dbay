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
import { sendListingToContacts, getMaximaContactAddress, getMaximaContactName, addContact, isContact, link } from "../minima";
import { checkAvailability, hasSufficientFunds } from '../minima/buyer-processes';
import { useNavigate } from "react-router";
import { Stack } from "@mui/system";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";
import ListingDetailSkeleton from "./ListingDetailSkeleton";
import PaymentError from "./PaymentError";
import Carousel from 'react-material-ui-carousel';
import PersonPinCircleOutlinedIcon from '@mui/icons-material/PersonPinCircleOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ForwardOutlinedIcon from '@mui/icons-material/ForwardOutlined';
import LoadingButton from "@mui/lab/LoadingButton";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import ImageIcon from '@mui/icons-material/Image';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';


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

  const [sent, setSent] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const [maxsoloError, setMaxsoloError] = useState('');
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
    getListingById(params.id).then(function (result) {
      setListing(result);

      setImages(result.image.split("(+_+)"))
      if (result.image.split("(+_+)").length > 1) {
        setNavButtonsVisible(true)
      }
      isContact(result.created_by_pk).then((res) => {
        if (res !== false) {
          setIsFriend(true);
        }
      }).catch((e) => console.error(e));
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
      getMaximaContactName().then((name) => {
        setBuyerName(name);
      }).catch((e) => console.error(e));
    }
  }, [listing]);

  async function handleAdd(address) {
    const { msg, status } = await addContact(address);
    if (status === "success") {
      setIsFriend(true);
    }
  }

  function handleMaxSoloLink() {
    if (!isFriend) {
      if (listing.seller_has_perm_address === 'true') {
        handleAdd(listing.seller_perm_address);
      } else {
        setMaxsoloError(`Seller doesn't have a permanent maxima address set`);
      }
    }
    link('maxsolo', function (res) {
      if (res.status === false) {
        if (res.error.includes('permission escalation')) {
          setMaxsoloError('Linking to MaxSolo requires that you have WRITE permissions set on dbay.');
        } else if (res.error.includes('not found')) {
          setMaxsoloError('MaxSolo is not installed on your device.');
        } else {
          setMaxsoloError(res.error);
        }
      } else if (res.status === true) {
        setMaxsoloError('');
        window.open(res.base, '_blank');
      }
    });
  }

  async function handleBuy() {
    //ensure user knows it's doing something
    setCheckingAvailability(true);
    setLoading(true);

    //reset listing in order to check the availability
    updateListing(listing.listing_id, { "status": "unchecked" })
      .catch((e) => console.error(`Error resetting listing status to unchecked: ${e}`));


    //check there is money to pay for the item first
    const hasFunds = await hasSufficientFunds(listing.price).catch(error => {
      navigate(`/info`, { state: { action: "error", main: "Insufficient Funds!", sub: "It looks like you don't have enough $M to purchase this item" } });
      setLoading(false);
    });
    console.log(`hasFunds: ${hasFunds}`);

    if (hasFunds) {
      let sellerIsContact = await isContact(listing.created_by_pk).catch(error => {
        console.log(`Error checking if seller is a contact: ${error}`);
      });
      let sellerAddress = '';
      if (sellerIsContact) {
        sellerAddress = listing.created_by_pk;
      } else if (listing.seller_has_perm_address) {
        sellerAddress = listing.seller_perm_address;
      }
      if (sellerAddress) {
        await checkAvailability({
          seller: sellerAddress,
          buyerPk: buyerAddress,
          listingId: listing.listing_id,
        }).then(
          result => {
            if (result === true) {
              navigate(`/listing/${listing.listing_id}/purchase`)
            } else {
              setError(result);
              navigate(`/info`, { state: { action: "error", main: '', sub: result } });
              console.log(`${result}`);
            }
          }
        )
          .catch(
            error => {
              if (error.message.includes('connect timed out')) {
                console.log(`Problem checking item availability ${error}`);
                navigate(`/info`, { state: { action: "error", main: 'Network timeout', sub: "couldnt reach seller, check your maxima connection and try again in a few minutes" } });
                setError(`Network timeout`);
              } else {
                console.log(`Problem checking item availability ${error}`);
                navigate(`/info`, { state: { action: "error", main: "There was a problem", sub: (error.message ? error.message : `There was a problem, please try again later.`) } });
                setError(`There was a problem`);
              }
            })
          .finally(() => {
            setCheckingAvailability(false);
            setLoading(false);
          });
      } else {
        setCheckingAvailability(false);
        setLoading(false);
        setError(`Insufficient Funds`);
      }
    }
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
                {images.map((image, i) => (
                  image === "" ? (
                    <Box sx={{ backgroundColor: '#c6c6c6', borderRadius: '5px', display: 'flex', justifyContent: 'center', alignContent: 'center', flexDirection: 'column', flexWrap: 'wrap', height: '100%' }}>
                      <ImageIcon />
                    </Box>
                  ) : (
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
                    />
                  )
                ))}
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
                <Typography gutterBottom component="div" mb="1.5rem" sx={{ whiteSpace: 'pre-wrap' }}>
                  {listing.description
                    ? listing.description
                    : "This item has no description"}
                </Typography>
              </CardContent>
              <Divider sx={{ marginTop: "30px", marginBottom: "20px" }} />
              <List>
                {listing.collection === "true"
                  ?
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <PersonPinCircleOutlinedIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Collection"
                      secondary={listing.location_description ? listing.location_description : ''}
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
                  <Tooltip title="Open MaxSolo" placement="top">
                    <Button
                      onClick={() => handleMaxSoloLink()}
                      aria-label="open maxsolo"
                      variant="outlined"
                    >
                      Open MaxSolo
                      {maxsoloError && <Alert mt={2} sx={{ marginTop: "5px", width: "100%" }} severity="error" variant="outlined">{maxsoloError}</Alert>}
                    </Button>
                  </Tooltip>
                </ListItem>
                {listing.created_by_name !== listing.sent_by_name &&
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <ForwardOutlinedIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary="Shared by" secondary={`@${listing.sent_by_name}`} />
                  </ListItem>
                }
              </List>

            </Card>
            <Snackbar open={sent} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
              <Alert onClose={handleClose} color="secondary" variant="filled" sx={{ width: '100%' }}>
                Item shared with contacts
              </Alert>
            </Snackbar>
            {(listing.status === "collection_rejected") && <Alert onClose={handleClose} color="warning" variant="filled" sx={{ width: '100%' }}>
              Collection rejected
            </Alert>}
            <Stack spacing={2} mt={4}>
              {listing.status === "completed"
                ? <Alert sx={{ boxShadow: 'none', border: '1px solid #bebebe'}}>Payment confirmed. The seller will deliver your item to the address you provided</Alert>
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
