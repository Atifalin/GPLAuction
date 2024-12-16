import React from 'react';
import { Button, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { auctionService } from '../api/auctionService';
import { socket } from '../socket';
import { useNavigate } from 'react-router-dom';

const HostControls = ({ auctionId, auctionStatus, isPaused, onError }) => {
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      await auctionService.startAuction(auctionId);
      socket.emit('auctionStateChange', {
        auctionId,
        state: { status: 'Active', isPaused: false },
        userId: JSON.parse(localStorage.getItem('user'))._id
      });
    } catch (error) {
      onError?.(error.response?.data?.message || 'Failed to start auction');
    }
  };

  const handlePause = async () => {
    try {
      await auctionService.togglePauseAuction(auctionId);
      socket.emit('auctionStateChange', {
        auctionId,
        state: { isPaused: !isPaused },
        userId: JSON.parse(localStorage.getItem('user'))._id
      });
    } catch (error) {
      onError?.(error.response?.data?.message || 'Failed to pause/resume auction');
    }
  };

  const handleEnd = async () => {
    try {
      await auctionService.endAuction(auctionId);
      socket.emit('auctionStateChange', {
        auctionId,
        state: { status: 'Completed' },
        userId: JSON.parse(localStorage.getItem('user'))._id
      });
    } catch (error) {
      onError?.(error.response?.data?.message || 'Failed to end auction');
    }
  };

  const handleDelete = async () => {
    try {
      await auctionService.deleteAuction(auctionId);
      socket.emit('auctionDeleted', {
        auctionId,
        userId: JSON.parse(localStorage.getItem('user'))._id
      });
      // Navigate with success message
      navigate('/auctions', { 
        state: { 
          message: 'Auction deleted successfully'
        }
      });
    } catch (error) {
      onError?.(error.response?.data?.message || 'Failed to delete auction');
    }
  };

  const handleView = () => {
    navigate(`/auction/${auctionId}`);
  };

  return (
    <Stack direction="row" spacing={1}>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<VisibilityIcon />}
        onClick={handleView}
      >
        View
      </Button>

      {auctionStatus === 'Pending' && (
        <>
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayArrowIcon />}
            onClick={handleStart}
          >
            Start
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </>
      )}
      
      {auctionStatus === 'Active' && (
        <>
          <Button
            variant="contained"
            color={isPaused ? "success" : "warning"}
            startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            onClick={handlePause}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleEnd}
          >
            End
          </Button>
        </>
      )}
    </Stack>
  );
};

export default HostControls;
