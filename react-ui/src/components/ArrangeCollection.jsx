import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack"
import Typography from '@mui/material/Typography';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';
import { getListingById } from "../database/listing";
import { getContacts, addContact,isContact } from "../minima";
import ListingDetailSkeleton from "./ListingDetailSkeleton";


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
      isContact(pk).then((res)=>{
            if(res!==false){
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
  }
if(listing){
  return (
    <Stack sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: 'calc(100vh - 80px)' }}>
      <Typography sx={{fontSize: "24px", textAlign: "center"}} variant="h1">Arrange Collection</Typography>
      <Stack spacing={2} sx={{paddingLeft: 2, paddingRight: 2}}>
        <Typography sx={{  }} variant="h3">MaxSolo</Typography>
        <Typography sx={{  fontSize: 15, paddingBottom: '30px' }} variant="p">{(!isFriend ?  `Add @${listing.created_by_name}.` : `@${listing.created_by_name} is already a contact. `) +`Chat over MaxSolo, meet and pay when you are with the seller.`}</Typography>
        {!isFriend && <LoadingButton className={"custom-loading"} color="primary" variant="contained" onClick={() => handleAdd()}>add Contact</LoadingButton>}
        {msg && <Alert sx={{ width: "100%" }} severity={status ? 'success' : 'error'} variant="outlined">{msg}</Alert>}
        {!isFriend && <Typography sx={{ textAlign: 'center', marginTop: '15px', flex: 1 }} variant="caption">The seller is expecting you to get in touch.</Typography>}
        {isFriend && <Alert sx={{width:"100%"}} severity="success" variant="outlined" >Seller is already a contact!</Alert>}
      </Stack>
        <LoadingButton className={"custom-loading"} color="secondary" onClick={() => navigate("/")} variant="outlined">
          Close
        </LoadingButton>
    </Stack>
  );
}else{
  return <ListingDetailSkeleton/>;
}
}