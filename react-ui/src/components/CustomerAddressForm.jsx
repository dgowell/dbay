<Modal
            open={success}
            onClose={handleSuccessClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Stack spacing={2} direction="column">
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  Congratulations, you've successfully sent the money!
                </Typography>
                <Stack spacing={2} direction="row">
                  <Button onClick={handleSuccessClose} variant="contained">
                    OK
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Modal>


<Modal
  open={open}
  onClose={handleClose}
  aria-labelledby="modal-modal-title"
  aria-describedby="modal-modal-description"
>
  <Box sx={style}>
    <Stack spacing={2} direction="column">
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Request Purchase
      </Typography>
      <Typography id="modal-modal-description" sx={{ mt: 2 }}>
        Send purchase request to {listing.created_by_name} for the{" "}
        {listing.name} listed at M${listing.price}.
      </Typography>
      <Typography>Please fill in your address below:</Typography>
      <TextField
        id="outlined-multiline-static"
        label="Message for merchant"
        multiline
        rows={4}
        value={message}
        onChange={handleMessageChange}
      />
      <Stack spacing={2} direction="row">
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSend} variant="contained">
          Send
        </Button>
      </Stack>
    </Stack>
  </Box>
</Modal>;
