import react, {useEffect, useState} from 'react';
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { getListingById } from '../database/listing';


function ListingPurchase(props) {
    const [listing, setListing] = useState();
    const [message, setMessage] = useState('Hello this is a great message');
    const params = useParams();

      useEffect(() => {
        getListingById(params.id).then(function (result) {
          setListing(result);
        });
      }, [params.id]);

      const handleClose = () => console.log("close");
      const handleSend = () => console.log("send");
       const handleMessageChange = (event) => {
         setMessage(event.target.value);
       };

       if (listing) {
    return (
      <Box>
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
    );
       }
       else {
        return <p>No listing</p>
       }
}
export default ListingPurchase;