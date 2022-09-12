import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { getPublicAddress } from '../mds-helpers';
import { useNavigate } from "react-router";


const AddItem = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [loading, setLoading] = React.useState(false);
    const [address, setAddress] = React.useState();
    const [values, setValues] = useState({
        name: '',
        brand: '',
        model: '',
        description: '',
        original_price: '',
        sale_price: '',
        vendorLink: '',
        condition_state: '',
        condition_description: '',
        image: '',
    })

    React.useEffect(() => {
        getPublicAddress().then(function (result) {
            setAddress(result);
        }).catch(function (error) {
            console.log(error);
        });
    }, []);

    function checkName(token, name) {
        return token.token.name.name === name;
    }

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };

    async function saveToDatabase() {
        try {
            const newItem = { ...values };

            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("api-key", process.env.REACT_APP_ATLAS_KEY);
            myHeaders.append("X-Requested-With", "XMLHttpRequest");

            var raw = JSON.stringify({
                "collection": "item",
                "database": "Marketplace",
                "dataSource": "ClusterStampd",
                "document": newItem,
            });

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            let response = await fetch(`${process.env.REACT_APP_DATABASE_URL}/action/insertOne`, requestOptions)
                .catch(error => {
                    window.alert(error);
                    return;
                });
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            setValues({
                collection: "item",
                database: "Marketplace",
                dataSource: "ClusterStampd",
                name: '',
                brand: '',
                model: '',
                description: '',
                original_price: '',
                sale_price: '',
                vendorLink: '',
                condition_state: '',
                condition_description: '',
                image: '',
                published_date: '',
            })
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error(`could not save item: ${error}`);
        }
    }


    function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        const promise = saveToDatabase();
        promise.then((data) => data ? saveToMinima(data.insertedId) : null);
    }

    function saveToMinima(id) {
        const command = `
            tokencreate amount:1 decimals:0 name:{
                "app":"stampd",
                "sellers_address": "${address}",
                "database_id":"${id}",
                "name":"${values.name}",
                "original_price":"${values.original_price}",
                "sale_price":"${values.sale_price}",
                "description":"${values.description}",
                "image":"${values.image}",
                "brand":"${values.brand}",
                "model":"${values.model}",
                "vendor_link":"${values.vendor_link}",
                "condition_state":"${values.condition_state}",
                "condition_description":"${values.condition_description}"}`;

        window.MDS.cmd(command, function (res) {
            if (res.status) {
                const minimaToken = res.response.outputs.find(e => checkName(e, values.name));
                setToken(minimaToken.token.tokenid);
                setLoading(false);
                navigate("/marketplace");
            } else {
                console.log(res.message);
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
                    Add Item
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
                                label="Item Title"
                                id="item-name"
                                className="form-field"
                                type="text"
                                required
                                fullWidth
                                name="title"
                                value={values.name}
                                onChange={handleChange('name')}
                                ariant="outlined"
                            />

                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Brand"
                                id="brand"
                                className="form-field"
                                type="text"
                                required
                                fullWidth
                                name="brand"
                                value={values.brand}
                                onChange={handleChange('brand')}
                                ariant="outlined"
                            />

                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Model"
                                id="model"
                                className="form-field"
                                type="text"
                                required
                                fullWidth
                                name="model"
                                value={values.model}
                                onChange={handleChange('model')}
                                ariant="outlined"
                            />

                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Vendor Link"
                                id="Vendor-link"
                                fullWidth
                                required
                                className="form-field"
                                type="text"
                                name="image"
                                value={values.vendor_link}
                                onChange={handleChange('vendor_link')}
                                ariant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                id="description"
                                multiline
                                required
                                rows={4}
                                fullWidth
                                className="form-field"
                                type="textarea"
                                name="description"
                                value={values.description}
                                onChange={handleChange('description')}
                                ariant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Link to Image"
                                id="image"
                                fullWidth
                                required
                                className="form-field"
                                type="text"
                                name="image"
                                value={values.image}
                                onChange={handleChange('image')}
                                ariant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="original-price">Original Price</InputLabel>
                                <OutlinedInput
                                    id="original-price"
                                    value={values.original_price}
                                    required
                                    onChange={handleChange('original_price')}
                                    startAdornment={<InputAdornment position="start">$M</InputAdornment>}
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
                                    required
                                    onChange={handleChange('sale_price')}
                                    startAdornment={<InputAdornment position="start">$M</InputAdornment>}
                                    label="Sale Price"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Condition</InputLabel>
                                <Select
                                    labelId="select-condition-label"
                                    id="select-condition"
                                    value={values.condition_state}
                                    required
                                    label="Condition"
                                    onChange={handleChange('condition_state')}
                                >
                                    <MenuItem value={'pre-loved'}>Pre-loved</MenuItem>
                                    <MenuItem value={'brenad-new'}>Brand New (Unopened)</MenuItem>
                                    <MenuItem value={'as-new'}>As New</MenuItem>
                                    <MenuItem value={'refurbushed'}>Refurbished</MenuItem>
                                    <MenuItem value={'well-used'}>Well Used (Full working order)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Condition Description"
                                id="condition-description"
                                multiline
                                rows={4}
                                fullWidth
                                required
                                className="form-field"
                                type="textarea"
                                name="condition-description"
                                value={values.condition_description}
                                onChange={handleChange('condition_description')}
                                ariant="outlined"
                            />
                        </Grid>
                    </Grid>
                    <LoadingButton fullWidth variant="contained" type="submit" value="Create Token" loading={loading}
                        disabled={address ? false : true} loadingPosition="end" sx={{ mt: 3, mb: 2 }}>Submit</LoadingButton>
                </Box>
            </Box>
        )
    }
    return token ? <p> NFT created for the {values.name} </p> : '';
}

export default AddItem;