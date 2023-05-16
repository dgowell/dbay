import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { List, ListItem } from '@mui/material';

const InstructionPage = () => {
  return (
    <div>
      <Container>
        <Box mt={4}>
          <Typography variant="h4" align="center" gutterBottom>
            Important!
          </Typography>
        </Box>
        <List>
          <ListItem>
            <Typography variant="body1" sx={{ fontSize: '18px' }}>- This release allows the exchange of real value; be cautious.</Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body1" sx={{ fontSize: '18px' }}>- This build is not production-ready and will have major bugs.</Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body1" sx={{ fontSize: '18px' }}>- Test with small amounts and trusted contacts.</Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body1" sx={{ fontSize: '18px' }}>- Use a 'burner' node with minimal Minima for safety.</Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body1" sx={{ fontSize: '18px' }}>- Only whole numbers (integers) can be used for pricing.</Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body1" sx={{ fontSize: '18px' }}>- Grant dBay write permissions for smooth operation.</Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body1" sx={{ fontSize: '18px' }}>- Vendors can make items available to non-contact dBay users by obtaining a MAX#ADD on our Discord server.</Typography>
          </ListItem>
        </List>
      </Container>
    </div>
  );
};

export default InstructionPage;
