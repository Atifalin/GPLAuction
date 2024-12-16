import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Stack,
  Typography,
  Alert
} from '@mui/material';

const CreateAuctionDialog = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    ghantaCoins: 100,
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Please enter an auction name');
      return;
    }
    if (formData.ghantaCoins < 50 || formData.ghantaCoins > 1000) {
      setError('Ghanta Coins per user must be between 50 and 1000');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Auction</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            name="name"
            label="Auction Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <FormControl fullWidth>
            <InputLabel htmlFor="ghantaCoins">Ghanta Coins per User</InputLabel>
            <OutlinedInput
              id="ghantaCoins"
              name="ghantaCoins"
              type="number"
              value={formData.ghantaCoins}
              onChange={handleChange}
              startAdornment={<InputAdornment position="start">GC</InputAdornment>}
              label="Ghanta Coins per User"
            />
            <Typography variant="caption" color="text.secondary">
              Each user will receive this amount of Ghanta Coins when they join (50-1000 GC)
            </Typography>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Create Auction
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAuctionDialog;
