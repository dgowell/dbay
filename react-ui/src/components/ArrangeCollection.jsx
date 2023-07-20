import React, { useEffect, useState } from "react";
import Typography from '@mui/material/Typography';
import { useNavigate, useParams } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from '@mui/material/Alert';
import { getListingById } from "../database/listing";
import { addContact, isContact, link } from "../minima";
import ListingDetailSkeleton from "./ListingDetailSkeleton";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';


export default function InfoPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState();
  const [sellerAddress, setSellerAddress] = useState();
  const [msg, setMsg] = useState();
  const [status, setStatus] = useState();
  const [isFriend, setIsFriend] = useState(false);
  const [maxsoloError, setMaxsoloError] = useState('');

  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
      isContact(result.created_by_pk).then((res) => {
        if (res !== false) {
          setIsFriend(true);
        }
      })
    }).catch((e) => console.error(e));
  }, [params.id]);

  function handleMaxSoloLink() {
    if (!isFriend) {
      if (listing.seller_has_perm_address === 'true') {
        handleAdd(listing.seller_perm_address);
      } else {
        setMaxsoloError(`Seller doesn't have a permanent maxima address set`);
      }
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

  async function handleAdd(address) {
    const { msg, status } = await addContact(address);
    console.log(msg, status);
    setStatus(status);
    setMsg(msg);
    if (status === "success") {
      setIsFriend(true);
    }
  }
  if (listing) {
    return (
      <Box mt={3}>
        <h1>Arrange Collection</h1>
        <p>Open MaxSolo and start a chat with the <b>sellers name</b></p>

        <span>Seller</span>
        <Stack direction="row"   justifyContent="space-between"
  alignItems="center" spacing={2}>
          <Typography variant="h6">@{listing.created_by_name}</Typography>
        <Button onClick={handleMaxSoloLink} variant="contained" color="secondary">Open MaxSolo</Button>
              {maxsoloError && <Alert mt={2} sx={{ marginTop: "5px", width: "100%" }} severity="error" variant="outlined">{maxsoloError}</Alert>}
        </Stack>

        <Divider sx={{ marginTop: "30px", marginBottom: "30px" }} />

        
        <Typography variant="h6">Next Steps</Typography> 
        <ol>
          <li>Contact the seller to arrange a time and place to collect the item</li>
          <li>Meet with the seller and check your item is as you expect.</li>
          <li>Pay from 'My Purchases'</li>
        </ol>
        

        <LoadingButton className={"custom-loading"} color="secondary" onClick={() => navigate("/")} variant="outlined">
          Close
        </LoadingButton>
      </Box>
    );
  } else {
    return <ListingDetailSkeleton />;
  }
}