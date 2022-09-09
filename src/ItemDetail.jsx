import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sendPurchaseRequest, getTokenData, checkAndSignTransaction, receivePurchaseRequest } from './mds-helpers';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const ItemDetail = () => {
    const [data, setData] = React.useState();
    const params = useParams();

    useEffect(() => {
        getTokenData(params.tokenId, setData);
    }, []);

    function handleClick() {
        sendPurchaseRequest(data.name.name, data.name.sale_price, data.name.sellers_address, data.name.database_id);
    }
    async function handleRefresh() {
        const item = await getItem(data.name.database_id);
        if (item.transactionStatus === 1) {
            receivePurchaseRequest(item.txnName, item.data, item._id, item.buyersAddress);
        }
        if (item.transactionStatus === 2) {
            checkAndSignTransaction(item.txnName, item.data);
        }
    }
    async function getItem(id) {
        let response = await fetch(`http://localhost:5001/item/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).catch(error => {
            window.alert(error);
            return;
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    useEffect(() => {
        if (data) {
            if (data.name.database_id) {
                let item = getItem(data.name.database_id);
                console.log(item);
            }
        }
    }, [data]);

    if (data) {
        return (
            <Card sx={{ maxWidth: 345, mt: 2 }}>
                <CardMedia
                    component="img"
                    height="250"
                    image={data.name.image}
                    alt="green iguana"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        £{data.name.sale_price}
                    </Typography>
                    <Typography gutterBottom variant="h5" component="div">
                        {data.name.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {data.name.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <h4>Original Item Specs</h4>
                        <p>Model: {data.name.model}</p>
                        <p>Brand: {data.name.brand}</p>
                        <p>Condition State: {data.name.condition_state}</p>
                        <p>Condition Description: {data.name.condition_description}</p>
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button onClick={handleClick} size="small">Buy Now</Button>
                    <Button onClick={handleRefresh} size="small">Refresh</Button>
                </CardActions>
            </Card >
        )
    } else {
        return <p>Sorry we could not data for the item</p>
    }
}
export default ItemDetail;