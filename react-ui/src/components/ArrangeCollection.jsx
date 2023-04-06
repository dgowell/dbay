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

export default function InfoPage() {
  const navigate = useNavigate();
  const {state} = useLocation();
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
                        <ListItemAvatar>
                            <Avatar>
                                <PersonAddIcon />
                            </Avatar>
                        </ListItemAvatar>
                     <ListItemText primary="Add contact" />
                    </ListItem>
                    <ListItem>
                        <Alert sx={{width:"100%"}} severity='success' variant="outlined">Contact successfully added</Alert>
                    </ListItem>
                    <ListItem>
                        <Alert sx={{width:"100%"}} severity='success' variant="outlined">The seller is waiting for you to get in touch</Alert>
                    </ListItem>
                </List>
            </CardContent>
          </Card>
          <div style={{justifyContent:"center",width:"100%"}}>
            <LoadingButton className={"custom-loading"} style={{color:"#2C2C2C",width:"100%"}}  onClick={()=>navigate("/")} variant="contained">
                        Close
            </LoadingButton>
          </div>
        </Box>
        </Stack>
      </Stack>
    </div>
  );
}