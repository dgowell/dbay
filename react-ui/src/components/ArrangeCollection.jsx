import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack"
import Typography from '@mui/material/Typography';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';
import { getListingById } from "../database/listing";
import { getContacts, addContact } from "../minima";


export default function InfoPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState();
  const [seller, setSeller] = useState();
  const [msg, setMsg] = useState();
  const [status, setStatus] = useState();
  const [isContact, setIsContact] = useState(false);

  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
      const contacts = getContacts();
      const slr = result.created_by_pk;
      setSeller(slr);
      const mls = slr.split("#")[1];
      Object.keys(contacts).forEach((key, val) => {
        if (mls == contacts[key]["extradata"]["mls"]) {
          setIsContact(true);
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

  return (
    <Stack sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: 'calc(100vh - 80px)' }}>
      <Typography sx={{fontSize: "24px", textAlign: "center"}} variant="h1">Arrange Collection</Typography>
      <Stack spacing={2} sx={{paddingLeft: 2, paddingRight: 2}}>
        <Typography sx={{  }} variant="h3">MaxSolo</Typography>
        <Typography sx={{  fontSize: 15, paddingBottom: '30px' }} variant="p">Add the seller as a contact and get in touch with them using the MaxSolo MiniDapp.</Typography>
        {isContact ? <ListItemText primary="Already a contact" /> : <LoadingButton className={"custom-loading"} color="secondary" variant="contained" onClick={() => handleAdd()}>add Contact</LoadingButton>}
        {msg && <Alert sx={{ width: "100%" }} severity={status ? 'success' : 'error'} variant="outlined">{msg}</Alert>}
        <Typography sx={{ textAlign: 'center', marginTop: '15px', flex: 1 }} variant="caption">The seller is expecting you to get in touch.</Typography>
      </Stack>
        <LoadingButton className={"custom-loading"} color="secondary" onClick={() => navigate("/")} variant="outlined">
          Close
        </LoadingButton>
    </Stack>
  );
}