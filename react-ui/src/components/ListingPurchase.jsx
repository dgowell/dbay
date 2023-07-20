import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import LoadingButton from '@mui/lab/LoadingButton';
import { getListingById, deleteListing } from '../database/listing';
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
import TableRow from '@mui/material/TableRow';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import useIsVaultLocked from '../hooks/useIsVaultLocked';

function DeliveryConfirmation({
  total,
  listing,
  transmissionType,
  message
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [psdError, setPsdError] = useState(false);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const vaultLocked = useIsVaultLocked();

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  function handlePassword(e) {
    setPassword(e.target.value);
  }

  async function handlePay() {
    setLoading(true);
    setError(false);
    setMsg("");

    purchaseListing({
      listingId: listing.listing_id,
      seller: listing.created_by_pk,
      walletAddress: listing.wallet_address,
      message: message,
      amount: parseInt(listing.price) + parseInt(listing.shipping_cost),
      transmissionType: transmissionType,
      password: password, // Pass the password here
    })
      .then(
        () => navigate('/info', { state: { main: "Payment Successfull!", sub: `@${listing.created_by_name} has received your order and will post your item to the address provided. ` } }),
        error => {
          if (error.message.includes("Incorrect password")) {
            setMsg("Incorrect password");
            setPsdError(true);
            setLoading(false);
            setError(false);
          } else {
            setError(error.message);
            setLoading(false);
            setMsg(error.message);
          }
        }
      )
      .catch((e) => {
        console.log("error", e);
      });

  }

  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: 'space-between',
        paddingLeft: 2,
        paddingRight: 2,
        gap: 3,
      }}>
        <h1>Confirm purchase</h1>

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
        <Typography variant='h6'>Delivery Address:</Typography>
        <Typography gutterBottom sx={{ textAlign: "left", wordBreak: "break-all" }} component="address">{message ? message.split("\n").map((i, key) => {
          return <span style={{ display: 'block' }} key={key}>{i}</span>;
        }) : <Alert severity="warning">No address provided</Alert>}</Typography>
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
        <span style={{ color: "red", padding: 0, margin: 0 }} >{msg}</span>
        {vaultLocked &&
          <FormControl variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Vault Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePassword}
              error={psdError}
              required={vaultLocked}
              helperText="Must enter vault password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Vault Password"
            />
          </FormControl>
        }
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
  const [total, setTotal] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignContent: 'space-between',
        }}>
          <Box sx={{ paddingLeft: 2 }}>
            <h1>Shipping</h1>
            {listing.collection === "false" && <p>The seller will deliver the item to you</p>}
          </Box>
          <List >
            <ListItem>
              <Alert sx={{ width: "100%" }} severity='success' variant="outlined">Item is available and you have sufficient funds</Alert>
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
                {listing.collection === "true" && <FormControlLabel sx={{ justifyContent: 'space-between', marginLeft: 0 }} labelPlacement="start" value="collection" control={<Radio />} label="Collection" />}
                {listing.delivery === "true" &&
                  <><FormControlLabel sx={{ justifyContent: 'space-between', marginLeft: 0 }} labelPlacement="start" value="delivery" control={<Radio />} label={`Delivery`} />
                    <Typography variant="caption" color="grey" mt='-12px'>M${listing.shipping_cost}</Typography>
                  </>}
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
              <LoadingButton className={"custom-loading"} disabled={error} color="secondary" loading={loading} onClick={handleDelivery} variant="contained">
                Continue
              </LoadingButton>
            }
            {transmissionType === 'collection' &&
              <LoadingButton xs={{ flex: 1 }} className={"custom-loading"} color="secondary" disabled={error} loading={loading} onClick={handleCollection} variant="contained">
                Confirm Collection
              </LoadingButton>
            }
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