import react, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import LoadingButton from '@mui/lab/LoadingButton';
import { getListingById } from '../database/listing';
import { useNavigate } from "react-router";
import { sendMoney, sendDeliveryAddress } from "../comms";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import BackButton from '../components/BackButton';
import Alert from '@mui/material/Alert';

function ListingPurchase(props) {
  const [listing, setListing] = useState();
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
    });
  }, [params.id]);

  const handleSend = () => {
    setLoading(true);
    setError(false);
    //send address to to merchant
    sendDeliveryAddress({ merchant: listing.created_by_pk, address: message }).then(
      sendMoney({
        walletAddress: listing.wallet_address,
        amount: listing.price,
        purchaseCode: listing.purchase_code
      }).then((res) => {
        if (res) {
          navigate("/payment-success");
        }
      }).catch((error) => {
        setError(error);
        navigate("/payment-error");
        console.error(error)
      })
    );
    setLoading(false);
  }
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  if (listing) {
    return (
      <Box sx={{
        pt: 2,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box mb={4} >
          <BackButton route={`/listing/${listing.listing_id}`} />
        </Box>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Item is available" />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <ImageIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={`$M ${listing.price}`} secondary={listing.name} />
          </ListItem>
        </List>
        <Box sx={{
          p: 2,
        }}>
          <Typography mb={2}>Enter your address in this box:</Typography>
          <TextField
            id="outlined-multiline-static"
            label="Delivery address"
            multiline
            rows={4}
            value={message}
            onChange={handleMessageChange}
            sx={{width:'100%'}}
          />
        </Box>
        <Box
          m={1}
          display="flex"
          justifyContent="center"
        >
          <LoadingButton disabled={error} loading={loading} onClick={handleSend} variant="contained">
            Pay & Confirm
          </LoadingButton>
        </Box>
      </Box>
    );
  }
  else {
    return <p>No listing</p>
  }
}
export default ListingPurchase;