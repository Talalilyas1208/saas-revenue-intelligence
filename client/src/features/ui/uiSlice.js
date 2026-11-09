import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'overview', // 'overview' | 'feed' | 'customers' | 'settings'
  searchQuery: '',
  dateRange: '30D', // '7D' | '30D' | '90D' | '1Y'
  isProModalOpen: false,
  isProUnlocked: localStorage.getItem('revterm_pro') === 'true',
  soundEnabled: true,
  isLivePaused: false,
  activeWorkspace: 'SaaSify Inc'
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    toggleProModal: (state, action) => {
      state.isProModalOpen = action.payload !== undefined ? action.payload : !state.isProModalOpen;
    },
    unlockPro: (state) => {
      state.isProUnlocked = true;
      localStorage.setItem('revterm_pro', 'true');
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
    toggleLivePaused: (state) => {
      state.isLivePaused = !state.isLivePaused;
    },
    setActiveWorkspace: (state, action) => {
      state.activeWorkspace = action.payload;
    }
  }
});

export const {
  setActiveTab,
  setSearchQuery,
  setDateRange,
  toggleProModal,
  unlockPro,
  toggleSound,
  toggleLivePaused,
  setActiveWorkspace
} = uiSlice.actions;

export default uiSlice.reducer;
