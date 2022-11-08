import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";

export default function ListingUpdate() {
    const [form, setForm] = useState({
        name: "",
        asking_price: "",
        records: [],
    });
    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const id = params.id.toString();
            const response = await fetch(`http://localhost:5000/listing/${params.id.toString()}`);

            if (!response.ok) {
                const message = `An error has occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }

            const listing = await response.json();
            if (!listing) {
                window.alert(`Listing with id ${id} not found`);
                navigate("/");
                return;
            }

            setForm(listing);
        }

        fetchData();

        return;
    }, [params.id, navigate]);

    // These methods will update the state properties.
    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();
        const editedPerson = {
            name: form.name,
            asking_price: form.asking_price
        };

        // This will send a post request to update the data in the database.
        await fetch(`http://localhost:5000/update/${params.id}`, {
            method: "POST",
            body: JSON.stringify(editedPerson),
            headers: {
                'Content-Type': 'application/json'
            },
        });

        navigate("/");
    }

    // This following section will display the form that takes input from the user to update the data.
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
        Update Listing
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
              label="Item Title"
              id="item-name"
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
            <FormControl fullWidth>
              <InputLabel htmlFor="asking-price">Asking Price</InputLabel>
              <OutlinedInput
                id="asking-price"
                value={form.asking_price}
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
          loadingPosition="end"
          sx={{ mt: 3, mb: 2 }}
        >
          Submit
        </LoadingButton>
      </Box>
    </Box>
    );
}