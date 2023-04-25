import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack"
import Typography from '@mui/material/Typography';
import { useNavigate, useParams } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from '@mui/material/Alert';
import { getListingById } from "../database/listing";
import { getContacts, addContact, isContact } from "../minima";
import ListingDetailSkeleton from "./ListingDetailSkeleton";
import Box from "@mui/material/Box";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';

export default function InfoPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState();
  const [seller, setSeller] = useState();
  const [msg, setMsg] = useState();
  const [status, setStatus] = useState();
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
      const contacts = getContacts();
      const slr = result.created_by_pk;
      setSeller(slr);
      const pk = slr.split("#")[1];
      isContact(pk).then((res) => {
        if (res !== false) {
          setIsFriend(true);
        }
      })
    }).catch((e) => console.error(e));
  }, [params.id]);

  async function handleAdd() {
    const { msg, status } = await addContact(seller);
    console.log(msg, status);
    setStatus(status);
    setMsg(msg);
    if (status === "success") {
      setIsFriend(true);
    }
  }
  if (listing) {
    return (
      <Box sx={{textAlign: 'center'}} mt={3}>
        <Typography sx={{ fontSize: "24px", textAlign: "center" }} variant="h1">Arrange Collection</Typography>
        <Typography mt={3} mb={3} variant="h3">What are my next steps?</Typography>
        {!isFriend && <LoadingButton className={"custom-loading"} color="secondary" variant="contained" onClick={() => handleAdd()}>Add Contact</LoadingButton>}
        {msg && <Alert mt={1} sx={{ width: "100%" }} severity={status ? 'success' : 'error'} variant="outlined">{msg}</Alert>}
        {!isFriend && <Typography sx={{ textAlign: 'center', marginTop: '15px' }} variant="caption">The seller is expecting you to get in touch.</Typography>}
        <Timeline position="alternate">
          <TimelineItem>
            <TimelineOppositeContent
              sx={{ m: 'auto 0' }}
              align="right"
              variant="body2"
              color="text.secondary"
            >
              @{listing.created_by_name}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
              <TimelineDot color="secondary">
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="h6" component="span">
                Contact Seller
              </Typography>
              <Typography>communicate using MaxSolo</Typography>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineOppositeContent
              sx={{ m: 'auto 0' }}
              variant="body2"
              color="text.secondary"
            >
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot color="primary">
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="h6" component="span">
                Arrange collection
              </Typography>
              <Typography>mutually pick a time and place</Typography>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot color="primary" variant="outlined">
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="h6" component="span">
                Meet Seller
              </Typography>
              <Typography>check item is as you expect</Typography>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineConnector  />
              <TimelineDot>
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="h6" component="span">
                Pay
              </Typography>
              <Typography>using dbay from your 'My Purchases' section in transactions</Typography>
            </TimelineContent>
          </TimelineItem>
        </Timeline>


        <LoadingButton className={"custom-loading"} color="secondary" onClick={() => navigate("/")} variant="outlined">
          Close
        </LoadingButton>
      </Box>
    );
  } else {
    return <ListingDetailSkeleton />;
  }
}