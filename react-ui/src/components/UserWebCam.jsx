import React, { useState } from 'react'
import Webcam from 'react-webcam'
import Button from '@mui/material/Button';
import { PhotoCamera,CloudUpload,CloseTwoTone,ReplayCircleFilled,Check,Cameraswitch } from "@mui/icons-material";
const videoConstraints = {
  width: 1080,
  height: 720
}
const UserWebCam = (props) => {
  const [picture, setPicture] = useState('')
  const [facingMode, setFacingMode] = React.useState("environment");
  const webcamRef = React.useRef(null)
  const handleSwitch = React.useCallback(() => {
    setFacingMode(
      prevState =>
        prevState === "environment"
          ? "user"
          : "environment"
    );
  }, []);
  const capture = React.useCallback(async() => {
    const pictureSrc = webcamRef.current.getScreenshot()
    setPicture(pictureSrc)
    let temp = [...props.images];
    temp[props.index] = pictureSrc;
    props.setImages(temp);
  })
  return (
    <div>
      <div style={{textAlign:"center",height:600}}>
        {picture === '' ? (
          <Webcam
            audio={false}
            height="100%"
            ref={webcamRef}
            width="100%"
            screenshotFormat="image/jpeg"
            videoConstraints={{...videoConstraints,facingMode}}
          />
        ) : (
          <img src={picture} height={"100%"} width={"100%"} style={{                left: "0",
          right: "0",
          top: "0",
          bottom: "0",
          objectFit: "cover"}} alt=""/>
        )}
      </div>
      <div style={{textAlign:"center"}}>
        <Button color="primary" onClick={(e)=>{handleSwitch()}}><Cameraswitch/></Button>
        {picture !== '' ? (
          <Button

            color="primary"
            onClick={(e) => {
              e.preventDefault()
              setPicture('')
            }}
          >
            <ReplayCircleFilled />
          </Button>
        ) : (
          <Button
            onClick={(e) => {
              e.preventDefault()
              capture()
            }}
            color="primary"
          >
            <PhotoCamera/>
          </Button>
        )}

            <Button  color="primary" component="label">
              <CloudUpload/>
            <input type="file" accept="image/*" onChange={(e)=>{props.close(-1); props.handleUpload(e,props.index)}} hidden/>
            </Button>
            {picture ==='' ?
            <Button  color="primary" onClick={()=>{props.close(props.index)}}>
              <CloseTwoTone/>
            </Button> : <Button  color="primary" onClick={()=>{props.close(-1)}}>
              <Check/>
            </Button> }
      </div>
      <div>
          
      </div>  
    </div>
  )
}
export default UserWebCam