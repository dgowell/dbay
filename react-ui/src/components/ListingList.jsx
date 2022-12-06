import React, { useEffect, useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import BungalowIcon from "@mui/icons-material/Bungalow";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import { getListings } from "../database/listing";
import { sendListingToContacts } from "../comms";

const Listing = (props) => (
  <ListItem
    secondaryAction={
      <IconButton
        edge="end"
        aria-label="delete"
        onClick={() => {
          props.sendListing(props.listing.listing_id);
        }}
      >
        <SendIcon />
      </IconButton>
    }
  >
    <ListItemAvatar>
      {props.listing.image ? (
        <Avatar alt={props.listing.NAME} src={props.listing.image} />
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

export default function ListingList(storeId) {
  const [listings, setListings] = useState([]);

  /* fetches the listings from local database */
  useEffect(() => {
      getListings(storeId.storeId)
        .then((data) => {
          setListings(data);
          console.log(`results: ${data}`);
        })
        .catch((e) => {
          console.error(e);
        });
    return;
  }, [storeId.storeId]);


  // This method will map out the listings on the table
  function listingList() {
    return listings.map((listing) => {
      return (
        <Listing
          listing={listing}
          sendListing={() => sendListingToContacts(listing.listing_id, storeId.storeId)
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
    <List sx={style}>{listingList()}</List>
  );
}
