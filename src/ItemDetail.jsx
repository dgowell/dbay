import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sendPurchaseRequest, getTokenData, checkAndSignTransaction, receivePurchaseRequest } from './mds-helpers';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import { getKeys } from './mds-helpers';


const ItemDetail = () => {
    const [data, setData] = React.useState();
    const [buyRequested, setBuyRequested] = React.useState(false);
    const [settlePayment, setSettlePayment] = React.useState(false);
    const [keys, setKeys] = React.useState();
    const [isSeller, setIsSeller] = React.useState(false);
    const [item, setItem] = React.useState();
    const [txnComplete, setTxnComplete] = React.useState(false);
    const params = useParams();
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        getTokenData(params.tokenId, setData);
        getKeys().then(function (result) {
            setKeys(result);
        })
    }, []);

    useEffect(() => {
        if (data && keys) {
            if (keys.map(getPublicKey).includes(data.name.sellers_address)) {
                setIsSeller(true);
            }
        }
    }, [keys, data]);

    function getPublicKey(key) {
        return key.publickey;
    }

    useEffect(() => {
        if (data) {
            getItem(data.name.database_id)
                .then(function (result) {
                    setItem(result);
                    if (result.transactionStatus === 1) {
                        setBuyRequested(true);
                    } else if (result.transactionStatus === 2) {
                        setSettlePayment(true);
                    }
                })
        }
    }, [data]);

    function handleClick(e) {
        e.preventDefault();
        setLoading(true);
        sendPurchaseRequest(data.name.name, data.name.sale_price, data.name.sellers_address, data.name.database_id).then(function (result) {
            setBuyRequested(true);
            setLoading(false);
        })
    }
    function handleRefresh(e) {
        e.preventDefault();
        receivePurchaseRequest(item.txnName, item.data, item._id, item.buyersAddress).then(function (result) {
            setSettlePayment(true);
        })
    }

    function handleApprove(e) {
        e.preventDefault();
        checkAndSignTransaction(item.txnName, item.data).then(function (result) {
            setTxnComplete(true);
        })
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

                    {isSeller || buyRequested || settlePayment ? '' : <LoadingButton loading={loading} onClick={handleClick} size="small">Buy Now</LoadingButton>}
                    {buyRequested && isSeller && !settlePayment ? <Button onClick={handleRefresh} size="small">Approve Sale</Button> : ''}
                    {buyRequested && !isSeller ? <p>Request Sent!</p> : null}
                    {settlePayment && !isSeller ? <Button onClick={handleApprove} size="small">Approve Payment</Button> : ''}
                    {txnComplete && !isSeller ? <p>Congratulations it's now yours!</p> : ''}

                </CardActions>
            </Card >
        )
    } else {
        return <p>Sorry we could not data for the item</p>
    }
}
export default ItemDetail;