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

</Modal>;
