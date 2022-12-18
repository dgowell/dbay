import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById } from "../database/listing";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import ShareIcon from "@mui/icons-material/Share";
import Card from "@mui/material/Card";
import TestImage from "../assets/images/test.jpg";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { getHostStore } from "../database/settings";
import { sendListingToContacts } from "../comms";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router";
import { getContactAddress } from "../mds-helpers";
import { sendPurchaseRequest, sendMerchantConfirmation } from "../comms";
import {
  handlePurchase,
  updateMerchantConfirmation
} from "../database/listing";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

function ListingDetail() {
  const [open, setOpen] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSuccessClose = () => setSuccess(false);
  const handleSuccess = () => setSuccess(true);
  const params = useParams();
  const [listing, setListing] = useState();
  const [owner, setOwner] = useState(false);
  const [customerAddress, setCustomerAddress] = useState();
  const [customerName, setCustomerName] = useState();

  const [message, setMessage] = useState(
    "Leave it around the side of the house at 20 Madeup Street, Nowhere, SWU P56"
  );
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const navigate = useNavigate();

  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
    });
  }, [params.id]);

  useEffect(() => {
    getContactAddress().then((address)=> {
      setCustomerAddress(address);
    });
  },[]);

  useEffect(() => {
    if (listing) {
      getHostStore().then((host) => {
        setCustomerName(host.host_store_name);
        if (listing.created_by_pk === host.host_store_pubkey) {
          setOwner(true);
        }
      });
    }
  }, [listing]);

  function handleMerchantConfirmation() {
    updateMerchantConfirmation(listing.listing_id);
    sendMerchantConfirmation({
      id: listing.listing_id,
      customer: listing.customer_pk
    }).then(() => {
      alert("success!");
    });
  }

  function handleSend(e) {
    e.preventDefault();

    sendPurchaseRequest({
      merchant: listing.created_by_pk,
      createdAt: listing.created_at,
      customerName: customerName,
      customerPk: customerAddress,
      message: message,
    })
      .then((res) => {
        //check if it went through
        if (res) {
          handleSuccess();
          handleClose();
          navigate("/");
          handlePurchase(listing.listing_id);
        } else {
          //somethign went wrong
          alert(res);
        }
      })
      .catch((e) => {
        alert(`There has been an error with your purchase: ${e}`);
        handleClose();
      });
  }

  return (
    <div>
      {listing && customerAddress && customerName ? (
        <Card sx={{ maxWidth: 345, marginTop: 2 }}>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Stack spacing={2} direction="column">
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Request Purchase
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  Send purchase request to {listing.created_by_name} for the{" "}
                  {listing.name} listed at M${listing.price}.
                </Typography>
                <Typography>Please fill in your address below:</Typography>
                <TextField
                  id="outlined-multiline-static"
                  label="Message for merchant"
                  multiline
                  rows={4}
                  value={message}
                  onChange={handleMessageChange}
                />
                <Stack spacing={2} direction="row">
                  <Button onClick={handleClose} variant="outlined">
                    Cancel
                  </Button>
                  <Button onClick={handleSend} variant="contained">
                    Send
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Modal>
          <Modal
            open={success}
            onClose={handleSuccessClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Stack spacing={2} direction="column">
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  Congratulations, you've successfully sent the money!
                </Typography>
                <Stack spacing={2} direction="row">
                  <Button onClick={handleSuccessClose} variant="contained">
                    OK
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Modal>
          <CardMedia
            component="img"
            width="100%"
            image={TestImage}
            alt="green iguana"
          />
          <CardContent>
            <Typography gutterBottom variant="h4" component="div">
              £{listing.price}
            </Typography>
            <Typography gutterBottom variant="h6" component="div">
              {listing.name}
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
            {owner ? null : (
              <Button onClick={handleOpen} size="small">
                Request Purchase
              </Button>
            )}
            {owner ? null : <Button size="small">Contact Seller</Button>}
            <IconButton
              onClick={() => {
                sendListingToContacts(listing.listing_id);
              }}
              aria-label="share"
            >
              <ShareIcon />
            </IconButton>
          </CardActions>
          {owner ? null : (
            <Tooltip title={listing.sent_by_name} placement="bottom">
              <Button>Who sent me this?</Button>
            </Tooltip>
          )}
          <Divider />
          <CardContent>
            {owner && listing.purchase_text && (
              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom variant="p" component="div">
                  A customer has requested this item, their address details are
                  below:
                </Typography>
                <Typography gutterBottom variant="h6" component="div">
                  {listing.purchase_text}
                </Typography>
              </Box>
            )}
            {(owner && (listing.purchase_requested === true ||listing.purchase_requested === 'true')) && (
              <Box sx={{ mt: 2 }}>
                <Alert
                  severity="info"
                  action={
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        handleMerchantConfirmation();
                      }}
                    >
                      Confirm
                    </Button>
                  }
                >
                  Confirm you can send to this address
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
export default ListingDetail;
