import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import LoadingButton from '@mui/lab/LoadingButton';
import { getListingById } from '../database/listing';
import { useNavigate } from "react-router";
import { purchaseListing, collectListing } from '../minima/buyer-processes';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import BackButton from '../components/BackButton';
import PaymentError from '../components/PaymentError';
import BungalowIcon from "@mui/icons-material/Bungalow";
import Badge from '@mui/material/Badge';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import MapIcon from '@mui/icons-material/Map';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { updateListing } from '../database/listing';
import { sendPurchaseReceipt } from '../minima/buyer-processes';
import Alert from '@mui/material/Alert';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ListItemButton from "@mui/material/ListItemButton";
import InfoIcon from '@mui/icons-material/Info';

function ListingPurchase(props) {
  const [listing, setListing] = useState();
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [transmissionType, setTransmissionType] = useState('');
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (listing) {
      setTotal(listing.price);
      if (listing.collection === "true") {
        setTransmissionType('collection');
      } else {
        setTotal(parseInt(listing.price) + parseInt(listing.shipping_cost));
        setTransmissionType('delivery');
      }
    }
  }, [listing]);

  const handleChange = (event) => {
    setTransmissionType(event.target.value);
    if (event.target.value === 'delivery') {
      setTotal(parseInt(listing.price) + parseInt(listing.shipping_cost));
    } else {
      setTotal(listing.price);
    }
  };


  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
    });
  }, [params.id]);


  function handleCollection() {
    setLoading(true);
    setError(false);

    collectListing({
      listingId: listing.listing_id,
      seller: listing.created_by_pk,
      message: message !== '' ? message : phone,
      transmissionType: transmissionType,
    }).then(
      () => {
        console.log("successfully sent collection request")
        setLoading(false);
        navigate(`/arr-col/${listing.listing_id}`);
        //setTimeout(navigate('/info',{state:{sub:"The seller has been notified and will be in contact to arrange the collection. "}}), 1000);
      },
      error => setError(error)
    )
  }

  function handleSend() {
    setLoading(true);
    setError(false);
    if(process.env.REACT_APP_MODE==="mainnet"){
      updateListing(listing.listing_id, 'status', 'purchased').catch((e) => console.error(e));
      updateListing(listing.listing_id, 'transmission_type', transmissionType).catch((e)=>console.error(e));
      sendPurchaseReceipt({
        message:message !== '' ? message : phone,
        listingId: listing.listing_id,
        coinId:"0x1asd234", seller: listing.created_by_pk,
        transmissionType: transmissionType })
      navigate('/info',{state:{main:"Payment Successfull!",sub:`@${listing.created_by_name} has received your order and will post your item to the address provided. `}});
    }else{
      purchaseListing({
        listingId: listing.listing_id,
        seller: listing.created_by_pk,
        walletAddress: listing.wallet_address,
        purchaseCode: listing.purchase_code,
        message: message !== '' ? message : phone,
        amount: listing.price,
        transmissionType: transmissionType,
      }).then(
        () => navigate('/info',{state:{main:"Payment Successfull!",sub:`@${listing.created_by_name} has received your order and will post your item to the address provided. `}}),
        error => setError(error)
      )
    }
  }
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  if (listing) {

    const { latitude, longitude } = JSON.parse(listing.location);

    if (!error) {
      return (
        <Box sx={{
          pt: 2,
          pb:10,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <Typography sx={{fontSize:'24px'}}  gutterBottom>
          Shipping
        </Typography>
          <List >
            <ListItem>
              <Alert sx={{width:"100%"}} severity='success' variant="outlined">Item is Available</Alert>
            </ListItem>
            <ListItem>
            <Alert sx={{width:"100%"}} severity='success' variant="outlined">You have sufficient funds</Alert>
            </ListItem>
            <ListItem>
              <spna style={{fontWeight:700,fontSize:"20px"}}>Choose preferred option</spna>
              {/* <ListItemAvatar>
                {listing.image ? (
                  <Avatar alt={listing.title} src={listing.image.split("(+_+)")[0]} style={{ borderRadius: "5px" }} />
                ) : (
                  <Badge anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }} color="secondary" variant="dot" invisible={!(listing.notification === 'true')}>
                    <Avatar>
                      <BungalowIcon />
                    </Avatar>
                  </Badge>
                )}
              </ListItemAvatar>
              <ListItemText primary={`M$${listing.price}`} secondary={listing.title} /> */}
            </ListItem>
          </List>
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            p: 2,
            gap: 3,
          }}>
            {listing.delivery === "true" && listing.collection === "true" ?
              <FormControl>
                {/* <FormLabel id="receive-item-label">How will you receive the item?</FormLabel> */}
                <RadioGroup
                  aria-labelledby="receive-item-label"
                  name="receieve-item-group"
                  value={transmissionType}
                  onChange={handleChange}
                >
                  <FormControlLabel value="collection" control={<Radio />} label="Collection" />
                  <FormControlLabel value="delivery" control={<Radio  />} label={`Delivery - M$${listing.shipping_cost}`} />
                </RadioGroup>
              </FormControl>
              : null}
            {transmissionType === 'collection'
              ? <FormControl>
                  <List>
                    <ListItem >
                      {/* <ListItemIcon sx={{fontSize:"20px"}}>
                        <LocationOnOutlinedIcon />
                      </ListItemIcon> */}
                      <ListItemButton className={"custom-loading"} component="a" href={`https://www.google.com/maps/@${latitude},${longitude},17z`} target="_blank">
                      <ListItemText   primaryTypographyProps={{fontSize: 20,textAlign:"center"}}   primary="See location" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem >
                      <ListItemIcon sx={{fontSize:"16px"}}>
                        <InfoIcon />
                      </ListItemIcon>
                      <ListItemText primaryTypographyProps={{fontSize: 16}}  primary="This is an approximation. Seller will provide exact location privately. " />
                    </ListItem>
                  </List>
                {/* <Typography>Item is available for collection {listing.delivery ? '' : 'only'}</Typography> */}
                {/* <Button variant="outlined" href={`https://www.google.com/maps/@${latitude},${longitude},17z`} target="_blank" startIcon={<LocationOnOutlinedIcon />}>See location</Button> */}

                {/* <FormLabel>Share your phone number with the seller to arrange collection:</FormLabel>
                <PhoneInput
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={setPhone} /> */}
              </FormControl>
              : null}
              {listing.collection === "false" ? 
              <>
                <Typography variant="h6">The seller will deliver the item to you</Typography> 
                <Typography>Delivery Cost: M${listing.shipping_cost}</Typography> 
              </>
              : null}
            {transmissionType === 'delivery'
              ? <FormControl sx={{ gap: 1 }}>
                {/* <FormLabel>Enter your address in this box:</FormLabel> */}
                <TextField
                  id="outlined-multiline-static"
                  label="Name and address here"
                  multiline
                  rows={4}
                  value={message}
                  onChange={handleMessageChange}
                  sx={{ width: '100%' }}
                />
              </FormControl>
              : null}
          </Box>
          <Box
            m={1}
            gap={3}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            {transmissionType === 'delivery' &&
            <>
            {/* <Typography variant="h6">Total: M${total}</Typography> */}
              <LoadingButton className={"custom-loading"} style={{color:"#2C2C2C"}} disabled={error} loading={loading} onClick={handleSend} variant="contained">
                Pay & Continue
              </LoadingButton>
            </>}
            {transmissionType === 'collection' &&
              <>
                <LoadingButton className={"custom-loading"} style={{color:"#2C2C2C"}} disabled={error} loading={loading} onClick={handleCollection} variant="contained">
                  Continue
                </LoadingButton>
              </>}
          </Box>
        </Box>
      );
    } else {
      return (
        <PaymentError error={error} />
      );
    }
  } else {
    return null;
  }
}
export default ListingPurchase;