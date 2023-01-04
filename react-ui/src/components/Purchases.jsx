import React, { useEffect, useState } from "react";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ListingList from "../components/ListingList";
import { getMyPurchases } from "../database/listing";


function Purchases() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    getMyPurchases()
      .then((data) => {
        setListings(data);
        console.log(`results: ${data}`);
      })
      .catch((e) => {
        console.error(e);
      });
    return;
  }, []);

  if (listings) {
    return (
      <div>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            My Purchases
          </Typography>
          <ListingList link='/listing' listings={listings} />
        </CardContent>
      </div>
    );
  } else {
    return null;
  }
}
export default Purchases;
