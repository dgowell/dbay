import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import BungalowIcon from "@mui/icons-material/Bungalow";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import { getAllListings } from "../db";
import { sendListingToContacts } from "../comms";

const Listing = (props) => (
  <ListItem
    secondaryAction={
      <IconButton
        edge="end"
        aria-label="delete"
        onClick={() => {
          props.sendListing(props.listing.ID);
        }}
      >
        <SendIcon />
      </IconButton>
    }
  >
    <ListItemAvatar>
      {props.listing.image ? (
        <Avatar alt={props.listing.name} src={props.listing.image} />
      ) : (
        <Avatar>
          <BungalowIcon />
        </Avatar>
      )}
    </ListItemAvatar>
    <ListItemText
      primary={props.listing.name}
      secondary={props.listing.price ? `£${props.listing.price}` : null}
    />
  </ListItem>
);

export default function ListingList() {
  const [listings, setListings] = useState([]);

  /* fetches the listings from local database */
  useEffect(() => {
      getAllListings()
        .then((data) => {
          setListings(data);
          console.log(`results: ${data}`);
        })
        .catch((e) => {
          console.error(e);
        });
    return;
  }, []);


  // This method will map out the listings on the table
  function listingList() {
    return listings.map((listing) => {
      return (
        <Listing
          listing={listing}
          sendListing={() => sendListingToContacts(listing.ID)
            .then((res) => {
              console.log(`successfully sent listing!`)
            })
            .catch((e)=>{
              console.error(e);
            })}
          key={listing.ID}
        />
      );
    });
  }

  const style = {
    width: "100%",
    bgcolor: "background.paper",
  };

  // This following section will display the table with the listings of individuals.
  return (
    <Box sx={{ flexGrow: 1, maxWidth: 752 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            Marketplace
          </Typography>
          <List sx={style}>{listingList()}</List>
        </Grid>
      </Grid>
    </Box>
  );
}
