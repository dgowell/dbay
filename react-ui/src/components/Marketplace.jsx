import React, { useEffect, useState } from "react";
import ListingList from "../components/ListingList";
import Autocomplete from "@mui/material/Autocomplete";
import { getListings } from "../database/listing";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import filter from 'lodash/filter';
import { getHost } from '../database/settings';
import Skeleton from '@mui/material/Skeleton';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
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
import Popover from '@mui/material/Popover';

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
    if (val == 2) {
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
        console.log(`results:`,data);
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

  function marketplaceFilter(o) {
    return o.created_by_pk !== host.pk && (o.status === 'unchecked' || o.status === 'available');
  }

  function handleSearch(e) {
    setFilterKey(e.target.value);
  }

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;



  if (listings) {
    return (
      <div>
        <Stack spacing={2} sx={{ width: '100%', mt: 2, mb: 8 }}>
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
              <ImageList  gap="20px" sx={{ width: "100%" }}>
                {filter(listings, o => marketplaceFilter(o)).filter((i) => i.title.toLowerCase().includes(filterKey.toLowerCase())).map((item, ind) => (
                  <ImageListItem sx={{ height: "153px" }} key={"list_" + ind}>
                    <img
                      onClick={() => navigate(`/listing/${item.listing_id}`)}
                      src={`${item.image.split("(+_+)")[0]}`}
                      srcSet={`${item.image.split("(+_+)")[0]}`}
                      alt={item.title}
                      loading="lazy"
                      style={{
                        height: "153px",
                        borderRadius: "5px",
                        left: "0",
                        right: "0",
                        top: "0",
                        bottom: "0",
                        objectFit: "cover"
                      }}
                    />
                    <ImageListItemBar
                      sx={{ background: "rgba(0, 0, 0, 0)",
                      top:"120px", right:"5px" }}
                      position="top"
                      actionPosition="right"
                      actionIcon={
                        <>
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


                        </>
                      }
                    />
                    <ImageListItemBar
                      title={"$M" + item.price}
                      subtitle={<span>{item.title}</span>}
                      position="below"
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </>
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
