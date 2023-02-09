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
        setTimeout(navigate('/collection-success'), 1000);
      },
      error => setError(error)
    )
  }

  function handleSend() {
    setLoading(true);
    setError(false);

    purchaseListing({
      listingId: listing.listing_id,
      seller: listing.created_by_pk,
      walletAddress: listing.wallet_address,
      purchaseCode: listing.purchase_code,
      message: message !== '' ? message : phone,
      amount: listing.price,
      transmissionType: transmissionType,
    }).then(
      () => navigate('/payment-success'),
      error => setError(error)
    )
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
          <Box mb={4} >
            <BackButton />
          </Box>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Item is available" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="You have sufficient funds" />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
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
              <ListItemText primary={`M$${listing.price}`} secondary={listing.title} />
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
                <FormLabel id="receive-item-label">How will you receive the item?</FormLabel>
                <RadioGroup
                  aria-labelledby="receive-item-label"
                  name="receieve-item-group"
                  value={transmissionType}
                  onChange={handleChange}
                >
                  <FormControlLabel value="collection" control={<Radio />} label="Collection" />
                  <FormControlLabel value="delivery" control={<Radio />} label={`Delivery - M$${listing.shipping_cost}`} />
                </RadioGroup>
              </FormControl>
              : null}
            {transmissionType === 'collection'
              ? <FormControl sx={{ gap: 3 }}>

                <Typography>Item is available for collection {listing.delivery ? '' : 'only'}</Typography>
                <Button variant="outlined" href={`https://www.google.com/maps/@${latitude},${longitude},17z`} target="_blank" startIcon={<MapIcon />}>Show me location</Button>

                <FormLabel>Share your phone number with the seller to arrange collection:</FormLabel>
                <PhoneInput
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={setPhone} />
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
                <FormLabel>Enter your address in this box:</FormLabel>
                <TextField
                  id="outlined-multiline-static"
                  label="Delivery address"
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
            <><Typography variant="h6">Total: M${total}</Typography>
              <LoadingButton disabled={error} loading={loading} onClick={handleSend} variant="contained">
                Pay & Confirm
              </LoadingButton>
            </>}
            {transmissionType === 'collection' &&
              <>
                <LoadingButton disabled={error} loading={loading} onClick={handleCollection} variant="contained">
                  Confirm
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