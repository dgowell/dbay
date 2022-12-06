import React, { useEffect } from "react";
import { styled } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { getListingById } from "../db";
import ListingList from "./ListingList";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ListingCreate from "./ListingCreate";

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

function ListingDetail() {
  const params = useParams();
  const [Listing, setListing] = React.useState();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    getListingById(params.id).then(function (result) {
      setListing(result);
    });
  }, [params.id]);

  return (
    <div>
      {Listing ? (
        <Card sx={{ maxWidth: 345, mt: 2 }}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {Listing.NAME}
            </Typography>
            <ListingList ListingId={Listing.Listing_PUBKEY} />
          </CardContent>
          <CardActions disableSpacing>
            <IconButton aria-label="add to favorites">
              <FavoriteIcon />
            </IconButton>
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
              <ListingCreate ListingId={Listing.Listing_PUBKEY} />
            </CardContent>
          </Collapse>
        </Card>
      ) : null}
    </div>
  );
}
export default ListingDetail;
