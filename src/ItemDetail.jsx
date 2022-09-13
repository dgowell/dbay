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
import { SettingsOutlined } from '@mui/icons-material';


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
    const [sold, setSold] = React.useState(false);

    useEffect(() => {
        getTokenData(params.tokenId).then(function (result) {
            setData(result);
        })
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
                    setItem(result.document);
                    if (result.document.txnStatus === 1) {
                        setBuyRequested(true);
                    } else if (result.document.txnStatus === 2) {
                        setBuyRequested(false);
                        setSettlePayment(true);
                    } else if (result.document.txnStatus === 3) {
                        setBuyRequested(false);
                        setSettlePayment(false);
                        setSold(true);
                    }
                })
        }
    }, [data]);

    function handleClick(e) {
        e.preventDefault();
        setLoading(true);
        sendPurchaseRequest(data.name.name, data.name.sale_price, data.name.sellers_address, data.name.database_id).then(function (result) {
            console.log(result);
            alert(result);
            setBuyRequested(true);
            setLoading(false);
        })
    }
    function handleRefresh(e) {
        e.preventDefault();
        setLoading(true);
        receivePurchaseRequest(item.txnName, item.data, item._id, item.buyersAddress).then(function (result) {
            setSettlePayment(true);
            setLoading(false);
        })
    }

    function handleApprove(e) {
        e.preventDefault();
        setLoading(true);
        checkAndSignTransaction(item.txnName, item.data, item._id).then(function (result) {
            console.log(result);
            alert(result);
            setTxnComplete(true);
            setLoading(false);
        })
    }
    async function getItem(id) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("api-key", process.env.REACT_APP_ATLAS_KEY);
        myHeaders.append("X-Requested-With", "XMLHttpRequest");

        var raw = JSON.stringify({
            "collection": "item",
            "database": "Marketplace",
            "dataSource": "ClusterStampd",
            "filter": {
                "_id": {
                    "$oid": id,
                }
            },
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        let response = await fetch(`${process.env.REACT_APP_DATABASE_URL}/action/findOne`, requestOptions)
            .catch(error => {
                window.alert(error);
                return;
            });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }

    if (data) {
        return (
            <Card sx={{ maxWidth: 345, mt: 2 }}>
                <CardMedia
                    component="img"
                    height="250"
                    image={data.name.image}
                    alt={data.name.name}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        $M{data.name.sale_price}
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

                    {isSeller || buyRequested || settlePayment || sold ? '' : <LoadingButton loading={loading} onClick={handleClick} size="small">Buy Now</LoadingButton>}
                    {buyRequested && isSeller && !settlePayment && !sold ? <LoadingButton loading={loading} onClick={handleRefresh} size="small">Approve Sale</LoadingButton> : ''}
                    {buyRequested && !isSeller && !sold ? <p>Request Sent!</p> : null}
                    {settlePayment && !isSeller && !txnComplete && !sold ? <LoadingButton loading={loading} onClick={handleApprove} size="small">Approve Payment</LoadingButton> : ''}
                    {txnComplete && !isSeller && !sold ? <Typography><p>Congratulations, the item is yours!</p></Typography> : ''}
                    {sold ? <Typography><h3>SOLD!</h3></Typography> : ""}

                </CardActions>

            </Card >
        )
    } else {
        return <p>Sorry we could not data for the item</p>
    }
}
export default ItemDetail;