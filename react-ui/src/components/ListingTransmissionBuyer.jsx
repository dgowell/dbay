import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LoadingButton from '@mui/lab/LoadingButton';
import { getListingById } from '../database/listing';
import { useNavigate } from "react-router";
import { purchaseListing, cancelCollection } from '../minima/buyer-processes';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';

import ListItemText from "@mui/material/ListItemText";

import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import BackButton from './BackButton';
import PaymentError from './PaymentError';
import BungalowIcon from "@mui/icons-material/Bungalow";
import Badge from '@mui/material/Badge';
import { hasSufficientFunds } from '../minima/buyer-processes';
import { updateListing } from '../database/listing';
import { sendPurchaseReceipt } from '../minima/buyer-processes';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Divider from "@mui/material/Divider";
import Modal from '@mui/material/Modal';
import Alert from '@mui/material/Alert';
import { isContact,addContact } from '../minima';

function ListingCollectionBuyer(props) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [listing, setListing] = useState();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const navigate = useNavigate();
    const [intro, setIntro] = useState('');
    const [isFriend,setIsFriend]=useState(false);
    const [status, setStatus] = useState();
    const [msg, setMsg] = useState();
    const [seller, setSeller] = useState();


    async function handleAdd() {
        const { msg, status } = await addContact(seller);
        setStatus(status);
        setMsg(msg);
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
        justifyContent:'center',
        textAlign:'center'
      };

    useEffect(() => {
        if (listing) {
            setIntro(encodeURI(`Hi ${listing.created_by_name} this is ${listing.buyer_name} from dbay - when can I come and collect the ${listing.title}?`));
        }
    }, [listing]);


    useEffect(() => {
        getListingById(params.id).then(function (result) {
            setListing(result);
            const slr = result.created_by_pk;
            setSeller(slr);
            const pk = slr.split("#")[1];
            isContact(pk).then((res)=>{
                if(res!==false){
                    setIsFriend(true);
                }
            })
        });
    }, [params.id]);

    async function handleSend() {
        setLoading(true);
        setError(false);

        //check there is money to pay for the item first
        const hasFunds = await hasSufficientFunds(listing.price).catch(error => {
            setError('Insufficient Funds');
            setLoading(false);
            console.log(`Insufficient funds: ${error}`);
        });

        if (hasFunds|| (process.env.REACT_APP_MODE==="testvalue")) {
            if (process.env.REACT_APP_MODE ==="testvalue"){
                updateListing(listing.listing_id, 'status', 'purchased').catch((e) => console.error(e));
                updateListing(listing.listing_id, 'transmission_type',  listing.transmission_type).catch((e)=>console.error(e));
                sendPurchaseReceipt({
                    listingId: listing.listing_id,
                    coinId:"0x1asd234", seller: listing.created_by_pk,
                    transmissionType: listing.transmission_type })
               // navigate('/payment-success');
               setTimeout(navigate('/info',{state:{main:"Success",sub:`You’ve successfully paid @${listing.created_by_name} $M${listing.price}`}}), 1000);
              }else{
                    purchaseListing({
                        listingId: listing.listing_id,
                        seller: listing.created_by_pk,
                        walletAddress: listing.wallet_address,
                        purchaseCode: listing.purchase_code,
                        amount: listing.price,
                        transmissionType: listing.transmission_type,
                    }).then(
                        () =>navigate('/info',{state:{main:"Success",sub:`You’ve successfully paid @${listing.created_by_name} $M${listing.price}`}}),
                        error =>navigate('/info',{state:{action:"error",main:"Payment Failed!",sub:`This has happened either because dbay has not been given WRITE permission, or your wallet is password protected. Or both.`}}) //setError(error.message)
                    )
                 }
         }
    }
    function handleCancel() {
        cancelCollection({
            listingId: listing.listing_id,
            seller: listing.created_by_pk
        })
    }

    function handleReceived(){
        updateListing(listing.listing_id, 'status', 'purchased').catch((e) => console.error(e)); 
        navigate('/seller/listings/')
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
    <Accordion sx={{boxShadow:"none"}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography sx={{fontWeight:700,fontSize:"20px"}}>View Listing</Typography>
        </AccordionSummary>
        <AccordionDetails>
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
           {listing.delivery ==="true" && <><ListItem>
            </ListItem>
            <ListItem>
            {listing.buyer_message
            ?<><Typography gutterBottom sx={{textAlign:"left"}} component="p">
                {listing.buyer_message.split("\n").map((i, key) => {
                return <p key={key}>{i}</p>;
                })}
                </Typography></> : ""}
            </ListItem></>}
        </List>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={true} sx={{boxShadow:"none"}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography sx={{fontWeight:700,fontSize:"20px"}}>Contact Seller</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        p: 2,
                        gap: 3,
                    }}>
                        {listing.transmission_type === 'collection' &&
                            // <Box>
                            //     <Typography mb={3} gutterBottom component="div">Please wait for the seller to arrange collection on Whatsapp.</Typography>
                            //     <Typography gutterBottom component="div">When you have collected the item and are happy with it, you can complete the purchase by paying the seller using the button below</Typography>
                            // </Box>
                            <List>
                                <ListItem>
                                    <ListItemText primaryTypographyProps={{fontSize: 16,fontWeight:700}} primary={(!isFriend ?  `Add @${listing.created_by_name}.` : `@${listing.created_by_name} is already a contact. `) +`Chat over MaxSolo, meet and pay when you are with the seller.`}/>                    
                                </ListItem>
                                <ListItem>
                                    {!isFriend && <><LoadingButton className={"custom-loading"} sx={{width:"100%"}} color="primary" variant="contained" onClick={() => handleAdd()}>add Contact</LoadingButton>
                                    {msg && <Alert sx={{ width: "100%" }} severity={status ? 'success' : 'error'} variant="outlined">{msg}</Alert>}
                                    </>}
                                </ListItem>
                                <Divider/>
                                <ListItem>
                                    <ListItemText primary="When you are with the seller in person and you are happy with the item, click below to initiate your payment. " />
                                </ListItem>
                            </List>
                        }
                        {listing.transmission_type === 'delivery' &&
                        <List>
                            <ListItem>
                                <ListItemText primaryTypographyProps={{fontSize: 16,fontWeight:700}} primary={(!isFriend ?  `Add @${listing.created_by_name}. ` : `@${listing.created_by_name} is already a contact. `) +`Chat over MaxSolo, meet and pay when you are with the seller.`}/>                    
                            </ListItem>
                            <ListItem>
                                {!isFriend && <><LoadingButton className={"custom-loading"} sx={{width:"100%"}} color="primary" variant="contained" onClick={() => handleAdd()}>add Contact</LoadingButton>
                                {msg && <Alert sx={{ width: "100%" }} severity={status ? 'success' : 'error'} variant="outlined">{msg}</Alert>}
                                </>}
                            </ListItem>
                            <Divider/>
                            <ListItem>
                                <ListItemText primary="When you have received your item click below to confirm " />
                            </ListItem>
                        </List>
                        }
                    </Box>

        </AccordionDetails>
      </Accordion>
      <List>
        <ListItem sx={{mb:2}}>
            <span style={{fontWeight: 700,fontSize: "20px",color:"#2C2C2C"}}>Total</span> <span style={{marginLeft:"60%",color:"#888787",fontSize:"20px"}}>{`$M${listing.price}`}</span>
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
                        {listing.transmission_type === 'collection' &&
                            <Stack mt={15} direction="row" spacing={2} width={"100%"}>
                                <LoadingButton className={"custom-loading"} color="secondary" disabled={error} loading={loading} onClick={handleOpen} variant="contained">
                                     PAY NOW
                                </LoadingButton>
                                {/* <Button variant="outlined" onClick={handleCancel}>Cancel</Button> */}
                            </Stack>
                        }
                            {listing.transmission_type === 'delivery' && <></>
                            // <Stack mt={15} direction="row" spacing={2} width={"100%"}>
                            //     <Stack spacing={2} sx={{paddingLeft: 2, paddingRight: 2}}>
                            //     <LoadingButton className={"custom-loading"} color={"secondary"}  loading={loading} onClick={handleReceived} variant="contained">
                            //          Item Received
                            //     </LoadingButton>
                            //     <Typography sx={{ textAlign: 'center', marginTop: '15px', flex: 1 }} variant="caption">Once seller confirms the delivery kindly  acknowledge</Typography>
                            //     </Stack>
                            //     {/* <Button variant="outlined" onClick={handleCancel}>Cancel</Button> */}
                            // </Stack>
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
                            <Stack mt={15} direction="column" spacing={2} width={"100%"} sx={{justifyContent:"center",textAlign:"center"}} >
                                <LoadingButton className={"custom-loading"} color="secondary" disabled={error} loading={loading} onClick={handleSend} variant="contained">
                                     PAY
                                </LoadingButton>
                                <Button sx={{borderRadius:"510px"}} variant="outlined" onClick={handleClose}>Cancel</Button>
                            </Stack>
                          </Box>
                        </Modal>
                </Box>
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