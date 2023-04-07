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
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useNavigate } from "react-router-dom";
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
  const [filterKey, setFilterKey] = useState("");
  const [sort, setSort] = useState(0);
  const navigate = useNavigate();

  const handleSort = (event) => {
    const val= event.target.value;
    console.log(val);
    var sort =[];
    if (val==2){
     sort = [...listings].sort((a, b) => b.price - a.price)
    }else{
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

  function handleSearch(e){
    setFilterKey(e.target.value);
  }

  if (listings) {
    return (
      <div>
        <Stack spacing={2} sx={{ width: '100%', mt: 2, mb:8 }}>
          <Autocomplete
            id="free-solo-demo"
            freeSolo
            options={listings.map((option) => option.title)}
            renderInput={(params) => <TextField {...params}  onChange={(e)=>handleSearch(e)} placeholder={"search..."}  InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }} />}
          />
              <Stack  component="ul" direction="row" sx={{ml:20}} >
                <FormControl sx={{ml:"60%",fontSize:"10px"}}  fullWidth>
                <InputLabel id="demo-simple-select-label"></InputLabel>
                  <Select
                    sx={{borderRadius:5,background:"#D9D9D9",height:"50%"}}
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="sorting"
                    value={sort}
                    onChange={handleSort}
                  >
                    <MenuItem disabled value={0}>Sort By</MenuItem>
                    <MenuItem value={1}>low-high</MenuItem>
                    <MenuItem value={2}>high-low</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
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
          // : <ListingList link='/listing' listings={filter(listings, o => marketplaceFilter(o)).filter((i)=>i.title.includes(filterKey))} />
        : <>
      <ImageList sx={{ width:"100%"}}>
      {filter(listings, o => marketplaceFilter(o)).filter((i)=>i.title.toLowerCase().includes(filterKey.toLowerCase())).map((item,ind) => (
        <ImageListItem sx={{height:"153px"}} key={"list_"+ind}>
          <img 
            onClick={()=>navigate(`/listing/${item.listing_id}`)}
            src={`${item.image.split("(+_+)")[0]}`}
            srcSet={`${item.image.split("(+_+)")[0]}`}
            alt={item.title}
            loading="lazy"
            style={{
              height: "153px",
              borderRadius: "15px",
              left: "0",
              right: "0",
              top: "0",
              bottom: "0",
              objectFit: "cover"
            }}
          />
          <ImageListItemBar
          sx={{ background: "rgba(0, 0, 0, 0)"}}
          position="top"
          actionPosition="left"
            actionIcon={
              <>
              {item.collection==='true' && (item.status === 'available' || item.status === 'pending' || item.status === 'unchecked')
            ?               <IconButton
              size="small"
              sx={{ color: '#333333',background:"rgba(255,255,255,0.5)" }}
            >
              <LocationOnOutlinedIcon fontSize="2px"/>
            </IconButton>
            : null}
          {item.delivery==='true' && (item.status === 'available' || item.status === 'pending' || item.status === 'unchecked')
            ?               <IconButton
                size="small"
                sx={{ color: '#333333',background:"rgba(255,255,255,0.5)" }}
              >
                <LocalShippingOutlinedIcon fontSize="2px"/>
              </IconButton>
            : null}
          {item.transmission_type === "collection" && (item.status === 'sold' || item.status === 'in progress')
            ?               <IconButton
              size="small"
              sx={{ color: '#333333',background:"rgba(255,255,255,0.5)" }}
            >
              <LocationOnOutlinedIcon fontSize="2px"/>
            </IconButton>
            : null}
          {item.transmission_type === "delivery" && (item.status === 'sold' || item.status === 'in progress')
            ?                <IconButton
                size="small"
                sx={{ color: '#333333',background:"rgba(255,255,255,0.5)" }}
              >
                <LocalShippingOutlinedIcon fontSize="2px"/>
              </IconButton>
            : null}


            </>
            }
          />
          <ImageListItemBar
            title={"$M"+item.price}
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
