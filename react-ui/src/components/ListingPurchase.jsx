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
import PaymentError from '../components/PaymentError';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import haversine from 'haversine-distance';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import 'react-phone-number-input/style.css';
import { updateListing } from '../database/listing';
import { sendPurchaseReceipt } from '../minima/buyer-processes';
import Alert from '@mui/material/Alert';
import InfoIcon from '@mui/icons-material/Info';
import { Divider } from '@mui/material';

function ListingPurchase(props) {
  const [listing, setListing] = useState();
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(0);
  const [total, setTotal] = useState(0);
  const [transmissionType, setTransmissionType] = useState('');
  const params = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    if ((coordinates.latitude !== '') && listing) {
      const location = JSON.parse(listing.location);
      console.log(`Listing Location: ${location}, My location: ${coordinates}, havsine distance: ${haversine(coordinates, location)}`)
      window.MDS.log(`Listing Location: ${JSON.stringify(location)}, My location: ${JSON.stringify(coordinates)}, havsine distance: ${haversine(coordinates, location)}`)
      setDistance((haversine(coordinates, location) / 1000).toFixed(1));
    }
  }, [coordinates, listing])

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
          pt: 4,
          pb:10,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <Typography variant="h1" sx={{fontSize:'24px', textAlign:'center'}}  gutterBottom>
          Shipping
        </Typography>
          <List >
            <ListItem>
              <Alert sx={{width:"100%"}} severity='success' variant="outlined">Item is available</Alert>
            </ListItem>
            <ListItem>
            <Alert sx={{width:"100%"}} severity='success' variant="outlined">You have sufficient funds</Alert>
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
                <FormLabel>Choose preferred option</FormLabel>
                <RadioGroup
                  aria-labelledby="receive-item-label"
                  name="receieve-item-group"
                  value={transmissionType}
                  onChange={handleChange}
                >
                  <FormControlLabel sx={{ justifyContent: 'space-between', marginLeft: 0 }} labelPlacement="start" value="collection" control={<Radio />} label="Collection" />
                  <Typography variant="caption" color="grey" mt='-12px'>{distance ? `${distance}km` : null}</Typography>
                  {transmissionType === 'collection'
                    ? <Box p={2} >
                      <Button variant="outlined" color="secondary" className={"custom-loading"} href={`https://www.google.com/maps/@${latitude},${longitude},17z`} target="_blank">See location</Button>
                      <List>
                        <ListItem >
                          <ListItemIcon sx={{ fontSize: "16px", minWidth: "45px" }}>
                            <InfoIcon />
                          </ListItemIcon>
                          <ListItemText primaryTypographyProps={{ fontSize: 13 }} primary="This is an approximation. Seller will provide exact location privately. " />
                        </ListItem>
                      </List>
                    </Box>
                    : null}
                    <Divider />
                  <FormControlLabel sx={{ justifyContent: 'space-between', marginLeft: 0}} labelPlacement="start" value="delivery" control={<Radio  />} label={`Delivery`} />
                  <Typography variant="caption" color="grey" mt='-12px'>M${listing.shipping_cost}</Typography>
                  {listing.collection === "false" ?
                    <>
                      <Typography variant="h6">The seller will deliver the item to you</Typography>
                      <Typography>Delivery Cost: M${listing.shipping_cost}</Typography>
                    </>
                    : null}
                </RadioGroup>
              </FormControl>
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
              <LoadingButton className={"custom-loading"} disabled={error} color="secondary" loading={loading} onClick={handleSend} variant="contained">
                Pay & Continue
              </LoadingButton>
            </>}
            {transmissionType === 'collection' &&
              <>
                <LoadingButton className={"custom-loading"} color="secondary" disabled={error} loading={loading} onClick={handleCollection} variant="contained">
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