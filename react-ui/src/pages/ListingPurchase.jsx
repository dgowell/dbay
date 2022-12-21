import react, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { getListingById } from '../database/listing';
import { useNavigate } from "react-router";
import { sendMoney, sendDeliveryAddress } from "../comms";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import ListItemAvatar from '@mui/material/ListItemAvatar';


function ListingPurchase(props) {
  const [listing, setListing] = useState();
  const [message, setMessage] = useState('');
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
    });
  }, [params.id]);

  const handleSend = () => {
    //send address to to merchant
    sendDeliveryAddress({ merchant: listing.created_by_pk, address: message }).then(
      sendMoney({
        walletAddress: listing.wallet_address,
        amount: listing.price,
      }).then((res) => {
        if (res) {
          navigate("/payment-success");
        }
      }).catch((error) => {
        navigate("payment-error");
        console.error(error)
      })
    );
    //send money to merchant
  }
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleBack = () => {
    navigate(`/listing/${listing.listing_id}`);
  }

  if (listing) {
    return (
      <Box sx={{
        pt: 2,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box mb={4} >
          <Button onClick={handleBack}><ArrowBackIcon /></Button>
        </Box>
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
          <Button onClick={handleSend} variant="contained">
            Pay & Confirm
          </Button>
        </Box>
      </Box>
    );
  }
  else {
    return <p>No listing</p>
  }
}
export default ListingPurchase;