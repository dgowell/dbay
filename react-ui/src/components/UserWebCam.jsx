import React, { useState } from 'react'
import Webcam from 'react-webcam'
import Button from '@mui/material/Button';
import { PhotoCamera, CloudUpload, CloseTwoTone, ReplayCircleFilled, Check } from "@mui/icons-material";
import Fab from '@mui/material/Fab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import Stack from '@mui/material/Stack';

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
  const capture = React.useCallback(async () => {
    const pictureSrc = webcamRef.current.getScreenshot()
    setPicture(pictureSrc)
    let temp = [...props.images];
    temp[props.index] = pictureSrc;
    props.setImages(temp);
  })
  return (
    <div style={{ backgroundColor: 'black' }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ padding: '10px', textAlign: 'left' }}>
          <Button variant="contained" color="black" onClick={() => { props.close(props.index) }}><ArrowBackIcon color="white" /></Button>
        </div>
        {picture ? 
        <div style={{ position: 'absolute', marginTop: '5px', right: '5px' }}>
          <Fab style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} color="primary" onClick={(e) => {
            e.preventDefault()
            setPicture('') }}>
            <CloseTwoTone />
          </Fab>
        </div>
        : null}
        {picture === '' ? (
          <Webcam
            audio={false}
            height="100%"
            minScreenshotHeight="360"
            minScreenshotWidth="640"
            ref={webcamRef}
            width="100%"
            objectFit='cover'
            screenshotFormat="image/jpeg"
            videoConstraints={{ ...videoConstraints, facingMode }}
          />
        ) : (
          <img src={picture} height={"100%"} width={"100%"}
            style={{
              left: "0",
              right: "0",
              top: "0",
              bottom: "0",
              objectFit: "cover"
            }} alt="" />
        )}
      </div>

      <Stack p={1} pb={2} direction="row" justifyContent={'space-around'}>
        <Fab style={{backgroundColor: 'rgba(255,255,255,0.1)'}} color="primary" component="label">
          <FolderOutlinedIcon />
          <input type="file" accept="image/*" onChange={(e) => { props.close(-1); props.handleUpload(e, props.index) }} hidden />
        </Fab>
          <Fab size="large"
            color={picture ? 'clear' : 'white'}
            disabled={picture}
            onClick={(e) => {
              e.preventDefault()
              capture()
            }}
          >
            <RadioButtonCheckedIcon />
          </Fab>
        <Fab style={{ backgroundColor: picture ? '#6F83FF' : 'rgba(255,255,255,0.1)' }} disabled={!picture} color="priary" onClick={() => { props.close(-1) }}>
          <Check color={picture ? 'white' : 'grey'}/>
        </Fab>
      </Stack>
    </div>
  )
}
export default UserWebCam