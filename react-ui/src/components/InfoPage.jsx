import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import sent from "../assets/images/ts_1.gif";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';


export default function InfoPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { main, sub, action } = state ?? { main: 'Successfull', sub: '', action: 'success' };

  return (
    <div>
      <Stack spacing={2} sx={{ width: '100%', height: '100%' }}>
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
            <Card sx={{
              boxShadow: "none",
              display: 'flex',
              height: 'calc(100vh - 56px)',
            }}>
              <CardContent sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                alignContent: 'center',
                flexWrap: 'wrap',
                width: '100%'
              }}>
                <Typography sx={{
                  fontFamily: 'Roboto',
                  textAlign: 'center',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  fontSize: '24px',
                  lineHeight: '31px',
                }} gutterBottom>
                  {main ?? 'Successfull'}
                </Typography>
                {(!action || action === 'success') ? <CheckCircleIcon sx={{ alignSelf: 'center', fontSize: '4.5rem'}} color="success" />
                  :
                  <CancelIcon sx={{ alignSelf: 'center', fontSize: "4.5rem" }} color="error" />
                }
                {sub ?
                <Typography sx={{
                  fontFamily: 'Roboto',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  fontSize: '20px',
                  lineHeight: '1.5rem'
                }} gutterBottom>
                  {sub ?? ''}
                </Typography>
                : null}
                <LoadingButton className={"custom-loading"}
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  sx={{
                    alignSelf: 'end',
                    borderRadius: "6px",
                    background: "secondary",
                    boxShadow: "none",
                  }}
                  onClick={() => { navigate("/") }}>Return Home</LoadingButton>

              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Stack>
    </div>
  );
}