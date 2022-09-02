import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';


const CreateTokenForm = () => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = React.useState(false);
    const [values, setValues] = useState({
        name: '',
        originalPrice: '',
        salePrice: '',
        description: ''
    })

    function checkName(token, name) {
        return token.token.name.name === name;
    }

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };

    const handleSubmit = (e) => {
        setLoading(true);
        e.preventDefault();

        const command = `
        tokencreate amount:1 decimal:0 name:{
        "app":"stampd",
        "name":"${values.name}",
        "original_price":"${values.originalPrice}",
        "sale_price":"${values.salePrice}",
        "description":"${values.description}"
        }`;

        window.MDS.cmd(command, function (res) {
            if (res.status) {
                const minimaToken = res.response.outputs.find(e => checkName(e, values.name));
                setToken(minimaToken.token.tokenid);
            } else {
                alert(res.message);
            }
        })
    }

    if (token === null) {
        return (
            <Box
                sx={{
                    marginTop: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Add Product
                </Typography>
                <Box
                    component="form"
                    sx={{ mt: 3 }}
                    noValidate
                    autoComplete="off"
                    onSubmit={handleSubmit}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Product Name"
                                id="product-name"
                                className="form-field"
                                type="text"
                                required
                                fullWidth
                                name="name"
                                value={values.name}
                                onChange={handleChange('name')}
                                ariant="outlined"
                            />

                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                id="product-description"
                                required
                                multiline
                                rows={4}
                                fullWidth
                                className="form-field"
                                type="textarea"
                                name="link"
                                value={values.description}
                                onChange={handleChange('description')}
                                ariant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth required>
                                <InputLabel htmlFor="original-price">Original Price</InputLabel>
                                <OutlinedInput
                                    id="original-price"
                                    value={values.originalPrice}
                                    onChange={handleChange('originalPrice')}
                                    startAdornment={<InputAdornment position="start">£</InputAdornment>}
                                    label="Original Price"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth required>
                                <InputLabel htmlFor="sale-price">Sale Price</InputLabel>
                                <OutlinedInput
                                    id="sale-price"
                                    value={values.salePrice}
                                    onChange={handleChange('salePrice')}
                                    startAdornment={<InputAdornment position="start">£</InputAdornment>}
                                    label="Sale Price"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel htmlFor="weight">Weight</InputLabel>
                                <OutlinedInput
                                    id="weight"
                                    value={values.weight}
                                    onChange={handleChange('weight')}
                                    endAdornment={<InputAdornment position="end">kg</InputAdornment>}
                                    label="Weight"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth required>
                                <InputLabel htmlFor="height">Height</InputLabel>
                                <OutlinedInput
                                    id="height"
                                    value={values.height}
                                    onChange={handleChange('height')}
                                    endAdornment={<InputAdornment position="end">cm</InputAdornment>}
                                    label="Height"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth required>
                                <InputLabel htmlFor="length">Length</InputLabel>
                                <OutlinedInput
                                    id="length"
                                    value={values.length}
                                    onChange={handleChange('length')}
                                    endAdornment={<InputAdornment position="end">cm</InputAdornment>}
                                    label="Length"
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                    <LoadingButton fullWidth variant="contained" type="submit" value="Create Token" loading={loading}
                        loadingPosition="end" sx={{ mt: 3, mb: 2 }}>Submit</LoadingButton>
                </Box>
            </Box>
        )
    }
    return token ? <p> NFT created for the {values.name} </p> : '';
}

export default CreateTokenForm;