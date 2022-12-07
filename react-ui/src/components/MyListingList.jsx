import React, { useEffect ,useState } from "react";
import { styled } from "@mui/material/styles";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ListingList from "./ListingList";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ListingCreate from "./ListingCreate";
import { getListings } from "../database/listing";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

function MyListingList(props) {
  const [expanded, setExpanded] = React.useState(false);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    getListings()
      .then((data) => {
        setListings(data);
        console.log(`results: ${data}`);
      })
      .catch((e) => {
        console.error(e);
      });
    return;
  }, []);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  return (
    <div>
          <CardContent>
            <Typography gutterBottom variant="h3" component="div">
              {`${props.storeName}'s Listings`}
            </Typography>
            <ListingList listings={listings} />
          </CardContent>
          <CardActions disableSpacing>
            <IconButton aria-label="share">
              <ShareIcon />
            </IconButton>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </CardActions>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
              <ListingCreate storeId={props.storePubkey} />
            </CardContent>
          </Collapse>
    </div>
  );
}
export default MyListingList;
