import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      my={2}
    >
      <Typography variant="body1">TMP ADMIN</Typography>
      <Typography variant="body1">{`© ${new Date().getFullYear()} - TMP WEB`}</Typography>
    </Box>
  );
};

export default Footer;
