import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import BungalowIcon from "@mui/icons-material/Bungalow";
import { ListItemButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

function Listing(props) {
  const navigate = useNavigate();
  const { link, listing } = props;
  return (
    <ListItem disablePadding>

      <ListItemButton
        edge="end"
        aria-label="view listing"
        onClick={() => {
          navigate(`${link}/${listing.listing_id}`);
        }}
      >
        <ListItemAvatar>
          {listing?.image ? (
            <Avatar alt={listing.title} src={listing.image.split("(+_+)")[0]} style={{borderRadius:"5px"}} />
          ) : (
            <Badge anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
              }} color="secondary" variant="dot" invisible={!(listing.notification === 'true')}>
              <Avatar>
                <BungalowIcon />
              </Avatar>
            </Badge>
          )}
        </ListItemAvatar>

        <ListItemText
          primary={listing.title}
          secondary={listing.price ? `$M${listing.price}` : null}
        />
        <Stack direction="row" spacing={1}>
        <ListItem sx={{color:"rgba(0, 0, 0, 0.54)"}}>
          {listing.collection==='true' && (listing.status === 'available' || listing.status === 'pending' || listing.status === 'unchecked')
            ? <LocationOnOutlinedIcon/>
            : null}
          {listing.delivery==='true' && (listing.status === 'available' || listing.status === 'pending' || listing.status === 'unchecked')
            ? <LocalShippingOutlinedIcon/>
            : null}
          {listing.transmission_type === "collection" && (listing.status === 'sold' || listing.status === 'in progress')
            ? <LocationOnOutlinedIcon/>
            : null}
          {listing.transmission_type === "delivery" && (listing.status === 'sold' || listing.status === 'in progress')
            ?  <LocalShippingOutlinedIcon/>
            : null}
            </ListItem>

          </Stack>
      </ListItemButton>

    </ListItem >
  );
}

export default function ListingList(props) {
  // This method will map out the listings on the table
  const {link, listings} = props;
  function listingList(props) {
    if (listings.length > 0) {
      return listings.map((listing) => {
        return <Listing listing={listing} key={listing.listing_id} link={link} />;
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
