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
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

const Listing = (props) => (
  <Link edge="end" aria-label="delete" to={`/edit/${props.listing._id}`}>
    <ListItem
      button
      secondaryAction={
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={() => {
            props.deleteListing(props.listing._id);
          }}
        >
          <DeleteIcon />
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
        secondary={
          props.listing.asking_price ? `£${props.listing.asking_price}` : null
        }
      />
    </ListItem>
  </Link>
);

export default function ListingList() {
  const [listings, setListings] = useState([]);

  // This method fetches the listings from the database.
  useEffect(() => {
    async function getListings() {
      const response = await fetch(`http://localhost:5000/listing/`);

      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }

      const listings = await response.json();
      setListings(listings);
    }

    getListings();

    return;
  }, [listings.length]);

  // This method will delete a listing
  async function deleteListing(id) {
    await fetch(`http://localhost:5000/${id}`, {
      method: "DELETE",
    });

    const newListings = listings.filter((el) => el._id !== id);
    setListings(newListings);
  }

  // This method will map out the listings on the table
  function listingList() {
    return listings.map((listing) => {
      return (
        <Listing
          listing={listing}
          deleteListing={() => deleteListing(listing._id)}
          key={listing._id}
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
