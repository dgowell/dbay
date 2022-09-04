import React, { useState, useEffect } from 'react';
import {
    getToken,
    getAddress,
    addContact,
    createTransaction,
    addTxnOutput,
    getCoin,
    addTxnInput,
    exportTxn,
    sendTxn,
    exportToken
} from './mds-helpers';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { getTokens } from './mds-helpers';


const PurchaseForm = () => {
    //const TOKEN_NAME = 'Test';
    //const MAX_CONTACT = 'MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G1GGHUVYU7SVFC423GVRA99Q10649D2Q06R3NA7UJ1JAJCYW78FHHZKV1BY3R2AWMZ0UGJ3YB4TZ3D002A8PAK5N2W313FPCW2AC7VD5TAUQ29309Q0QP7MMWU3S1C6G0GMA783UQFVU4AW9AK35308ZZ1DM8W9H3T3D09VSKUQEMCFQ6GZCD1GQ9E9JS87T4EG3YBJQFGJVHNK106080044PZWW6@192.168.1.83:10001';

    const [tokenId, setTokenId] = useState();
    const [outAddress, setOutAddress] = useState();
    const [txnId, setTxnId] = useState();
    const [sent, setSent] = useState(false);
    const [contact, setContact] = useState(false);
    const [hasOutput, setHasOutput] = useState(false);
    const [hasInput, setHasInput] = useState(false);
    const [coinId, setCoinId] = useState();
    const [data, setData] = useState();
    const [tokenExportData, setTokenExportData] = useState();
    const [txnName, setTxnName] = useState();
    const [tokens, setTokens] = useState();
    const [loading, setLoading] = React.useState(false);
    const [values, setValues] = useState({
        name: '',
        price: '',
        address: '',
    })

    useEffect(() => {
        getTokens(setTokens);
    }, []);

    useEffect(() => {
        if (values.name && values.price) {
            setTxnName(`${slugify(values.name)}-${values.price}`);
        }
    }, [values.name, values.price]);

    useEffect(() => {
        if (txnName && outAddress && tokenId) {
            addTxnOutput(txnName, outAddress, values.price, tokenId, setHasOutput);
            getCoin(values.name, setCoinId);
        }
    }, [txnName, outAddress, tokenId]);

    useEffect(() => {
        if (coinId) { addTxnInput(txnName, coinId, setHasInput); }
    }, [coinId]);

    useEffect(() => {
        if (hasOutput && hasInput) {
            exportTxn(txnName, setData);
        }
    }, [hasOutput, hasInput]);

    useEffect(() => {
        if (!tokenExportData) {
            exportToken(tokenId, setTokenExportData);
        }
    }, []);

    useEffect(() => {
        if (contact && data) {
            sendTxn(data, contact, 'txndata', setSent);
        }
    }, [data, contact]);

    useEffect(() => {
        if (contact && tokenExportData) {
            sendTxn(tokenExportData, contact, 'tokendata', setSent);
        }
    }, [tokenExportData, contact]);

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };

    async function handleSubmit(e) {
        setLoading(true);
        e.preventDefault();
        getAddress(setOutAddress);
        getToken(values.name, setTokenId);
        addContact(values.address, setContact);
        createTransaction(txnName, setTxnId);
    }

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
                Sell Product
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
                        <SelectField
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
                            label="Customers Address"
                            id="address"
                            required
                            fullWidth
                            className="form-field"
                            type="text"
                            name="address"
                            value={values.address}
                            onChange={handleChange('address')}
                            ariant="outlined"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth required>
                            <InputLabel htmlFor="price">Price</InputLabel>
                            <OutlinedInput
                                id="price"
                                value={values.price}
                                onChange={handleChange('price')}
                                startAdornment={<InputAdornment position="start">M</InputAdornment>}
                                label="price"
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

export default PurchaseForm;