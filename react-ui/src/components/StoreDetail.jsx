import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { getStoreById } from "../db";

function StoreDetail() {
  const params = useParams();
  const [store, setStore] = React.useState();

  useEffect(() => {
    getStoreById(params.id).then(function (result) {
      setStore(result);
    });
  }, []);

  return (
    <div>
    { store
    ? <Card sx={{ maxWidth: 345, mt: 2 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {store.NAME}
        </Typography>
      </CardContent>
    </Card>
    : null}
   </div> 
  );
}
export default StoreDetail;
