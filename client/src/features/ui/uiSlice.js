import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('revterm_token') || '',
  activeTab: 'overview', // 'overview' | 'feed' | 'customers' | 'settings'
  searchQuery: '',
  dateRange: '30D', // '7D' | '30D' | '90D' | '1Y'
  isProModalOpen: false,
  isRecordPaymentOpen: false,
  soundEnabled: true,
  isLivePaused: false,
  activeOrgId: localStorage.getItem('revterm_active_org') || ''
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem('revterm_token', action.payload);
      } else {
        localStorage.removeItem('revterm_token');
        localStorage.removeItem('revterm_active_org');
        state.activeOrgId = '';
      }
    },
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
    toggleRecordPaymentModal: (state, action) => {
      state.isRecordPaymentOpen = action.payload !== undefined ? action.payload : !state.isRecordPaymentOpen;
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
    toggleLivePaused: (state) => {
      state.isLivePaused = !state.isLivePaused;
    },
    setActiveOrgId: (state, action) => {
      state.activeOrgId = action.payload;
      if (action.payload) {
        localStorage.setItem('revterm_active_org', action.payload);
      }
    }
  }
});

export const {
  setToken,
  setActiveTab,
  setSearchQuery,
  setDateRange,
  toggleProModal,
  toggleRecordPaymentModal,
  toggleSound,
  toggleLivePaused,
  setActiveOrgId
} = uiSlice.actions;

export default uiSlice.reducer;
