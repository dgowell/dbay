import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import sent from "../assets/images/ts_1.gif";
import { useNavigate,useParams,useLocation } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { CardHeader } from "@mui/material";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Avatar from "@mui/material/Avatar";
import Alert from '@mui/material/Alert';
import { getListingById } from "../database/listing";
import { getContacts,addContact } from "../minima";


export default function InfoPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [listing,setListing] = useState();
  const [seller,setSeller] = useState();
  const [msg,setMsg] = useState();
  const [status,setStatus] = useState();
  const [isContact,setIsContact]=useState(false);

  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
     const contacts =  getContacts();
     const slr = result.created_by_pk;
     setSeller(slr);
     const mls = slr.split("#")[1];
      Object.keys(contacts).forEach((key,val)=>{
        if(mls==contacts[key]["extradata"]["mls"]){
          setIsContact(true);
        }
      })
    }).catch((e) => console.error(e));
  }, [params.id]);
 
async  function handleAdd() {
   const {msg,status} = await addContact(seller);
   console.log(msg,status);
   setStatus(status);
   setMsg(msg);
  }

return (
    <div>
      <Stack spacing={2} sx={{ width: '100%', mt: 2, mb:8,height:'100%' }}>
        <Stack component="ul" direction="row" spacing={1}
          sx={{
            display: "flex",
            justifyContent: "left",
            flexWrap: "nowrap",
            listStyle: "none",
            margin: 0,
            padding: 0,
            overflow: "auto",
            maxWidth: "400px",
          }}
        >
        <Box width={'100%'} height={'100%'}>
          <Card sx={{border: "none", boxShadow: "none"}}>
            <CardHeader style={{fontSize:"24px"}} title={"Arrange Collection"}/>
            <CardContent>
                <List>
                    <ListItem>
                        <ListItemText primaryTypographyProps={{fontSize: 20,fontWeight:700}} primary={"maxSolo"} secondary={"Add the seller as a contact and get in touch with them using the MaxSolo MiniDapp. "}/>                    
                    </ListItem>
                    <ListItem>
                    {isContact ?   <ListItemText primary="Already a contact"/> :<LoadingButton className={"custom-loading"} style={{color:"#2C2C2C"}}  onClick={()=>handleAdd()} variant="contained">
                        add Contact
                      </LoadingButton> }  
                    </ListItem>
                   {msg && <ListItem>
                       <Alert sx={{width:"100%"}} severity={status ? 'success': 'error'} variant="outlined">{msg}</Alert>
                    </ListItem>}
                    <ListItem>
                        <Alert sx={{width:"100%"}} severity='success' variant="outlined">The seller is waiting for you to get in touch</Alert>
                    </ListItem>
                </List>
            </CardContent>
          </Card>
          <div style={{justifyContent:"center",width:"100%"}}>
            <LoadingButton className={"custom-loading"} style={{color:"#2C2C2C",width:"100%",marginTop:"60%",marginBottom:0}}  onClick={()=>navigate("/")} variant="contained">
                        Close
            </LoadingButton>
          </div>
        </Box>
        </Stack>
      </Stack>
    </div>
  );
}