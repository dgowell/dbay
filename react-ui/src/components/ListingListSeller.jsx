import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import Typography from "@mui/material/Typography";
import ListingList from "./ListingList";
import { getListings } from "../database/listing";
import { getHost } from "../database/settings"
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import filter from 'lodash/filter';
import ListingListSkeleton from "./ListingListSkeleton";

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

function ListingListSeller() {
  const [listings, setListings] = useState(null);
  const [host, setHost] = useState({
    name: '',
    pk: ''
  });

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  useEffect(() => {
    getHost().then((host) => {
      setHost({
        pk: host.pk,
      });
    });
  }, []);

  useEffect(() => {
    if (host.pk) {
      getListings(host.pk)
        .then((data) => {
          setListings(data);
          let latest = [...data].sort((a, b) => b.created_at - a.created_at)[0];
          if(latest.status === 'available' || latest.status === 'pending'){
            setValue(0);
          } else if (latest.status === 'ongoing' || latest.status === 'unconfirmed_payment' || latest.status === 'collection_confirmed' || latest.status === 'paid'){
            setValue(1);
          }else if(latest.status === 'completed'){
            setValue(2);
          }
          console.log(`results:`,latest.status);
        })
        .catch((e) => {
          console.error(e);
        });
      return;
    }
  }, [host.pk]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" centered variant="fullWidth">
          <Tab label="For Sale" {...a11yProps(0)} />
          <Tab label="In Progress" {...a11yProps(1)} />
          <Tab label="Completed" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        {!listings
          ? <ListingListSkeleton />
          : <ListingList link='/seller/listing' listings={filter(listings, o => o.status === 'available')} />
        }
      </TabPanel>
      <TabPanel value={value} index={1}>
        {!listings
          ? <ListingListSkeleton />
          : <ListingList link='/seller/listing/delivery' listings={filter(listings, o => o.status === 'ongoing' || o.status === 'unconfirmed_payment' || o.status === 'collection_confirmed' || o.status === 'paid')} />
        }
      </TabPanel>
      <TabPanel value={value} index={2}>
        {!listings
          ? <ListingListSkeleton />
          : <ListingList link='/seller/listing' listings={filter(listings, o => o.status === 'completed')} />
        }
      </TabPanel>
    </Box>
  );
}
export default ListingListSeller;
