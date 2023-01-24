import React, { useState, useEffect } from "react";
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
import TextareaAutosize from '@mui/base/TextareaAutosize';
import { PhotoCamera } from "@mui/icons-material";
import ConeSvg from "../assets/images/cone.svg"
import ConeSvg2 from "../assets/images/cone2.svg"
import ConeSvg3 from "../assets/images/cone3.svg"
import imageCompression from 'browser-image-compression';
import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import UserWebCam from "./UserWebCam";


import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import { FormErrors } from './FormErrors';
import { useFormik } from 'formik';
import * as yup from 'yup';

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
  aftersaleOptions: yup
    .array()
    .min(1, 'At least one option be selected')
});

export default function ListingCreate() {

  const [loading, setLoading] = useState(false);
  const [host, setHost] = useState();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    name: "",
    asking_price: "",
  });
  const [openModal, setOpenModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  console.log("screen:",fullScreen);
  const handleModalOpen = (i) => {
    if(i===0 || images[i-1]!==undefined){
    setCurrentIndex(i);
    setOpenModal(true);
    }
  };

  const handleModalClose = (i) => {
    if(i===-1){
      setOpenModal(false);
      return false;
    }
    console.log(i);
    let temp=[...images];
    temp.splice(i,1);
    setImages(temp);
    setOpenModal(false);
  };

  const [images,setImages]=useState([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [success, setSuccess] = useState(null);
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      title: '',
      askingPrice: 0,
      aftersaleOptions: []
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

  // This function will handle the submission.
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // When a post request is sent to the create url, we'll add a new record to the database.
    const newListing = { ...form };
    var l_id = "test";
    createListing({
      title: newListing.title,
      price: newListing.askingPrice,
      createdByPk: host.pk,
      createdByName: host.name,
      walletAddress: walletAddress,
      image:images.join("(+_+)"),
      description:newListing.description ?? ''
    }).then(function(listingId) {
        l_id=listingId;
      collection: newListing.collection,
      delivery: newListing.delivery
    })
      .then(function (listingId) {
        console.log(`Listing successfully added: ${listingId}`);
        console.log('Successfully sent listing to contacts');
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
          setForm({ name: "", asking_price: "",description:"" });
          setSuccess(true);
          console.log('/seller/listing/${l_id}');
          setTimeout(() => {
            navigate(`/seller/listing/${l_id}`);
          }, 500); 
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    function showPosition(position) {
      setLocation("Latitude: " + position.coords.latitude +
        " Longitude: " + position.coords.longitude);
    }
  }
  const fileToDataUri = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    })
  const handleUpload=async (e,i)=>{
    let temp =[...images];
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
          temp[i] =smp;
         setImages(temp);
      } catch (error) {
        console.log(error);
        setError('File is not Image');
      }
      //handleModalClose(-1)
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
        <Typography variant="h4" gutterBottom>
          Create New Listing
        </Typography>
        <Box
          component="form"
          sx={{ mt: 3 }}
          noValidate
          autoComplete="off"
          onSubmit={formik.handleSubmit}
        >


          <Grid container maxWidth={"sm"} rowGap={4} style={{width: "100%",justifyContent: "space-between", padding:"1rem 0",textAlign:"center"}}>
          <Grid xs={5.5} component="label" color="primary" style={{color:"black", position: "relative",height:"140px"}}>
            { images[0] ? <img src={images[0]} alt="" style={{
              width:"100%",
              height:"100%",
              borderRadius:"15px",
              left: "0",
              right: "0",
              top: "0",
              bottom: "0",
              objectFit: "cover"
              }} /> :  <Box style={{textAlign: "center",padding: "2rem 2rem 0.5rem", borderRadius: "15px", background:"rgba(30, 51, 238, 0.47)", border: "0.25px solid rgba(30, 51, 238, 0.47)",height:"100%" }}>
                  <Box ><PhotoCamera /></Box>
                  <Box>
                    <span>Image Upload</span>
                    <p style={{margin: "0",color:"#4B4949", fontSize: "12px"}}>Primary Photo</p>
                  </Box>
              </Box>}
            {/* <input type="file" accept="image/*" onChange={(e)=>{handleUpload(e,0)}} hidden/> */}
            <button type="Button" onClick={()=>{handleModalOpen(0)}} hidden/>
          </Grid>
          <Grid xs={5.5} component="label" color="primary" style={{color:"black", position: "relative",height:"140px"}}>
             {images[1] ? <img src={images[1]} alt="" style={{
              width:"100%",
              height:"100%",
              borderRadius:"15px",
              left: "0",
              right: "0",
              top: "0",
              bottom: "0",
              objectFit: "cover"}} /> : <Box style={{textAlign: "center",padding: "2rem 2rem 0.5rem", borderRadius: "15px", background:"#EFEEEE", border: "0.25px solid #EEEEEE", height: "100%"}}>
                  <Box style={{border: "0.25px dashed #000000", width: "75px", margin: "auto", marginBottom: "15px", display:"flex", justifyContent: "center"}}>
                    <img src={ConeSvg2} alt={'cone'} style={{margin:"5%"}}/>
                  </Box>
                  <Box>
                    <p style={{margin: "0",color:"#888787", fontSize: "12px"}}>Secound Photo</p>
                  </Box>
              </Box>}
            {/* <input type="file" accept="image/*" onChange={(e)=>{handleUpload(e,1)}} hidden/> */}
            <button type="Button" onClick={()=>handleModalOpen(1)} hidden/>
          </Grid>
          <Grid xs={5.5} component="label" color="primary" style={{color:"black", position: "relative",height:"140px"}}>
           {images[2] ? <img src={images[2]} alt="" style={{
              width:"100%",
              height:"100%",
              borderRadius:"15px",
              left: "0",
              right: "0",
              top: "0",
              bottom: "0",
              objectFit: "cover"}} /> :   <Box style={{textAlign: "center",padding: "2rem 2rem 0.5rem", borderRadius: "15px", background:"#EFEEEE", border: "0.25px solid #EEEEEE ",height:"100%"}}>
                  <Box style={{border: "0.25px dashed #000000", width: "75px", margin: "auto", marginBottom: "15px", display:"flex", justifyContent: "center"}}>
                    <img src={ConeSvg3} alt={'cone'}  style={{margin:"5%"}}/>
                  </Box>
                  <Box>
                    <p style={{margin: "0",color:"#888787", fontSize: "12px"}}>Third Photo</p>
                  </Box>
              </Box>}
            {/* <input type="file" accept="image/*" onChange={(e)=>{handleUpload(e,2)}} hidden/> */}
            <button type="Button" onClick={()=>handleModalOpen(2)} hidden/>
          </Grid>
          <Grid xs={5.5} component="label" color="primary" style={{color:"black", position: "relative",height:"140px"}}>
            {images[3] ? <img src={images[3]} alt="" style={{
              width:"100%",
              height:"100%",
              borderRadius:"15px",
              left: "0",
              right: "0",
              top: "0",
              bottom: "0",
              objectFit: "cover"}} /> :  <Box style={{textAlign: "center",padding: "2rem 2rem 0.5rem", borderRadius: "15px", background:"#EFEEEE", border: "0.25px solid #EEEEEE ",height:"100%"}}>
                  <Box style={{border: "0.25px dashed #000000", width: "75px", margin: "auto", marginBottom: "15px", display:"flex", justifyContent: "center"}}>
                    <img src={ConeSvg} alt={'cone'} style={{margin:"5%"}} />
                  </Box>
                  <Box>
                    <p style={{margin: "0",color:"#888787", fontSize: "12px"}}>Fourth Photo</p>
                  </Box>
              </Box>}
            {/* <input type="file" accept="image/*" onChange={(e)=>{handleUpload(e,3)}} hidden/> */}
            <button type="Button" onClick={()=>handleModalOpen(3)} hidden/>
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
                error={formik.touched.title && Boolean(formik.errors.title)}
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
                  value={formik.values.askingPrice}
                  required
                  onChange={formik.handleChange}
                  startAdornment={
                    <InputAdornment position="start">MIN</InputAdornment>
                  }
                  error={formik.touched.askingPrice && Boolean(formik.errors.askingPrice)}
                />
                <FormHelperText error={formik.touched.askingPrice && Boolean(formik.errors.askingPrice)}>
                  {formik.touched.askingPrice && formik.errors.askingPrice}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl required
                fullwidth
                component="fieldset"
                error={formik.touched.aftersaleOptions.delivery && Boolean(formik.errors.aftersaleOptions.delivery)}
                sx={{ m: 3 }}
                variant="standard">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox checked={formik.values.aftersaleOptions.collection} onChange={formik.handleChange} name="aftersaleOptions.collection" />
                    }
                    label="Collection"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={formik.values.aftersaleOptions.delivery} onChange={formik.handleChange} name="delivery" />
                    }
                    label="Delivery"
                  />
                  </FormGroup>
                <FormHelperText>{formik.touched.aftersaleOptions.delivery & Boolean(formik.errors.aftersaleOptions.delivery)}</FormHelperText>
                </FormControl>
            </Grid>
          </Grid>
          <Grid style={{marginBottom:"20%"}}>
          <LoadingButton
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
        <Button onClick={handleLocation}>Get Location</Button>
        {location ? location : null}
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
