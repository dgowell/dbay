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
import { PhotoCamera } from "@mui/icons-material";
import imageCompression from 'browser-image-compression';
import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import UserWebCam from "./UserWebCam";
import Switch from '@mui/material/Switch';
import Paper from '@mui/material/Paper';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { styled } from '@mui/material/styles';
import { getMaximaInfo, getPermanentAddress } from "../minima";

const validationSchema = yup.object({
  title: yup
    .string('Enter listing title')
    .max(50, 'Title is too long')
    .required('Title is required'),
  askingPrice: yup
    .number('Enter the price')
    .positive('Price must be at least 1 minima')
    .integer('Price must be an integer')
    .min(1, 'Price should be at least 1 minima')
    .max(100000000000, 'Price should be below 100000000000 minima')
    .required('Price is required'),
  deliveryCost: yup
    .number('Enter the delivery cost')
    .integer('Price must be an integer'),
  collection: yup.boolean(),
  delivery: yup.boolean(),
}).test('hasDeliveryOrCollection', 'Please select at least one option', function (values) {
  const { collection, delivery } = values;
  return collection || delivery;
});


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#F5F5F5',
  ...theme.typography.body2,
  padding: theme.spacing(4),
  minHeight: '200px',
  textAlign: 'left',
  textTransform: 'none',
  color: 'black',
  width: '100%',
  fontFamily: 'Karla',
}));

