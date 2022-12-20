import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById } from "../database/listing";
import CardHeader from "@mui/material/CardHeader";
import CircularProgress from "@mui/material/CircularProgress";

import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import ShareIcon from "@mui/icons-material/Share";
import Card from "@mui/material/Card";
import TestImage from "../assets/images/test.jpg";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { getHost } from "../database/settings";
import { sendListingToContacts, checkAvailability } from "../comms";
import { useNavigate } from "react-router";
import { getContactAddress } from "../mds-helpers";
import Divider from "@mui/material/Divider";
import { Stack } from "@mui/system";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ForwardIcon from "@mui/icons-material/Forward";
import SendIcon from "@mui/icons-material/Send";
import PaymentIcon from "@mui/icons-material/Payment";
import Box from "@mui/material/Box";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Fab from "@mui/material/Fab";

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
AvailabilityCheckScreen.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

function ListingDetail() {
  const [listing, setListing] = useState();
  const [customerAddress, setCustomerAddress] = useState();
  const [customerName, setCustomerName] = useState();
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
    });
  }, [params.id]);

  useEffect(() => {
    getContactAddress().then((address) => {
      setCustomerAddress(address);
    });
  }, []);

  useEffect(() => {
    if (listing) {
      getHost().then((host) => {
        setCustomerName(host.name);
      });
    }
  }, [listing]);

  function handleBuy() {
    setCheckingAvailability(true);
    checkAvailability({
      merchant: listing.created_by_pk,
      customerPk: customerAddress,
      listingId: listing.listing_id,
    }).then((res) => {
      if (res === true) {
       alert("yay available");
       navigate(`/listing/${listing.listing_id}/purchase`);
      } else {
        console.log("unavailable");
      }
    });
  }

  function handleShare() {
    sendListingToContacts(listing.listing_id);
    //TODO:load pop top show that the listing has been shared
  }

  if (checkingAvailability) {
    return <AvailabilityCheckScreen />
  } else {
    return (
      <div>
        <Fab color="primary" aria-label="add">
          <ArrowBackIcon />
        </Fab>
        {listing && customerAddress && customerName ? (
          <div>
            <Card sx={{ maxWidth: 345, marginTop: 2 }}>
              <CardHeader
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
              <CardMedia
                component="img"
                width="100%"
                image={TestImage}
                alt="Test Image"
              />
              <CardContent>
                <Typography gutterBottom variant="h4" component="div">
                  £{listing.price}
                </Typography>
                <Typography gutterBottom variant="h6" component="div">
                  {listing.name}
                </Typography>
                <Typography gutterBottom component="div">
                  {listing.description
                    ? listing.description
                    : "This is a fake description while there is no description available. The item for sale is perfect, you should definetly buy it right now before it is too late. In fact fuck it i'm gonna buy it."}
                </Typography>
              </CardContent>
              <Divider />
              <List>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <StorefrontIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Sold by: ${listing.created_by_name}`}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <ForwardIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Sent by: ${listing.sent_by_name}`}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Card>
            <Stack spacing={2} mt={4}>
              {listing.status === "unknown" ? (
                <Button
                  variant="contained"
                  onClick={handleBuy}
                  startIcon={<PaymentIcon />}
                >
                  I want it
                </Button>
              ) : null}
              <Button variant="outlined" endIcon={<SendIcon />}>
                Contact Seller
              </Button>
            </Stack>
          </div>
        ) : null}
      </div>
    );
  }
}
export default ListingDetail;
