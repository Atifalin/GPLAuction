import React, { useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, Chip, Stack } from '@mui/material';
import { format } from 'date-fns';
import HostControls from './HostControls';
import VisibilityIcon from '@mui/icons-material/Visibility';

const AuctionDetailCard = ({ auction, currentUser, onJoin, onView, onError }) => {
  const isHost = currentUser?._id === auction.host.userId;
  const isPending = auction.status === 'Pending';
  const isActive = auction.status === 'Active';
  const hasJoined = auction.participants?.some(p => p.userId.toString() === currentUser?._id.toString());

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Active': return 'success';
      case 'Completed': return 'default';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div">
            {auction.name}
          </Typography>
          <Chip 
            label={auction.status}
            color={getStatusColor(auction.status)}
            size="small"
          />
        </Stack>

        <Stack spacing={1} mb={2}>
          <Typography variant="body2" color="text.secondary">
            Host: {auction.host.name} {auction.host.emoji}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Created: {format(new Date(auction.createdAt), 'PPp')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Participants: {auction.participants?.length || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ghanta Coins per User: {auction.ghantaCoinsPerUser}
          </Typography>
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {isHost ? (
            <HostControls 
              auctionId={auction._id}
              auctionStatus={auction.status}
              isPaused={auction.isPaused}
              onError={onError}
            />
          ) : (
            <>
              {isPending && !hasJoined && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => onJoin(auction._id)}
                >
                  Join
                </Button>
              )}
              {(hasJoined || !isPending) && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<VisibilityIcon />}
                  onClick={() => onView(auction._id)}
                >
                  View
                </Button>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AuctionDetailCard;
