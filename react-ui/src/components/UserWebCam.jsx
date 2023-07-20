import React, { useState } from 'react'
import Webcam from 'react-webcam'
import Button from '@mui/material/Button';
import { CloseTwoTone, Check } from "@mui/icons-material";
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
  const [picture, setPicture] = useState('');
  const webcamRef = React.useRef(null);
  const facingMode = "environment";

  const capture = React.useCallback(
    async () => {
      const pictureSrc = webcamRef.current.getScreenshot()
      setPicture(pictureSrc)
      let temp = [...props.images];
      temp[props.index] = pictureSrc;
      props.setImages(temp);
    },
    [webcamRef, props]);

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
          <Webcam style={{objectFit: 'cover', height: 'calc(100vh - 200px)', width: '100%'}}
            audio={false}
            height="calc(100vh - 200px)"
            minScreenshotHeight="360"
            minScreenshotWidth="640"
            ref={webcamRef}
            width="100%"
            objectFit='cover'
            screenshotFormat="image/webp"
            videoConstraints={{ ...videoConstraints, facingMode }}
            screenshotQuality={0.92}
          />
        ) : (
          <img src={picture} height={"calc(100vh - 200px)"} width={"100%"}
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
          <input type="file" accept="image/*" onChange={(e) => { 
            props.close(-1);
            props.handleFileUpload(e, props.index);
            }} hidden />
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
          {/* backgroundColor: picture ? '#6F83FF' : 'rgba(255,255,255,0.1)' */}
        <Fab style={{ backgroundColor: picture ? '#222222' : 'rgba(255,255,255,0.1)' }} disabled={!picture} color="priary" onClick={() => { props.close(-1) }}>
          <Check color={picture ? 'white' : 'grey'}/>
        </Fab>
      </Stack>
    </div>
  )
}
export default UserWebCam