import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sendPurchaseRequest, getTokenData } from './mds-helpers';
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
        sendPurchaseRequest(data.name.name, data.name.sale_price, data.name.sellers_address);
    }

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
                        <p>Height: {data.name.height}</p>
                        <p>Weight: {data.name.weight}</p>
                        <p>Length: {data.name.length}</p>
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button onClick={handleClick} size="small">Buy Now</Button>
                </CardActions>
            </Card >
        )
    } else {
        return <p>Sorry we could not data for the item</p>
    }
}
export default ItemDetail;