export default function ListingCreate() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [host, setHost] = useState();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));

  const handleModalOpen = (i) => {
    console.log("photo clicked!");
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

  const formik = useFormik({
    initialValues: {
      title: '',
      askingPrice: 0,
      delivery: false,
      collection: false,
      deliveryCost: 0,
      description: '',
      locationDescription: '',
      hasDeliveryOrCollection: false,
    },
    validationSchema,
    onSubmit: (values) => {
      values.hasDeliveryOrCollection = values.collection || values.delivery;
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

    const isValid = await validationSchema.validate(formik.values, { abortEarly: false })
      .then(() => true)
      .catch(() => false);

    if (!isValid) {
      setLoading(false);
      setError('Please select at least one shipping option');
      return;
    }

    //pass each image through the handleUpload function
    const compressedImages = await Promise.all( // eslint-disable-line no-undef
      images.map((image) => handleUpload(image))
    );
    console.log(`New listing about to be created : ${JSON.stringify(formik.values)}`);
    let id = "";
    getMaximaInfo(function (maxima) {
      var publickey = maxima.publickey;
      var name = maxima.name;
      getPermanentAddress(function (address) {
        createListing({
          title: formik.values.title.replace(/'/g, "''"),
          price: formik.values.askingPrice,
          createdByPk: publickey,
          createdByName: name,
          sellerHasPermAddress: address ? true : false,
          sellerPermAddress: address ? address : '',
          walletAddress: walletAddress,
          image: compressedImages.join("(+_+)"),
          description: formik.values.description.replace(/'/g, "''") ?? '',
          collection: formik.values.collection,
          delivery: formik.values.delivery,
          locationDescription: formik.values.locationDescription,
          shippingCost: parseInt(formik.values.deliveryCost),
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
              navigate(`/info`, { state: { main: "Successfully published!", sub: "" } });
            }, 100);
          }
        }).catch((e) => {
          setError(`There was an error creating or sending your listing`);
          console.error(`Could not create or send listing ${e}`);
          setLoading(false);
        });
      });
    });
  }


  const handleGoHome = () => {
    navigate(-1);
  }

  const fileToDataUri = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  })


  const handleUpload = async (imageFile) => {
    //convert imageFile to blob
    const blob = await fetch(imageFile).then(r => r.blob());
    console.log(blob);
    imageFile = blob;
    console.log('originalFile instanceof Blob', imageFile instanceof Blob); // true
    console.log(`originalFile size ${imageFile.size / 1024} KB`);
    const options = {
      maxSizeMB: 0.02,
      maxWidthOrHeight: 828,
      useWebWorker: true
    }
    try {
      const compressedFile = await imageCompression(imageFile, options);
      console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
      console.log(`compressedFile size ${compressedFile.size / 1024} KB`); // smaller than maxSizeMB
      const smp = await fileToDataUri(compressedFile);
      console.log(smp);
      return smp;
    } catch (error) {
      console.log(error);
      setError('File is not Image');
    }
  }

  const handleFileUpload = async (e, i) => {
    let temp = [...images];
    if (e.target.files) {
      const imageFile = e.target.files[0];
      console.log('originalFile instanceof Blob', imageFile instanceof Blob); // true
      console.log(`originalFile size ${imageFile.size / 1024} KB`);
      const options = {
        maxSizeMB: 0.02,
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

        }}
      >
        <h1>Create new listing</h1>
        <Box
          component="form"
          sx={{ mt: 3 }}
          noValidate
          autoComplete="off"
          onSubmit={formik.handleSubmit}
        >

          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2} style={{ marginBottom: "2rem" }}>
              <Grid item xs={6} style={{ height: "150px" }} onClick={() => { handleModalOpen(0) }}>
                {images[0] ? <img src={images[0]} alt="" style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "15px",
                  left: "0",
                  right: "0",
                  top: "0",
                  bottom: "0",
                  objectFit: "cover"
                }} /> : <Box style={{ display: 'flex', flexDirection: "column", textAlign: "center", padding: "1.5rem", borderRadius: "15px", border: "0.25px solid rgba(30, 51, 238, 0.47)", height: "100%" }}>
                  <Box ><PhotoCamera /></Box>
                  <Box>
                    <span>Image Upload</span>
                    <p style={{ margin: "0", color: "#4B4949", fontSize: "12px" }}>Primary Photo</p>
                  </Box>
                </Box>}
              </Grid>
              <Grid item xs={6} style={{ height: "150px" }} onClick={() => handleModalOpen(1)}>
                {images[1] ? <img src={images[1]} alt="" style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "15px",
                  left: "0",
                  right: "0",
                  top: "0",
                  bottom: "0",
                  objectFit: "cover"
                }} /> : <Box style={{ display: "flex", textAlign: "center", padding: "2rem", borderRadius: "15px", background: "#EFEEEE", border: "0.25px solid #EEEEEE", height: "100%" }}>
                  <Box style={{ margin: "auto", display: "flex", justifyContent: "center", color: "white", fontSize: '2.5rem', fontWeight: '800' }}>
                    2
                  </Box>
                </Box>}
              </Grid>
              <Grid item xs={6} style={{ height: "150px" }} onClick={() => handleModalOpen(2)}>
                {images[2] ? <img src={images[2]} alt="" style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "15px",
                  left: "0",
                  right: "0",
                  top: "0",
                  bottom: "0",
                  objectFit: "cover"
                }} /> : <Box style={{ display: "flex", textAlign: "center", padding: "2rem", borderRadius: "15px", background: "#EFEEEE", border: "0.25px solid #EEEEEE ", height: "100%" }}>
                  <Box style={{ margin: "auto", display: "flex", justifyContent: "center", color: "white", fontSize: '2.5rem', fontWeight: '800' }}>
                    3
                  </Box>
                </Box>}
              </Grid>
              <Grid item xs={6} style={{ height: "150px" }} onClick={() => handleModalOpen(3)}>
                {images[3] ? <img src={images[3]} alt="" style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "15px",
                  left: "0",
                  right: "0",
                  top: "0",
                  bottom: "0",
                  objectFit: "cover"
                }} /> : <Box style={{ display: "flex", textAlign: "center", padding: "2rem", borderRadius: "15px", background: "#EFEEEE", border: "0.25px solid #EEEEEE ", height: "100%" }}>
                  <Box style={{ margin: "auto", display: "flex", justifyContent: "center", color: "white", fontSize: '2.5rem', fontWeight: '800' }}>
                    4
                  </Box>
                </Box>}
              </Grid>
            </Grid>
          </Box>
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
                error={formik.touched.title && formik.errors.title}
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
              <FormControl sx={{ gap: 1, width: '100%' }}>
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
                      <Switch color="secondary" checked={formik.values.collection} onChange={formik.handleChange} name="collection" />
                    }
                    label="Collection"
                  />
                  {formik.values.collection ? (
                    <Paper
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2,
                        gap: 2,
                        mt: 3,
                        mb: 3,
                      }}
                      elevation={2}
                    >
                      <Typography>
                        Provide a location description, like a nearby town, city, or well-known venue.
                      </Typography>

                      <Grid item xs={12}>
                        <TextField
                          label="Location Description"
                          id="locationDescription"
                          name="locationDescription"
                          className="form-field"
                          type="text"
                          fullWidth
                          value={formik.values.locationDescription}
                          onChange={formik.handleChange}
                          variant="outlined"
                          error={formik.touched.locationDescription && formik.errors.locationDescription}
                          helperText={formik.touched.locationDescription && formik.errors.locationDescription}
                        />
                      </Grid>
                    </Paper>
                  ) : null}

                  <FormControlLabel
                    control={
                      <Switch color="secondary" checked={formik.values.delivery} onChange={formik.handleChange} name="delivery" />
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
                          value={formik.values.deliveryCost}
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
                    </Paper>
                    : null}
                </FormGroup>
              </FormControl>
            </Grid>
          </Grid>
          <Grid >
            {formik.errors.checkbox && (
              <div className="error">{formik.errors.checkbox}</div>
            )}
            <LoadingButton className={"custom-loading"}
              fullWidth
              variant="contained"
              type="submit"
              color="secondary"
              value="Create Token"
              loading={loading}
              loadingPosition="end"
              sx={{ mt: 3 }}
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
          maxWidth="100vw"
          maxHeight="100vh"
          aria-labelledby="responsive-dialog-title"
        >
          <Box alignContent="center">
            <UserWebCam handleFileUpload={handleFileUpload} handleUpload={handleUpload} index={currentIndex} images={images} setImages={setImages} close={handleModalClose} />
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
