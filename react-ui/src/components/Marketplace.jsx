import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { getListings } from "../database/listing";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import filter from 'lodash/filter';
import { getHost } from '../database/settings';
import Skeleton from '@mui/material/Skeleton';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import { addContact, isContact } from "../minima";

const WILL_MAX_ADDRESS = 'MAX#0x30819F300D06092A864886F70D010101050003818D00308189028181008D376185509BDAC51FF82EF97152C3B01A685321FF6A9902D75133B988006C2CD3051AC57E89EBFAFF8A48516C0B550D2979181638DC77BDEE7E3D25CE5C66F5CFBBBFB307A990A779AD100DB4AE0FB11D5BDD9A2EAC5FED1D84747CF1C63B4E33429EEB8C53F2742092EF4C9A1A0140EE84F059E252A49F6125D85E059E2C1B0203010001#MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G16KD3ADUVWE789VEVFHC9A9Z4YC2T1JFQYCWNRS41VPQWJFKW2BMGQFRJ6GDMT0TG5KVNG2WQ0PVCE99Z30BCH85KAV1B7PNY8E4A45BCQYP4PU3AQ06BESHA9YWBQND6YVEF74P9FW7EHCUT31ZDTZ4145F5EWURCD91HEP8VY2P4F2SY808PYABMZVKK6R4M72TCKCSRHN1K10608006C2AE9F@31.125.188.214:9001';
const WILL_PK = '0x30819F300D06092A864886F70D010101050003818D00308189028181008D376185509BDAC51FF82EF97152C3B01A685321FF6A9902D75133B988006C2CD3051AC57E89EBFAFF8A48516C0B550D2979181638DC77BDEE7E3D25CE5C66F5CFBBBFB307A990A779AD100DB4AE0FB11D5BDD9A2EAC5FED1D84747CF1C63B4E33429EEB8C53F2742092EF4C9A1A0140EE84F059E252A49F6125D85E059E2C1B0203010001';

export default function Marketplace() {
  const [listings, setListings] = useState();
  const [host, setHost] = useState();
  const [loading, setLoading] = useState(false);
  const [filterKey, setFilterKey] = useState("");
  const [sort, setSort] = useState(0);
  const navigate = useNavigate();

  const handleSort = (event) => {
    const val = event.target.value;
    console.log(val);
    var sort = [];
    if (val === 2) {
      sort = [...listings].sort((a, b) => b.price - a.price)
    } else {
      sort = [...listings].sort((a, b) => a.price - b.price)
    }
    setListings(sort)
    setSort(val);
  };

  /* fetches the listings from local database */
  useEffect(() => {
    setLoading(true);
    getListings()
      .then((data) => {
        console.log(`results:`, data);
        const sort = [...data].sort((a, b) => b.created_at - a.created_at)
        return setListings(sort);
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

  /* add will as a contact */
  useEffect(() => {
    async function check() {
      //check for specific contact
      if (await isContact(WILL_PK)) {
        console.log("Will Dbay is already a contact");
      } else {
        addContact(WILL_MAX_ADDRESS);
      }
    }
    check();
  },[]);


  function marketplaceFilter(o) {
    return (o.status === 'unchecked' || o.status === 'available');
    //return o.created_by_pk !== host.pk && (o.status === 'unchecked' || o.status === 'available');
  }

  function handleSearch(e) {
    setFilterKey(e.target.value);
  }

  if (listings) {
    return (
      <Box mt={2} sx={{ flexGrow: 1 }}>
        <Autocomplete
          id="free-solo-demo"
          freeSolo
          options={listings.map((option) => option.title)}
          renderInput={(params) => <TextField {...params} onChange={(e) => handleSearch(e)} placeholder={"search..."} InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="start">
                <FormControl variant="standard" sx={{ fontSize: "10px" }} fullWidth>
                  <Select
                    id="sort-marketplace"
                    onChange={handleSort}
                    label="Sort by"
                    value=""
                    className="select-sort"
                    IconComponent={SortIcon}
                  >
                    <MenuItem value={1}>lowest price</MenuItem>
                    <MenuItem value={2}>highest price</MenuItem>
                  </Select>
                </FormControl>
              </InputAdornment>
            )
          }} />}
        />



        {loading
          ? <>
            <Skeleton animation="wave" variant="circular" width={40} height={40} />
            <Skeleton animation="wave" height={8} width="80%" style={{ marginBottom: 6 }} />
          </>
          // : <ListingList link='/listing' listings={filter(listings, o => marketplaceFilter(o)).filter((i)=>i.title.includes(filterKey))} />
          : <>
            <Grid container mt={1} rowSpacing={2} columnSpacing={{ xs: 2, sm: 3, md: 3 }}>
              {filter(listings, o => marketplaceFilter(o)).filter((i) => i.title.toLowerCase().includes(filterKey.toLowerCase())).map((item, ind) => (
                <Grid item xs={6} sx={{ position: 'relative' }}>
                  <div style={{ maxWidth: "200px", height: "150px", overflow: "hidden" }}>
                    <img
                      onClick={() => item.created_by_pk !== host.pk ? navigate(`/listing/${item.listing_id}`) : navigate(`/seller/listing/${item.listing_id}`)}
                      src={`${item.image.split("(+_+)")[0]}`}
                      srcSet={`${item.image.split("(+_+)")[0]}`}
                      alt={item.title}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "5px",
                        objectFit: "cover"
                      }}
                    />
                  </div>
                  <div style={{ position: "absolute", left: '15px', top: '15px' }}>
                    {item.created_by_pk === host.pk ? <Button
                      size="small"
                      sx={{ color: 'black', background: "rgba(255,255,255,0.7)" }}
                    >YOUR ITEM</Button> : null}
                  </div>
                  <div style={{ position: "absolute", right: '3px', marginTop: '-37px' }}>
                    {item.collection === 'true' && (item.status === 'available' || item.status === 'pending' || item.status === 'unchecked')
                      ? <IconButton
                        size="small"
                        sx={{ color: '#333333', background: "rgba(255,255,255,0.7)" }}
                      >
                        <LocationOnOutlinedIcon fontSize="2px" />
                      </IconButton>
                      : null}
                    {item.delivery === 'true' && (item.status === 'available' || item.status === 'pending' || item.status === 'unchecked')
                      ? <IconButton
                        size="small"
                        sx={{ ml: "3px", color: '#333333', background: "rgba(255,255,255,0.7)" }}
                      >
                        <LocalShippingOutlinedIcon fontSize="2px" />
                      </IconButton>
                      : null}
                    {item.transmission_type === "collection" && (item.status === 'sold' || item.status === 'in progress')
                      ? <IconButton
                        size="small"
                        sx={{ color: '#333333', background: "rgba(255,255,255,0.7)" }}
                      >
                        <LocationOnOutlinedIcon fontSize="2px" />
                      </IconButton>
                      : null}
                    {item.transmission_type === "delivery" && (item.status === 'sold' || item.status === 'in progress')
                      ? <IconButton
                        size="small"
                        sx={{ color: '#333333', background: "rgba(255,255,255,0.7)" }}
                      >
                        <LocalShippingOutlinedIcon fontSize="2px" />
                      </IconButton>
                      : null}
                  </div>
                  <ImageListItemBar
                    title={"$M" + item.price}
                    subtitle={<span>{item.title}</span>}
                    position="below"
                  />
                </Grid>
              ))}
            </Grid>
          </>
        }
      </Box>
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
