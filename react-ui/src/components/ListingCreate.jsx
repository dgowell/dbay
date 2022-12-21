import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
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
import Autocomplete from "@mui/material/Autocomplete";
import { getAddress } from "../mds-helpers";
import { getHost } from "../database/settings";
import { sendListingToContacts } from '../comms';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';


const categories = [
  { category_id: 1, name: "Cat One" },
  { category_id: 2, name: "Cat Two" },
  { category_id: 3, name: "Cat Three" },
  { category_id: 4, name: "Cat Four" },
  { category_id: 5, name: "Cat Five" },
];

export default function ListingCreate() {
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [host, setHost] = useState();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showHome, setShowHome] = useState(null);
  const [form, setForm] = useState({
    name: "",
    asking_price: "",
    category: categories[0],
  });
  const [walletAddress, setWalletAddress] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    getHost().then((host) => {
      setHost(host);
    });
  },[]);

  useEffect(() => {
    async function getWalletAddress() {
      setWalletAddress(await getAddress());
    }
    getWalletAddress();
  }, []);

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  // This function will handle the submission.
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // When a post request is sent to the create url, we'll add a new record to the database.
    const newListing = { ...form };

    createListing({
      name: newListing.name,
      price: newListing.asking_price,
      createdByPk: host.pk,
      createdByName: host.name,
      walletAddress: walletAddress,
    })
      .then((listingId) => {
        console.log(`Listing successfully added: ${listingId}`);
        sendListingToContacts(listingId).then((res) => {
          setLoading(false);
          setForm({ name: "", asking_price: "", category: categories[0] });
          setSuccess(true);
          setShowHome(true);
        });

      })
      .catch((e) => {
        setError('Could not create listing');
        setLoading(false);
      });
  }

  const handleGoHome = () => {
    navigate('/');
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
          onSubmit={onSubmit}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Listing Title"
                id="listing-name"
                className="form-field"
                type="text"
                required
                fullWidth
                name="title"
                value={form.name}
                onChange={(e) => updateForm({ name: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                value={categories[form.category]}
                getOptionLabel={(option) => option.name ?? null}
                onChange={(e, newValue) => {
                  updateForm({ category: newValue });
                }}
                inputValue={inputValue}
                onInputChange={(e, newInputValue) => {
                  setInputValue(newInputValue);
                }}
                disablePortal
                required
                id="listing-category"
                options={categories}
                renderInput={(params) => (
                  <TextField {...params} label="Category" />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel htmlFor="asking-price">Asking Price</InputLabel>
                <OutlinedInput
                  id="asking-price"
                  value={form.asking_price}
                  required
                  onChange={(e) => updateForm({ asking_price: e.target.value })}
                  startAdornment={
                    <InputAdornment position="start">MIN</InputAdornment>
                  }
                  label="Asking Price"
                />
              </FormControl>
            </Grid>
          </Grid>
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
        </Box>
      </Box>
    );
  }
  else {
    return null;
  }
}
