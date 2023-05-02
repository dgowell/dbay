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
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import BungalowIcon from "@mui/icons-material/Bungalow";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

function DeliveryConfirmation({
  total,
  listing,
  transmissionType,
  message
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function handlePay() {
    setLoading(true);
    setError(false);

    if (process.env.REACT_APP_MODE === "testvalue") {
      //update local db
      updateListing(listing.listing_id, 'status', 'in progress').catch((e) => console.error(e));
      updateListing(listing.listing_id, 'transmission_type', transmissionType).catch((e) => console.error(e));

      //update the seller
      sendPurchaseReceipt({
        message: message,
        listingId: listing.listing_id,
        coinId: "0x1asd234", seller: listing.created_by_pk,
        transmissionType: transmissionType
      })

      //navigate user to confirmation page
      navigate('/info', { state: { main: "Payment Successfull!", sub: `@${listing.created_by_name} has received your order and will post your item to the address provided. ` } });
    } else {

      purchaseListing({
        listingId: listing.listing_id,
        seller: listing.created_by_pk,
        walletAddress: listing.wallet_address,
        purchaseCode: listing.purchase_code,
        message: message,
        amount: (parseInt(listing.price) + parseInt(listing.shipping_cost)),
        transmissionType: transmissionType,
      }).then(
        () => navigate('/info', { state: { main: "Payment Successfull!", sub: `@${listing.created_by_name} has received your order and will post your item to the address provided. ` } }),
        error => navigate('/info', { state: { action: "error", main: "Payment Failed!", sub: `This has happened either because dbay has not been given WRITE permissions, or your wallet is password protected. Or both.` } })
      ).catch((e) => {
        console.log("error", e);
      })
    }
  }
  return (
    <Box sx={{
      width: '100%',
      height: 'calc(100vh - 130px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: 'space-between',
        p: 2,
        gap: 3,
      }}>
        <Typography variant="h1" sx={{ fontSize: '24px', textAlign: 'center', pt: 4 }} gutterBottom>
          Confirm purchase
        </Typography>
        <ListItem disablePadding>
          <ListItemAvatar>
            {listing?.image ? (
              <Avatar alt={listing.title} src={listing.image.split("(+_+)")[0]} style={{ borderRadius: "5px" }} />
            ) : (
              <Avatar>
                <BungalowIcon />
              </Avatar>
            )}
          </ListItemAvatar>
          <ListItemText
            primary={listing.title}
            secondary={listing.price ? `$M${listing.price}` : null}
          />
        </ListItem >
        <Divider />
        <Typography variant="h6">Delivery address</Typography>
        <Typography gutterBottom sx={{ textAlign: "left" }} component="address">{message.split("\n").map((i, key) => {
          return <span style={{display: 'block'}} key={key}>{i}</span>;
        })}</Typography>
      </Box>

      <Box sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: 'space-between',
        p: 2,
        gap: 3,
      }}>
        <TableContainer >
          <Table sx={{}} size="small" aria-label="a dense table">
            <TableBody>
                <TableRow key="1" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">Item</TableCell>
                  <TableCell align="right">M${listing.price}</TableCell>
                </TableRow>
              <TableRow key="2" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">Delivery</TableCell>
                <TableCell align="right">M${listing.shipping_cost}</TableCell>
              </TableRow>
              <TableRow key="3" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row"><b>Total</b></TableCell>
                <TableCell align="right"><b>M${total}</b></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <LoadingButton xs={{ flex: 1 }} className={"custom-loading"} disabled={error} color="secondary" loading={loading} onClick={handlePay} variant="contained">Pay Now</LoadingButton>
      </Box>
    </Box>
  );
}

function ListingPurchase(props) {
  const [listing, setListing] = useState();
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(0);
  const [total, setTotal] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
      message: message,
      transmissionType: transmissionType,
    }).then(
      () => {
        console.log("successfully sent collection request")
        setLoading(false);
        navigate(`/arr-col/${listing.listing_id}`);
      },
      error => setError(error)
    )
  }

  /*
  * Take user to confirmation page before they confirm to pay for the item
  */
  function handleDelivery() {
    setShowConfirmation(true);
  }
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  if (listing) {

    const { latitude, longitude } = JSON.parse(listing.location);

    if (!error) {
      if (showConfirmation) {
        return <DeliveryConfirmation
          total={total}
          listing={listing}
          transmissionType={transmissionType}
          message={message}
        />
      }
      return (
        <Box sx={{
          pt: 4,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignContent: 'space-between',
        }}>
          <Typography variant="h1" sx={{ fontSize: '24px', textAlign: 'center' }} gutterBottom>
            Shipping
          </Typography>
          <List >
            <ListItem>
              <Alert sx={{ width: "100%" }} severity='success' variant="outlined">Item is available</Alert>
            </ListItem>
            <ListItem>
              <Alert sx={{ width: "100%" }} severity='success' variant="outlined">You have sufficient funds</Alert>
            </ListItem>
          </List>
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            p: 2,
            gap: 3,
          }}>

            <FormControl>
              {listing.delivery === "true" && listing.collection === "true" ? <FormLabel>Choose preferred option</FormLabel> : null}
              <RadioGroup
                aria-labelledby="receive-item-label"
                name="receieve-item-group"
                value={transmissionType}
                onChange={handleChange}
              >
                {listing.collection === "true" && <>  <FormControlLabel sx={{ justifyContent: 'space-between', marginLeft: 0 }} labelPlacement="start" value="collection" control={<Radio />} label="Collection" />
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
                    : null}</>}
                <Divider />
                {listing.delivery === "true" &&
                  <><FormControlLabel sx={{ justifyContent: 'space-between', marginLeft: 0 }} labelPlacement="start" value="delivery" control={<Radio />} label={`Delivery`} />
                    <Typography variant="caption" color="grey" mt='-12px'>M${listing.shipping_cost}</Typography>
                    {listing.collection === "false" ?
                      <>
                        <Typography variant="h6">The seller will deliver the item to you</Typography>
                        <Typography>Delivery Cost: M${listing.shipping_cost}</Typography>
                      </>
                      : null}</>}
              </RadioGroup>
            </FormControl>

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
                <LoadingButton className={"custom-loading"} disabled={error} color="secondary" loading={loading} onClick={handleDelivery} variant="contained">
                  Continue
                </LoadingButton>
              </>}
            {transmissionType === 'collection' &&
              <>
                <LoadingButton className={"custom-loading"} color="secondary" disabled={error} loading={loading} onClick={handleCollection} variant="contained">
                  Confirm Collection
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