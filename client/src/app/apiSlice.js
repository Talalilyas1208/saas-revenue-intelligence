import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers) => {
      // In production, grab JWT from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Metrics', 'Transactions', 'Customers'],
  endpoints: (builder) => ({
    getSummary: builder.query({
      query: () => '/metrics/summary',
      transformResponse: (response) => response.data,
      providesTags: ['Metrics'],
    }),
    getTransactions: builder.query({
      query: (limit = 20) => `/metrics/transactions?limit=${limit}`,
      transformResponse: (response) => response.data,
      providesTags: ['Transactions'],
    }),
    getCustomers: builder.query({
      query: (search = '') => `/metrics/customers?search=${encodeURIComponent(search)}`,
      transformResponse: (response) => response.data,
      providesTags: ['Customers'],
    }),
    simulateTransaction: builder.mutation({
      query: () => ({
        url: '/metrics/simulate',
        method: 'POST'
      }),
      invalidatesTags: ['Metrics', 'Transactions']
    })
  })
});

export const {
  useGetSummaryQuery,
  useGetTransactionsQuery,
  useGetCustomersQuery,
  useSimulateTransactionMutation,
} = apiSlice;
