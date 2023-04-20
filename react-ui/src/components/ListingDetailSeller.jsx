import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { getListingById, deleteListing } from "../database/listing";
import CardContent from "@mui/material/CardContent";
import Button from '@mui/material/Button';
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import ShareIcon from "@mui/icons-material/Share";
import Card from "@mui/material/Card";
import Tooltip from "@mui/material/Tooltip";
import { sendListingToContacts } from "../minima";
import ListingDetailSkeleton from './ListingDetailSkeleton';
import Carousel from 'react-material-ui-carousel'
import DeleteIcon from '@mui/icons-material/Delete';
import CardActions from "@mui/material/CardActions";
import MuiAlert from '@mui/material/Alert';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PersonPinCircleOutlinedIcon from '@mui/icons-material/PersonPinCircleOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { Stack } from "@mui/system";
import Snackbar from '@mui/material/Snackbar';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function ListingDetailSeller() {
    const [listing, setListing] = useState();
    const [images, setImages] = useState([]);
    const [deleted, setDeleted] = useState(false);
    const [error, setError] = useState(false);
    const [sent, setSent] = useState(false);
    const params = useParams();
    const navigate = useNavigate();
    
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSent(false);
    };
    useEffect(() => {
        getListingById(params.id).then(function (result) {
            setListing(result);
            setImages(result.image.split("(+_+)"))
        });
    }, [params.id]);

    function handleShare() {
        sendListingToContacts(listing.listing_id)
            .then(() => {
                console.log('sent to all contacts!');
                setSent(true);
            }).catch((e) => console.error(e));
    }

    function handleDelete() {
        deleteListing(listing.listing_id).then(
            () => setDeleted(true),
            error => setError(`Couldn't delete listing`)
        );
    }

    if (deleted) {
        setTimeout(() => {
            navigate(`/`);
        }, 2500);
        return (
            <Alert mt={8} severity="info">Item has been deleted</Alert>
        )
    }

    return (
        <div>
            {listing ? (
                <div>
                    <Card sx={{ maxWidth: '100%', marginTop: 2, border: "none", boxShadow: "none", paddingBottom: '80px' }}>
                        <Carousel height="350px" animation="slide" navButtonsAlwaysVisible={true}>
                            {
                                images.map((image, i) => (
                                    <CardMedia
                                        component="img"
                                        width="100%"
                                        height="100%"
                                        minHeight="100%"
                                        minWidth="100%"
                                        objectFit="cover"
                                        position="center"
                                        image={image}
                                        alt="Test Image"
                                    />))
                            }
                        </Carousel>

                        <CardContent sx={{ padding: 0 }} >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb="1rem">
                                <Typography gutterBottom variant="h5" component="div" mb="0">
                                    $M{listing.price}
                                </Typography>
                            </Stack>
                            <Snackbar open={sent} autoHideDuration={6000} onClose={handleClose}>
                                <Alert onClose={handleClose} color="secondary" severity="success" sx={{ width: '100%' }}>
                                    Item shared with contacts
                                </Alert>
                            </Snackbar>

                            <Typography gutterBottom variant="h6" component="div">
                                {listing.title}
                            </Typography>
                            <Typography gutterBottom component="div" mb="1.5rem">
                                {listing.description
                                    ? <pre style={{ fontFamily: 'inherit' }}>{listing.description}</pre>
                                    : "This item has no description"}
                            </Typography>
                        </CardContent>

                        <List>
                            {listing.collection === "true"
                                ?
                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <PersonPinCircleOutlinedIcon color="secondary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Collection"
                                            secondary="Coordinates saved to listing" />
                                    </ListItemButton>
                                </ListItem>
                                : null}
                            {listing.delivery === "true"
                                ?
                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <LocalShippingOutlinedIcon color="secondary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`Shipping`}
                                            secondary={`$M${listing.shipping_cost}`}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                : null}
                        </List>
                        <Stack mt={3} direction="column" spacing={2}>
                            <Button xs={{ width: '100%' }} aria-label="share" onClick={() => handleShare()} variant="contained" color="secondary">
                                {error && <Alert severity="error">{error}</Alert>}
                                Republish
                            </Button>
                            <Button xs={{width:'100%'}} aria-label="delete listing" onClick={() => handleDelete()} startIcon={<DeleteIcon />} variant="outlined" color="error">
                                {error && <Alert severity="error">{error}</Alert>}
                                Delete Listing
                            </Button>
                        </Stack>
                    </Card>
                </div>
            ) : <ListingDetailSkeleton />}
        </div>
    );
}
export default ListingDetailSeller;
