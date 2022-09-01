import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';


const CreateTokenForm = () => {
    const [token, setToken] = useState(null);
    const [values, setValues] = useState({
        name: '',
        link: '',
        description: ''
    })

    function checkName(token, name) {
        return token.token.name.name === name;
    }

    const handleNameInputChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            name: event.target.value,
        }));
    };
    const handleLinkInputChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            link: event.target.value,
        }));
    };
    const handleDescriptionInputChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            description: event.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const command = `tokencreate amount:1 decimal:0 name:{"name":"${values.name}","link":"${values.link}","description":"${values.description}"}`;
        window.MDS.cmd(command, function (res) {
            if (res.status) {
                //const transaction = Token.response.transactionid;
                const minimaToken = res.response.outputs.find(e => checkName(e, values.name));
                setToken(minimaToken.token.tokenid);
            } else {
                alert(res.message);
            }
        })
    }

    if (token === null) {
        return (
            <Box sx={{ width: '100%', maxWidth: 300 }}>
                <Typography variant="h3" gutterBottom>
                    Add Product
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Box
                        component="form"
                        sx={{
                            '& > :not(style)': { m: 1, width: '25ch' },

                        }}
                        noValidate
                        autoComplete="off"
                    >

                        <TextField
                            label="Product Name"
                            id="product-name"
                            className="form-field"
                            type="text"
                            name="name"
                            value={values.name}
                            onChange={handleNameInputChange}
                            ariant="outlined"
                        />


                        <TextField
                            label="Link"
                            id="token-link"
                            className="form-field"
                            type="text"
                            name="link"
                            value={values.link}
                            onChange={handleLinkInputChange}
                            ariant="outlined"
                        />

                        <TextField
                            label="Description"
                            id="product-description"
                            className="form-field"
                            type="textarea"
                            name="link"
                            value={values.description}
                            onChange={handleDescriptionInputChange}
                            ariant="outlined"
                        />


                        <Button variant="contained" type="submit" value="Create Token" >Submit</Button>
                    </Box>
                </form >
            </Box>
        )
    }
    return token ? <p> You have successfully created a token with ID: {token} </p> : '';
}

export default CreateTokenForm;