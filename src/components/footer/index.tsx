import { Box, Divider, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box>
      <Divider />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        my={3}
      >
        <Typography variant="body2">TMP ADMIN</Typography>
        <Typography variant="body2">{`© ${new Date().getFullYear()} - TMP WEB`}</Typography>
      </Box>
    </Box>
  );
};

export default Footer;
