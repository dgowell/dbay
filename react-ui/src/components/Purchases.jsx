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
       <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} variant="fullWidth" aria-label="basic tabs example" centered>
          <Tab label="On Going" {...a11yProps(0)} />
          <Tab label="Purchased" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        {!listings
          ? <ListingListSkeleton />
          : <ListingList link={`/listing/transmission`} listings={filter(listings, o => o.status === 'in progress')} />
        }
      </TabPanel>
      <TabPanel value={value} index={1}>
        {!listings
          ? <ListingListSkeleton />
          : <ListingList link='/listing' listings={filter(listings, o => o.status === 'purchased')} />
        }
      </TabPanel>
    </Box>
    );
  } else {
    return null;
  }
}
export default Purchases;
