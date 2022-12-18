import { Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import ListingList from "../components/ListingList";
import Autocomplete from "@mui/material/Autocomplete";
import { getListings } from "../database/listing";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";


const categories = [
    { category_id: 1, name: "Not a real category" },
    { category_id: 2, name: "Pick me" },
    { category_id: 3, name: "Oh i wish that this worked!" },
    { category_id: 4, name: "Me encanto albondigas" },
    { category_id: 5, name: "Surely i'm your best bet" },
  ];

export default function Marketplace() {
  const [listings, setListings] = useState();


  /* fetches the listings from local database */
  useEffect(() => {
    getListings()
      .then((data) => {
        setListings(data);
        console.log(`results: ${data}`);
      })
      .catch((e) => {
        console.error(e);
      });
    return;
  }, []);



  function categoryChips() {
    return categories.map((cat) => {
      return (
          <Chip label={cat.name} key={cat.category_id} />
      );
    });
  }

  if (listings && categories) {
    return (
      <div>
        <Stack spacing={2} sx={{ width: 300, mt: 2 }}>
          <Autocomplete
            id="free-solo-demo"
            freeSolo
            options={listings.map((option) => option.name)}
            renderInput={(params) => <TextField {...params} label="Search" />}
          />

          <Stack
            component="ul"
            direction="row"
            spacing={1}
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
            {categoryChips()}
          </Stack>

          <Typography variant="h4">Listings</Typography>
          <ListingList listings={listings} />
        </Stack>
      </div>
    );
  } else {
    return <Typography variant="h5">There are no listings</Typography>;
  }
}
