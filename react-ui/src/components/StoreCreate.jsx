import React, { useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import Grid from "@mui/material/Grid";
import { createStore } from "../database/store";
import { getPublicKey } from "../comms";

export default function StoreCreate() {
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = useState({
    name: "",
  });
  const navigate = useNavigate();

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
    const newStore = { ...form };

    let storeId = await getPublicKey();
    createStore(newStore.name, storeId)
      .then((result) => {
        console.log(`Store added: ${result}`);
      })
      .catch((e) => console.error(e));

    setForm({ name: "" });
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
        Create New Store
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
              label="Store Name"
              id="store-name"
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
