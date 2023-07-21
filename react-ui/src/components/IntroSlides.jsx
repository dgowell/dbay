import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import crypto from '../assets/images/crypto.png';
import free from '../assets/images/free-forever.png';
import revolution from '../assets/images/revolution.png';
import marketplace from '../assets/images/marketplace.png';
import Box from '@mui/material/Box';

const slides = [
  {
    content: (
      <div>
        <img src={marketplace} alt="description of image" />
        <Typography sx={{width: '75%', margin: 'auto'}} variant="body1">The only decentralised marketplace in the world</Typography>
      </div>
    ),
  },
  {
    content: (
      <div>
        <img src={free} alt="description of image" />
        <Typography sx={{width: '75%', margin: 'auto'}} variant="body1">Buy and sell anything with anyone privately, for free, forever</Typography>
      </div>
    ),
  },
  {
    content: (
      <div>
        <img src={crypto} alt="description of image" />
        <Typography sx={{width: '75%', margin: 'auto', minHeight: '48px'}} variant="body1">Pay and be paid in crypto</Typography>
      </div>
    ),
  },
  {
    content: (
      <div>
        <img src={revolution} alt="description of image" />
        <Typography sx={{width: '75%', margin: 'auto', minHeight: '48px'}} variant="body1">Welcome to the exchange revolution</Typography>
      </div>
    ),
  },
];

function handleClick() {
  window.location.href = '/create-listing';
}

function SlideDots({ currentSlide, onClick }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' , marginTop: 30}}>
      {slides.map((slide, index) => (
        <span
          key={index}
          onClick={() => onClick(index)}
          style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: currentSlide === index ? "black" : "grey",
            margin: "auto 5px",
            cursor: "pointer",
          }}
        />
      ))}
    </div>
  );
}

function IntroSlides() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearTimeout(timer); // Clean up timer
  }, [currentSlide]);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60%', marginTop: 3, textAlign: 'center'  }}>
        <Typography variant="body1">{slides[currentSlide].content}</Typography>
      </Box>
      <SlideDots currentSlide={currentSlide} onClick={handleDotClick} />
      <Button sx={{marginTop: '50px'}} variant="contained" onClick={handleClick}>Create Listing</Button>
    </div>
  );
}

export default IntroSlides;