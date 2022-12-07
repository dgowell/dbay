import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import BungalowIcon from "@mui/icons-material/Bungalow";

const Listing = (props) => (
  <ListItem
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

export default function ListingList(listings) {
  // This method will map out the listings on the table
  function listingList(listings) {
    return listings.listings.map((listing) => {
      return (
        <Listing
          listing={listing}
          key={listing.listing_id}
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
    <List sx={style}>{listingList(listings)}</List>
  );
}
