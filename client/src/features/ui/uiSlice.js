import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'overview', // 'overview' | 'feed' | 'customers' | 'settings'
  searchQuery: '',
  isProModalOpen: false,
  isProUnlocked: localStorage.getItem('revterm_pro') === 'true',
  soundEnabled: true
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
    toggleProModal: (state, action) => {
      state.isProModalOpen = action.payload !== undefined ? action.payload : !state.isProModalOpen;
    },
    unlockPro: (state) => {
      state.isProUnlocked = true;
      localStorage.setItem('revterm_pro', 'true');
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    }
  }
});

export const {
  setActiveTab,
  setSearchQuery,
  toggleProModal,
  unlockPro,
  toggleSound
} = uiSlice.actions;

export default uiSlice.reducer;
