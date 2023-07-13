import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import Typography from "@mui/material/Typography";
import ListingList from "../components/ListingList";
import { getMyPurchases } from "../database/listing";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import filter from 'lodash/filter';
import ListingListSkeleton from "./ListingListSkeleton";
import { getPublicKey } from "../minima";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


function Purchases() {
  const [listings, setListings] = useState([]);


  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    getPublicKey().then((myAddress) => {
      getMyPurchases(myAddress)
        .then((data) => {
          setListings(data);
          let latest = [...data].sort((a, b) => b.created_at - a.created_at)[0];
          if (latest.status === 'in_progress' || latest.status === 'collection_rejected' || latest.status === 'pending_confirmation') {
            setValue(0);
          } else if (latest.status === 'completed') {
            setValue(1);
          }
          console.log(`results:`, latest.status);
        })
        .catch((e) => {
          console.error(e);
        });
      return;
    });
  }, []);

  if (listings) {
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} variant="fullWidth" aria-label="basic tabs example" centered>
            <Tab label="OnGoing" {...a11yProps(0)} />
            <Tab label="Purchased" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          {!listings
            ? <ListingListSkeleton />
            : <ListingList link={`/listing/transmission`} listings={filter(listings, o => o.status === 'in_progress' || o.status === 'pending_confirmation')} />
          }
        </TabPanel>
        <TabPanel value={value} index={1}>
          {!listings
            ? <ListingListSkeleton />
            : <ListingList link='/listing' listings={filter(listings, o => o.status === 'completed')} />
          }
        </TabPanel>
      </Box>
    );
  } else {
    return null;
  }
}
export default Purchases;
