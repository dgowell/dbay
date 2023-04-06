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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
export default function InfoPage() {
  const navigate = useNavigate();
  const {state} = useLocation();
  const {main,sub,action} = state ?? {main:'Successfull',sub:'',action:'success'};

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
          <Card style={{textAlign:"center"}} sx={{boxShadow:"none"}}>
            <CardContent>
            <Typography sx={{ fontFamily: 'Roboto',
                              fontStyle: 'normal',
                              fontWeight: '400',
                              fontSize: '24px',
                              lineHeight: '31px',
                              mt:'30%',
                              mb:'10%' }} gutterBottom>
              {main ?? 'Successfull'}
            </Typography>
           { (!action || action=='success') ? <CheckCircleIcon fontSize="large" sx={{color: "rgba(0, 0, 0, 0.54)",mb:'30%'}}/>
            :
            <CancelIcon fontSize="large" sx={{color: "rgba(0, 0, 0, 0.54)",mb:'30%'}}/> 
             }
            <Typography sx={{ fontFamily: 'Roboto',
                              fontStyle: 'normal',
                              fontWeight: '400',
                              fontSize: '20px',
                              lineHeight: '128.91%',}} gutterBottom>
            {sub ?? ''} 
            </Typography>
            <LoadingButton className={"custom-loading"}         
              fullWidth
              variant="outlined"
              sx={{
                mt:"60%",
                mb:"0%",
                borderRadius: "6px",
                background: "#D9D9D9",
                borderRadius: "510px",
                boxShadow: "none",}}
              onClick={()=>{navigate("/")}}>Return Home</LoadingButton>

            </CardContent>
          </Card>
        </Box>
        </Stack>
      </Stack>
    </div>
  );
}