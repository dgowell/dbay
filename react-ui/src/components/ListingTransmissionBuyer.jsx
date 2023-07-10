import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LoadingButton from '@mui/lab/LoadingButton';
import { getListingById } from '../database/listing';
import { useNavigate } from "react-router";
import { purchaseListing } from '../minima/buyer-processes';
import { link } from '../minima';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import ListItemText from "@mui/material/ListItemText";
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import PaymentError from './PaymentError';
import BungalowIcon from "@mui/icons-material/Bungalow";
import Badge from '@mui/material/Badge';
import { hasSufficientFunds } from '../minima/buyer-processes';
import Modal from '@mui/material/Modal';
import Alert from '@mui/material/Alert';
import { isContact, addContact } from '../minima';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import useIsVaultLocked from '../hooks/useIsVaultLocked';

function ListingCollectionBuyer(props) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [listing, setListing] = useState();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const navigate = useNavigate();
    const [isFriend, setIsFriend] = useState(false);
    const [status, setStatus] = useState();
    const vaultLocked = useIsVaultLocked();


    const [msg, setMsg] = useState();
    const [seller, setSeller] = useState();
    const [passwordError, setPasswordError] = useState(false);
    const [password, setPassword] = useState("");
    const [maxsoloError, setMaxsoloError] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    function handlePassword(e) {
        setPassword(e.target.value);
    }

    function handleAdd() {
        addContact(seller).then(
            ({ status, msg }) => {
                setStatus(status);
                setMsg(msg);
            },
            ({ status, msg }) => {
                setStatus(status);
                setMsg(msg);
                console.error("Error adding contact: " + msg);
            }
        )
    }

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'white',
        border: 'none',
        boxShadow: 'none',
        backgroundColor: '#FFFFFF',
        p: 4,
        justifyContent: 'center',
        textAlign: 'center'
    };


    useEffect(() => {
        getListingById(params.id).then(function (result) {
            setListing(result);
            const slr = result.created_by_pk;
            setSeller(slr);
            const pk = slr.split("#")[1];
            isContact(pk).then((res) => {
                if (res !== false) {
                    setIsFriend(true);
                }
            })
        });
    }, [params.id]);

    function handleMaxSoloLink() {
        if (!isFriend) {
            handleAdd();
        }
        link('maxsolo', function (res) {
            if (res.status === false) {
                if (res.error.includes('permission escalation')) {
                    setMaxsoloError('Linking to MaxSolo requires that you have WRITE permissions set on dbay.');
                } else {
                    setMaxsoloError(res.error);
                }
            } else if (res.status === true) {
                setMaxsoloError('');
                window.open(res.base, '_blank');
            }
        });
    }

    async function handleSend() {
        setLoading(true);
        setError(false);

        //check there is money to pay for the item first
        const hasFunds = await hasSufficientFunds(listing.price).catch(error => {
            setError('Insufficient Funds');
            setLoading(false);
            console.log(`Insufficient funds: ${error}`);
        });

        if (hasFunds) {
            purchaseListing({
                listingId: listing.listing_id,
                seller: listing.created_by_pk,
                walletAddress: listing.wallet_address,
                amount: listing.price,
                transmissionType: listing.transmission_type,
                password: password
            }).then(
                () => navigate('/info', { state: { main: "Success", sub: `You’ve successfully paid @${listing.created_by_name} $M${listing.price}` } }),
                error => {
                    if (error.message.includes("Incorrect password")) {
                        setMsg("Incorrect password");
                        setPasswordError(true);
                        setLoading(false);
                        setError(false);
                        setOpen(false);
                    } else if (error.message.includes("pending")) {
                        setMsg("Transaction is pending. You can accept/deny pending transactions on the homepage in the Minima App");
                        setLoading(false);
                        setError('Transaction is pending. You can accept/deny pending transactions on the homepage in the Minima App');
                        setOpen(false);
                    } else {
                        setMsg(error);
                        setLoading(false);
                        setError(true);
                        setOpen(false);
                    }
                }
            )
        }
    }

    if (listing) {
        if (!error) {
            return (
                <Box sx={{
                    pt: 2,
                    pb: 10,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}>


                    <Typography variant="h3">{listing.transmission_type === 'collection'
                        ? "You have arranged to collect this item"
                        : "You have arranged to have this item delivered"}</Typography>

                    <List>
                        <ListItem>
                            <ListItemAvatar>
                                {listing.image ? (
                                    <Avatar alt={listing.title} src={listing.image.split("(+_+)")[0]} style={{ borderRadius: "5px" }} />
                                ) : (
                                    <Badge anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }} color="secondary" variant="dot" invisible={!(listing.notification === 'true')}>
                                        <Avatar>
                                            <BungalowIcon />
                                        </Avatar>
                                    </Badge>
                                )}
                            </ListItemAvatar>
                            <ListItemText primary={`M$${listing.price}`} secondary={listing.title} />
                        </ListItem>
                        {listing.delivery === "true" && <><ListItem>
                        </ListItem>
                            <ListItem>
                                {listing.buyer_message
                                    ? <><Typography gutterBottom sx={{ textAlign: "left" }} component="p">
                                        {listing.buyer_message.split("\n").map((i, key) => {
                                            return <p key={key}>{i}</p>;
                                        })}
                                    </Typography></> : ""}
                            </ListItem></>}
                    </List>


                    <List>
                        <ListItem>
                            <Stack direction="column" spacing={2}>
                                <Typography>Seller: <span style={{ color: "#888787" }}>@{listing.created_by_name}</span></Typography>
                                <Button onClick={handleMaxSoloLink} color="secondary" variant="contained">CHAT NOW</Button>
                                {maxsoloError && <Alert sx={{ width: "100%" }} severity="error" variant="outlined">{maxsoloError}</Alert>}
                            </Stack>
                        </ListItem>
                        {listing.status !== 'pending_confirmation' &&
                            <ListItem>
                                <ListItemText primary={listing.transmission_type === 'collection'
                                    ? "When you are with the seller in person and you are happy with the item, click below to initiate your payment. "
                                    : "When you have received your item click below to confirm"} />
                            </ListItem>
                        }
                    </List>


                    <List>
                        <ListItem sx={{ mb: 2 }}>
                            <Typography variant="h5">Total: <span style={{ color: "#888787" }}>{`$M${listing.price}`}</span></Typography>
                        </ListItem>
                    </List>

                    <Box
                        m={1}
                        gap={3}
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                    >
                        {listing.transmission_type === 'collection' && listing.status === "in_progress" &&
                            <Stack direction="column" spacing={2} width={"100%"}>
                                <span style={{ color: "red", padding: 0, margin: 0 }} >{msg}</span>
                                {vaultLocked &&
                                    <FormControl variant="outlined">
                                        <InputLabel htmlFor="outlined-adornment-password">Vault Password</InputLabel>
                                        <OutlinedInput
                                            id="outlined-adornment-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={handlePassword}
                                            error={passwordError}
                                            required={vaultLocked}
                                            helperText="Must enter vault password if you have one"
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            label="Vault Password"
                                        />
                                    </FormControl>
                                }
                                <LoadingButton className={"custom-loading"} color="secondary" disabled={error} loading={loading} onClick={handleOpen} variant="contained">
                                    PAY NOW
                                </LoadingButton>
                                {msg && <Alert severity="warning">{msg}</Alert>}
                            </Stack>
                        }
                        {listing.status === "pending_confirmation" &&
                            <Alert severity="warning">You must confirm the transaction in the MDS menu in 'Pending Actions' to complete the order. Once accepted please check the confirmation message if the password is wrong you will have to contact the seller to complete the transaction outside of dbay.</Alert>
                        }
                    </Box>
                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                {`Pay $M${listing.price} from your Minima wallet?`}
                            </Typography>
                            <Stack direction="column" spacing={2} width={"100%"} sx={{ justifyContent: "center", textAlign: "center" }} >
                                <LoadingButton className={"custom-loading"} color="secondary" disabled={error} loading={loading} onClick={handleSend} variant="contained">
                                    PAY
                                </LoadingButton>
                                <Button sx={{ borderRadius: "510px" }} variant="outlined" onClick={handleClose}>Cancel</Button>
                            </Stack>
                        </Box>
                    </Modal>
                </Box >
            );
        } else {
            return (
                <PaymentError error={error} />
            );
        }
    } else {
        return null;
    }
}
export default ListingCollectionBuyer