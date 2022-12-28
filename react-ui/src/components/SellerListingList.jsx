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
import Skeleton from '@mui/material/Skeleton';


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

function SellerListingList() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [host, setHost] = useState({
    name: '',
    pk: ''
  });

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  useEffect(() => {
    setLoading(true);
    getHost().then((host) => {
      setHost({
        name: host.name,
        pk: host.pk,
      });
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (host.pk) {
      getListings(host.pk)
        .then((data) => {
          setListings(data);
          console.log(`results: ${data}`);
        })
        .catch((e) => {
          console.error(e);
        });
      return;
    }
  }, [host.pk]);

  function filterSent(o) {
    return o.status === 'unavailabkle' && o.sent === 'true';
  }
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="For Sale" {...a11yProps(0)} />
          <Tab label="In Progress" {...a11yProps(1)} />
          <Tab label="Sent" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        {loading ? <Skeleton animation="wave" variant="circular" mtmv my  ={6} width={40} height={40} /> :
          <ListingList link='/listing' listings={filter(listings, o => o.status === 'available')} />
        }
      </TabPanel>
      <TabPanel value={value} index={1}>
        {loading ? <Skeleton animation="wave" variant="circular" width={40} height={40} /> :
          <ListingList link='/listing' listings={filter(listings, o => o.status === 'sold')} />
        }
      </TabPanel>
      <TabPanel value={value} index={2}>
        {loading ? <Skeleton animation="wave" variant="circular" width={40} height={40} /> :
          <ListingList link='/listing' listings={filter(listings, o => filterSent(o))} />
        }
      </TabPanel>
    </Box>
  );
}
export default SellerListingList;
