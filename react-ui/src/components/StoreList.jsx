import React, { useEffect, useState } from "react";
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
import { getAllStores } from "../db";
import { sendStoreToContacts } from "../comms";
import { ListItemButton } from "@mui/material";

const Store = (props) => (
  <ListItem
    secondaryAction={
      <IconButton
        edge="end"
        aria-label="delete"
        onClick={() => {
          props.sendStore(props.store["STORE_PUBKEY"]);
        }}
      >
        <SendIcon />
      </IconButton>
    }
  >
    <ListItemButton
      edge="end"
      aria-label="view store"
      to={`/store/${props.store["STORE_ID"]}`}
    >
      <ListItemAvatar>
        {props.store.image ? (
          <Avatar alt={props.store["NAME"]} src={props.store["IMAGE"]} />
        ) : (
          <Avatar>
            <BungalowIcon />
          </Avatar>
        )}
      </ListItemAvatar>
      <ListItemText primary={props.store["NAME"]} />
    </ListItemButton>
  </ListItem>
);

export default function StoreList() {
  const [stores, setStores] = useState([]);

  /* fetches the stores from local database */
  useEffect(() => {
    getAllStores()
      .then((data) => {
        setStores(data);
        console.log(`results: ${JSON.stringify(data)}`);
      })
      .catch((e) => {
        console.error(e);
      });
    return;
  }, []);

  // This method will map out the stores on the table
  function storeList() {
    return stores.map((store) => {
      return (
        <Store
          store={store}
          sendStore={() =>
            sendStoreToContacts(store['STORE_PUBKEY'])
              .then((res) => {
                console.log(`successfully sent store!`);
              })
              .catch((e) => {
                console.error(e);
              })
          }
          key={store['STORE_ID']}
        />
      );
    });
  }

  const style = {
    width: "100%",
    bgcolor: "background.paper",
  };

  // This following section will display the table with the stores of individuals.
  return (
    <Box sx={{ flexGrow: 1, maxWidth: 752 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            Marketplace
          </Typography>
          <List sx={style}>{storeList()}</List>
        </Grid>
      </Grid>
    </Box>
  );
}
