import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { List, ListItem, ListItemText } from '@mui/material';

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
          {[
            "This release allows the irriversable exchange of real value; be cautious.",
            "This build is not production-ready and will have major bugs.",
            "Test with small amounts and trusted contacts.",
            "Use a 'burner' node with minimal Minima for safety.",
            "Only whole numbers (integers) can be used for pricing.",
            "Grant dBay write permissions for smooth operation, or expect error messages.",
            "Vendors can obtaining a permanent MAX# on the dBay Discord server."
          ].map((text, index) => (
            <ListItem key={index}>
              <ListItemText>
                <Typography variant="body1" component="span" sx={{ fontSize: '20px' }}>
                  &ndash;&nbsp;
                </Typography>
                <Typography variant="body1" component="span" sx={{ fontSize: '20px' }}>
                  {text}
                </Typography>
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </Container>
    </div>
  );
};

export default InstructionPage;
