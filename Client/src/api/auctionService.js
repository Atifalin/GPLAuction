import api from './axios';

export const auctionService = {
  // Get all auctions
  getAllAuctions: async () => {
    const response = await api.get('/auctions');
    return response.data;
  },

  // Create new auction
  createAuction: async (auctionData) => {
    const response = await api.post('/auctions/create', auctionData);
    return response.data;
  },

  // Get auction by ID
  getAuctionById: async (auctionId) => {
    const response = await api.get(`/auctions/${auctionId}`);
    return response.data;
  },

  // Join auction
  joinAuction: async (auctionId) => {
    const response = await api.post(`/auctions/${auctionId}/join`);
    return response.data;
  },

  // Start auction
  startAuction: async (auctionId) => {
    const response = await api.post(`/auctions/${auctionId}/start`);
    return response.data;
  },

  // Pause/Resume auction
  togglePauseAuction: async (auctionId) => {
    const response = await api.post(`/auctions/${auctionId}/pause`);
    return response.data;
  },

  // End auction
  endAuction: async (auctionId) => {
    const response = await api.post(`/auctions/${auctionId}/end`);
    return response.data;
  },

  // Delete auction
  deleteAuction: async (auctionId) => {
    const response = await api.delete(`/auctions/${auctionId}`);
    return response.data;
  }
};
