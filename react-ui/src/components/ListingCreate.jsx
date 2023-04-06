import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import { createListing } from "../database/listing";
import { getHost } from "../database/settings";
import { sendListingToContacts, getMiniAddress } from '../minima';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { PhotoCamera } from "@mui/icons-material";
import ConeSvg from "../assets/images/cone.svg"
import ConeSvg2 from "../assets/images/cone2.svg"
import ConeSvg3 from "../assets/images/cone3.svg"
import imageCompression from 'browser-image-compression';
import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import UserWebCam from "./UserWebCam";
import Switch from '@mui/material/Switch';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import countryList from 'react-select-country-list'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

const validationSchema = yup.object({
  title: yup
    .string('Enter listing title')
    .max(50, 'Title is too long')
    .required('Title is required'),
  askingPrice: yup
    .number('Enter the price')
    .positive('Price must be at least 1 minima')
    .min(1, 'Price should be at least 1 minima')
    .max(100000000000, 'Price should be below 100000000000 minima')
    .required('Price is required'),
  ///description: yup.string('Description').required('Description is required'),
});

export default function ListingCreate() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCoordinates, setLoadingCoorindates] = useState(false);
  const [host, setHost] = useState();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const options = useMemo(() => countryList().getData(), []);

  const handleModalOpen = (i) => {
    if (i === 0 || images[i - 1] !== undefined) {
      setCurrentIndex(i);
      setOpenModal(true);
    }
  };

  const handleModalClose = (i) => {
    if (i === -1) {
      setOpenModal(false);
      return false;
    }
    let temp = [...images];
    temp.splice(i, 1);
    setImages(temp);
    setOpenModal(false);
  };

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setCountries(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      askingPrice: 0,
      delivery: false,
      collection: false,
      deliveryCost: 0,
      deliveryCountries: [''],
      description:''
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  useEffect(() => {
    getHost().then((host) => {
      setHost(host);
    });
  }, []);

  useEffect(() => {
    async function getWalletAddress() {
      setWalletAddress(await getMiniAddress().catch((e) => console.error(`Get Mini address failed: ${e}`)));
    }
    getWalletAddress().catch((e) => console.error(`Get wallet address failed: ${e}`));
  }, []);

  //create the listing in the db
  async function onSubmit(e) {
    setLoading(true);
    setError(null);

    // When a post request is sent to the create url, we'll add a new record to the database.
    const newListing = { ...formik.values };
    console.log("des",newListing.description)
    let id = "";
    createListing({
      title: newListing.title.replace(/'/g,"''"),
      price: newListing.askingPrice,
      createdByPk: host.pk,
      createdByName: host.name,
      walletAddress: walletAddress,
      image: images.join("(+_+)"),
      description: newListing.description.replace(/'/g,"''") ?? '',
      collection: newListing.collection,
      delivery: newListing.delivery,
      location: JSON.stringify(location),
      shippingCost: newListing.deliveryCost,
      shippingCountries: countries.toString()
    }).then(function (listingId) {
        id = listingId;
        console.log(`Listing successfully added: ${listingId}`);
        console.log(`Attempting to send listing to contacts...`);
        return sendListingToContacts(listingId);
      }).then((result) => {
        if (result.message) {
          setError(`Could not send listing to contacts`);
          console.error(result.message);
          setLoading(false);
        } else {
          console.log('Successfully sent listing to contacts');
          setLoading(false);
          setSuccess(true);
          console.log(`/seller/listing/${id}`);
          setTimeout(() => {
            navigate(`/info`,{state:{main:"Successfully published!",sub:"your listing is now published over the minima it may take some time to be available to the other minimalists"}});
          },100);
        }
      }).catch((e) => {
        setError(`There was an error creating or sending your listing`);
        console.error(`Could not create or send listing ${e}`);
        setLoading(false);
      });
  }

  const handleGoHome = () => {
    navigate(-1);
  }

  function handleLocation() {
    setLoadingCoorindates(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.error("Geolocation is not supported by this browser.");
      setLoadingCoorindates(false);
    }

    function showPosition(position) {
      setLocation({
        latitude: (position.coords.latitude.toFixed(3)),
        longitude: (position.coords.longitude.toFixed(3))
      });
      setLoadingCoorindates(false);
    }
  }
  const fileToDataUri = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  })

  const handleUpload = async (e, i) => {
    let temp = [...images];
    if (e.target.files) {
      const imageFile = e.target.files[0];
      console.log('originalFile instanceof Blob', imageFile instanceof Blob); // true
      console.log(`originalFile size ${imageFile.size / 1024} KB`);
      const options = {
        maxSizeMB: 0.03,
        maxWidthOrHeight: 828,
        useWebWorker: true
      }
      try {
        const compressedFile = await imageCompression(imageFile, options);
        console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
        console.log(`compressedFile size ${compressedFile.size / 1024} KB`); // smaller than maxSizeMB
        const smp = await fileToDataUri(compressedFile);
        temp[i] = smp;
        setImages(temp);
      } catch (error) {
        console.log(error);
        setError('File is not Image');
      }
      //handleModalClose(-1)console
    }
  }


  if (walletAddress && host) {
    // This following section will display the form that takes the input from the user.
    return (
      <Box
        sx={{
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography sx={{fontSize:'24px'}}  gutterBottom>
          Create new listing
        </Typography>
        <Box
          component="form"
          sx={{ mt: 3 }}
          noValidate
          autoComplete="off"
          onSubmit={formik.handleSubmit}
        >


          <Grid container maxWidth={"sm"} rowGap={4} style={{ width: "100%", justifyContent: "space-between", padding: "1rem 0", textAlign: "center" }}>
            <Grid xs={5.5} component="label" color="primary" style={{ color: "black", position: "relative", height: "140px" }}>
              {images[0] ? <img src={images[0]} alt="" style={{
                width: "100%",
                height: "100%",
                borderRadius: "15px",
                left: "0",
                right: "0",
                top: "0",
                bottom: "0",
                objectFit: "cover"
              }} /> : <Box style={{ textAlign: "center", padding: "2rem 2rem 0.5rem", borderRadius: "15px", border: "0.25px solid rgba(30, 51, 238, 0.47)", height: "100%" }}>
                <Box ><PhotoCamera /></Box>
                <Box>
                  <span>Image Upload</span>
                  <p style={{ margin: "0", color: "#4B4949", fontSize: "12px" }}>Primary Photo</p>
                </Box>
              </Box>}
              {/* <input type="file" accept="image/*" onChange={(e)=>{handleUpload(e,0)}} hidden/> */}
              <button type="Button" onClick={() => { handleModalOpen(0) }} hidden />
            </Grid>
            <Grid xs={5.5} component="label" color="primary" style={{ color: "black", position: "relative", height: "140px" }}>
              {images[1] ? <img src={images[1]} alt="" style={{
                width: "100%",
                height: "100%",
                borderRadius: "15px",
                left: "0",
                right: "0",
                top: "0",
                bottom: "0",
                objectFit: "cover"
              }} /> : <Box style={{ textAlign: "center", padding: "2rem 2rem 0.5rem", borderRadius: "15px", background: "#EFEEEE", border: "0.25px solid #EEEEEE", height: "100%" }}>
                <Box style={{ border: "0.25px dashed #000000", width: "75px", margin: "auto", marginBottom: "15px", display: "flex", justifyContent: "center" }}>
                  <img src={ConeSvg2} alt={'cone'} style={{ margin: "5%" }} />
                </Box>
                <Box>
                  <p style={{ margin: "0", color: "#888787", fontSize: "12px" }}>Second Photo</p>
                </Box>
              </Box>}
              {/* <input type="file" accept="image/*" onChange={(e)=>{handleUpload(e,1)}} hidden/> */}
              <button type="Button" onClick={() => handleModalOpen(1)} hidden />
            </Grid>
            <Grid xs={5.5} component="label" color="primary" style={{ color: "black", position: "relative", height: "140px" }}>
              {images[2] ? <img src={images[2]} alt="" style={{
                width: "100%",
                height: "100%",
                borderRadius: "15px",
                left: "0",
                right: "0",
                top: "0",
                bottom: "0",
                objectFit: "cover"
              }} /> : <Box style={{ textAlign: "center", padding: "2rem 2rem 0.5rem", borderRadius: "15px", background: "#EFEEEE", border: "0.25px solid #EEEEEE ", height: "100%" }}>
                <Box style={{ border: "0.25px dashed #000000", width: "75px", margin: "auto", marginBottom: "15px", display: "flex", justifyContent: "center" }}>
                  <img src={ConeSvg3} alt={'cone'} style={{ margin: "5%" }} />
                </Box>
                <Box>
                  <p style={{ margin: "0", color: "#888787", fontSize: "12px" }}>Third Photo</p>
                </Box>
              </Box>}
              {/* <input type="file" accept="image/*" onChange={(e)=>{handleUpload(e,2)}} hidden/> */}
              <button type="Button" onClick={() => handleModalOpen(2)} hidden />
            </Grid>
            <Grid xs={5.5} component="label" color="primary" style={{ color: "black", position: "relative", height: "140px" }}>
              {images[3] ? <img src={images[3]} alt="" style={{
                width: "100%",
                height: "100%",
                borderRadius: "15px",
                left: "0",
                right: "0",
                top: "0",
                bottom: "0",
                objectFit: "cover"
              }} /> : <Box style={{ textAlign: "center", padding: "2rem 2rem 0.5rem", borderRadius: "15px", background: "#EFEEEE", border: "0.25px solid #EEEEEE ", height: "100%" }}>
                <Box style={{ border: "0.25px dashed #000000", width: "75px", margin: "auto", marginBottom: "15px", display: "flex", justifyContent: "center" }}>
                  <img src={ConeSvg} alt={'cone'} style={{ margin: "5%" }} />
                </Box>
                <Box>
                  <p style={{ margin: "0", color: "#888787", fontSize: "12px" }}>Fourth Photo</p>
                </Box>
              </Box>}
              {/* <input type="file" accept="image/*" onChange={(e)=>{handleUpload(e,3)}} hidden/> */}
              <button type="Button" onClick={() => handleModalOpen(3)} hidden />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Listing Title"
                id="title"
                name="title"
                className="form-field"
                type="text"
                required
                fullWidth
                value={formik.values.title}
                onChange={formik.handleChange}
                variant="outlined"
                error={formik.touched.title }
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel htmlFor="asking-price">Asking Price *</InputLabel>
                <OutlinedInput
                  label="Asking Price"
                  id="askingPrice"
                  name="askingPrice"
                  // value={formik.values.askingPrice}
                  required
                  onChange={formik.handleChange}
                  startAdornment={
                    <InputAdornment position="start">$M</InputAdornment>
                  }
                  error={formik.touched.askingPrice && Boolean(formik.errors.askingPrice)}
                />
                <FormHelperText error={formik.touched.askingPrice && Boolean(formik.errors.askingPrice)}>
                  {formik.touched.askingPrice && formik.errors.askingPrice}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
            <FormControl sx={{ gap: 1,width:'100%' }}>
                <TextField
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  sx={{ width: '100%' }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl required
                fullwidth
                component="fieldset"
                error={formik.touched.delivery && Boolean(formik.errors.delivery)}
                sx={{ m: 3 }}
                variant="standard">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch checked={formik.values.collection} onChange={formik.handleChange} name="collection" />
                    }
                    label="Collection"
                  />
                  {formik.values.collection ?

                      <Paper sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        p:2,
                        gap:2,
                        mt:3,
                        mb:3
                      }}elevation={2}>
                        <Typography>You must add coordinates to your listing in order to make the item available for collection. This makes the listing searchable.</Typography>
                        <LoadingButton className={"custom-loading"} mt={2} loading={loadingCoordinates} variant="contained" onClick={handleLocation}>Add Coordinates</LoadingButton>
                        {location.latitude !== ''
                          ?  <Alert variant="success">Coorindates added!</Alert>
                          : null}
                      </Paper>

                    : null}
                  <FormControlLabel
                    control={
                      <Switch checked={formik.values.delivery} onChange={formik.handleChange} name="delivery" />
                    }
                    label="Delivery"
                  />
                  {formik.values.delivery ?
                    <Paper sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      p: 2,
                      gap: 2,
                      mt: 3,
                      mb: 3,
                      maxWidth: 367
                    }} elevation={2}>
                    <FormControl fullWidth>
                      <InputLabel htmlFor="delivery-cost">Delivery Cost</InputLabel>
                      <OutlinedInput
                        label="Delivery Cost"
                        id="deliveryCost"
                        name="deliveryCost"
                       // value={formik.values.deliveryCost}
                        onChange={formik.handleChange}
                        startAdornment={
                          <InputAdornment position="start">$M</InputAdornment>
                        }
                        error={formik.touched.deliveryCost && Boolean(formik.errors.deliveryCost)}
                      />
                      <FormHelperText error={formik.touched.deliveryCost && Boolean(formik.errors.deliveryCost)}>
                        {formik.touched.deliveryCost && formik.errors.deliveryCost}
                      </FormHelperText>
                    </FormControl>
                      <FormControl fullWidth>
                        <InputLabel htmlFor="delivery-countries">Which Countries?</InputLabel>
                        <Select 
                          labelId="Deliverable countries"
                          id="shippingCountries"
                          multiple
                          value={countries}
                          onChange={handleChange}
                          input={<OutlinedInput label="Which countries?" />}
                          MenuProps={MenuProps}
                        > 
                          {options.map((country) => (
                          <MenuItem
                            key={country.value}
                            value={country.label}
                          >
                            {country.label}
                          </MenuItem>
                        ))} 
                        </Select>
                    </FormControl>
                    </Paper>
                  : null }
                </FormGroup>
              </FormControl>
            </Grid>
          </Grid>
          <Grid style={{ marginBottom: "20%" }}>
            <LoadingButton className={"custom-loading"}
              fullWidth
              variant="contained"
              type="submit"
              value="Create Token"
              loading={loading}
              loadingPosition="end"
              sx={{ mt: 3, mb: 2 }}
            >
              Publish
            </LoadingButton>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert action={
              <Button color="inherit" size="small" onClick={handleGoHome}>
                OK
              </Button>
            } severity="success">Listing created and shared!</Alert> : null}
          </Grid>
        </Box>
        <Dialog
          fullScreen={fullScreen}
          open={openModal}
          onClose={handleModalClose}
          aria-labelledby="responsive-dialog-title"
        >
          <Box alignContent="center">
            <UserWebCam handleUpload={handleUpload} index={currentIndex} images={images} setImages={setImages} close={handleModalClose} />
          </Box>
        </Dialog>
      </Box>
    );
  }
  else {
    return (
      <Stack mt={4} spacing={1}>
        {/* For variant="text", adjust the height via font-size */}
        <Skeleton variant="text" sx={{ fontSize: '2rem' }} />
        {/* For other variants, adjust the size with `width` and `height` */}
        <Skeleton variant="rounded" width='100%' height={60} />
        <Skeleton variant="rounded" width='100%' height={60} />
        <Skeleton variant="rounded" width='100%' height={60} />
      </Stack>
    );
  }
}
