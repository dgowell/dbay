import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import BungalowIcon from "@mui/icons-material/Bungalow";
import { ListItemButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Listing(props) {
  const navigate = useNavigate();
  return (
    <ListItem disablePadding>
      <ListItemButton
        edge="end"
        aria-label="view listing"
        onClick={() => {
          navigate(`${props.link}/${props.listing.listing_id}`);
        }}
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
      </ListItemButton>
    </ListItem>
  );
}

export default function ListingList(props) {
  // This method will map out the listings on the table
  function listingList(props) {
    if (props.listings.length > 0) {
      return props.listings.map((listing) => {
        return <Listing listing={listing} key={listing.listing_id} link={props.link} />;
      });
    } else return <Typography m={3}>No listings found.</Typography>;
  }

  const style = {
    width: "100%",
    bgcolor: "background.paper",
  };

  // This following section will display the table with the listings of individuals.
  return <List sx={style}>{listingList(props)}</List>;
}
