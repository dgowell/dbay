import React, { useEffect, useState } from "react";
import Typography from '@mui/material/Typography';
import { useNavigate, useParams } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from '@mui/material/Alert';
import { getListingById } from "../database/listing";
import { addContact, isContact, link } from "../minima";
import ListingDetailSkeleton from "./ListingDetailSkeleton";
import Box from "@mui/material/Box";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { Button } from "@mui/material";

export default function InfoPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState();
  const [seller, setSeller] = useState();
  const [msg, setMsg] = useState();
  const [status, setStatus] = useState();
  const [isFriend, setIsFriend] = useState(false);
  const [maxsoloError, setMaxsoloError] = useState('');

  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
      const seller = result.created_by_pk;
      setSeller(seller);
      isContact(seller).then((res) => {
        if (res !== false) {
          setIsFriend(true);
        }
      })
    }).catch((e) => console.error(e));
  }, [params.id]);

  function handleMaxSoloLink() {
    if (!isFriend) {
      handleAdd();
    }
    link('maxsolo', function (res) {
      if (res.status === false) {
        if (res.error.includes('permission escalation')) {
          setMaxsoloError('Linking to MaxSolo requires that you have WRITE permissions set on dbay.');
        } else if (res.error.includes('not found')) {
          setMaxsoloError('MaxSolo is not installed on your device.');
        } else {
          setMaxsoloError(res.error);
        }
      } else if (res.status === true) {
        setMaxsoloError('');
        window.open(res.base, '_blank');
      }
    });
  }

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
      <Box sx={{ textAlign: 'center' }} mt={3}>
        <Typography sx={{ fontSize: "24px", textAlign: "center" }} variant="h1">Arrange Collection</Typography>
        <Typography mt={3} mb={3} variant="h3">What are my next steps?</Typography>
        <Timeline position="alternate">
          <TimelineItem>
            <TimelineOppositeContent
              sx={{ m: 'auto 0' }}
              align="right"
              variant="body2"
              color="text.secondary"
            >
              <Button onClick={handleMaxSoloLink} variant="contained" color="secondary">Chat Now</Button>
              {maxsoloError && <Alert mt={2} sx={{ marginTop: "5px", width: "100%" }} severity="error" variant="outlined">{maxsoloError}</Alert>}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
              <TimelineDot color="secondary">
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="h6">
                Contact Seller
              </Typography>
              <Typography variant="h5">
                @{listing.created_by_name}
              </Typography>
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
              <TimelineConnector />
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