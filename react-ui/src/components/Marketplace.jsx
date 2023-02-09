import React, { useEffect, useState } from "react";
import ListingList from "../components/ListingList";
import Autocomplete from "@mui/material/Autocomplete";
import { getListings } from "../database/listing";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import filter from 'lodash/filter';
import { getHost } from '../database/settings';
import Skeleton from '@mui/material/Skeleton';

const categories = [
  { category_id: 1, name: "Not a real category" },
  { category_id: 2, name: "Pick me" },
  { category_id: 3, name: "Oh i wish that this worked!" },
  { category_id: 4, name: "Me encanto albondigas" },
  { category_id: 5, name: "Surely i'm your best bet" },
];

export default function Marketplace() {
  const [listings, setListings] = useState();
  const [host, setHost] = useState();
  const [loading, setLoading] = useState(false);


  /* fetches the listings from local database */
  useEffect(() => {
    setLoading(true);
    getListings()
      .then((data) => {
        console.log(`results: ${data}`);
        return setListings(data);
      })
      .catch((e) => {
        console.error(`Couldn't get listings: ${e}`);
      });
    return;
  }, []);

  useEffect(() => {
    getHost()
      .then((data) => {
        setHost(data);
        console.log(`Retrieved host successfully ${data}`);
        setLoading(false);
      }).catch((e) => {
        console.error(`Couldn't get host: ${e}`);
      });
  }, []);

  function marketplaceFilter(o) {
    return o.created_by_pk !== host.pk && (o.status === 'unchecked' || o.status === 'available');
  }

  function categoryChips() {
    return categories.map((cat) => {
      return (
        <Chip label={cat.name} key={cat.category_id} />
      );
    });
  }

  if (listings) {
    return (
      <div>
        <Stack spacing={2} sx={{ width: '100%', mt: 2, mb:8 }}>
          <Autocomplete
            id="free-solo-demo"
            freeSolo
            options={listings.map((option) => option.name)}
            renderInput={(params) => <TextField {...params} label="Search" />}
          />
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
            {/* {categoryChips()} */}
          </Stack>
          {loading
          ? <>
              <Skeleton animation="wave" variant="circular" width={40} height={40} />
              <Skeleton animation="wave" height={8} width="80%" style={{ marginBottom: 6 }} />
            </>
          : <ListingList link='/listing' listings={filter(listings, o => marketplaceFilter(o))} />
          }
        </Stack>
      </div>
    );
  } else {
    return (
      <Stack mt={2} spacing={2}>
        <Skeleton mt={2} variant="rectangular" width='100%' height={60} />
        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
        <Skeleton animation="wave" variant="circular" width={40} height={40} />
      </Stack>
    )
  }
}
