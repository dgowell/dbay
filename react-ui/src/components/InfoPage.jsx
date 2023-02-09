import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import sent from "../assets/images/ts_1.gif";
import { useNavigate } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
export default function InfoPage() {
  const navigate = useNavigate();
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
          <Card style={{textAlign:"center"}}>
            <CardContent>
            <Typography sx={{ fontSize: 24,fontStyle: 'normal' }} gutterBottom>
              Successfully published!
            </Typography>
            <img src={sent} alt={'cone'} width={"65%"} height={"25%"} />
            <Typography>
              Your item is now in the marketplace
            </Typography>
            <LoadingButton         
              fullWidth
              variant="contained"
              sx={{background: "linear-gradient(270deg, #1A73E9 0%, #6C92F4 100%)",
                boxShadow:" 0px 4px 8px rgba(29, 116, 233, 0.16)",
                borderRadius: "6px"}}
              onClick={()=>{navigate("/")}}>Return Home</LoadingButton>

            </CardContent>
          </Card>
        </Box>
        </Stack>
      </Stack>
    </div>
  );
}