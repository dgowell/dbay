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
import { createListing, getCategories } from "../db";
import Autocomplete from "@mui/material/Autocomplete";

export default function ListingCreate(storeId) {
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    asking_price: "",
    category: categories[0]
  });
  const navigate = useNavigate();

  useEffect(() => {
    getCategories()
      .then(function (result) {
        setCategories(result);
      })
      .catch(function (error) {
        console.log(error);
      });
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

    // When a post request is sent to the create url, we'll add a new record to the database.
    const newListing = { ...form };

    createListing(newListing.name, newListing.asking_price, newListing.category.CATEGORY_ID, storeId.storeId)
      .then((result) => {
        console.log(`Listing added: ${result}`);
      })
      .catch((e) => console.error(e));

    setForm({ name: "", asking_price: "", category: categories[0] });
    navigate("/");
    setLoading(false);
  }

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
              ariant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              value={form.category}
              getOptionLabel={(option) => option.NAME ?? null}
              onChange={function (e) {
                updateForm({
                  category: categories[e.target.dataset.optionIndex],
                });
              }}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
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
          Submit
        </LoadingButton>
      </Box>
    </Box>
  );
}
