import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setToken } from '../features/ui/uiSlice.js';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.ui?.token || localStorage.getItem('revterm_token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    api.dispatch(setToken(''));
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AuthStatus', 'Context', 'Metrics', 'Transactions', 'Customers'],
  endpoints: (builder) => ({
    getAuthStatus: builder.query({
      query: () => '/auth/status',
      transformResponse: (response) => response.data,
      providesTags: ['AuthStatus']
    }),
    register: builder.mutation({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body
      }),
      invalidatesTags: ['AuthStatus', 'Context']
    }),
    login: builder.mutation({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Context']
    }),
    getContext: builder.query({
      query: () => '/metrics/context',
      transformResponse: (response) => response.data,
      providesTags: ['Context']
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/metrics/profile',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Context']
    }),
    createOrganization: builder.mutation({
      query: (body) => ({
        url: '/metrics/organizations',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Context']
    }),
    updateOrganizationKey: builder.mutation({
      query: ({ id, stripeApiKey }) => ({
        url: `/metrics/organizations/${id}/key`,
        method: 'POST',
        body: { stripeApiKey }
      }),
      invalidatesTags: ['Context', 'Metrics', 'Transactions', 'Customers']
    }),
    syncStripe: builder.mutation({
      query: (organizationId) => ({
        url: `/metrics/organizations/${organizationId}/sync`,
        method: 'POST'
      }),
      invalidatesTags: ['Metrics', 'Transactions', 'Customers']
    }),
    getSummary: builder.query({
      query: ({ organizationId = '', days = 30 } = {}) => {
        const params = new URLSearchParams();
        if (organizationId) params.set('organizationId', organizationId);
        if (days) params.set('days', String(days));
        return `/metrics/summary?${params.toString()}`;
      },
      transformResponse: (response) => response.data,
      providesTags: ['Metrics']
    }),
    getTransactions: builder.query({
      query: ({ organizationId = '', limit = 25 } = {}) => {
        const params = new URLSearchParams({ limit: String(limit) });
        if (organizationId) params.set('organizationId', organizationId);
        return `/metrics/transactions?${params.toString()}`;
      },
      transformResponse: (response) => response.data,
      providesTags: ['Transactions']
    }),
    recordTransaction: builder.mutation({
      query: (body) => ({
        url: '/metrics/transactions',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Metrics', 'Transactions']
    }),
    getCustomers: builder.query({
      query: ({ organizationId = '', search = '' } = {}) => {
        const params = new URLSearchParams();
        if (organizationId) params.set('organizationId', organizationId);
        if (search) params.set('search', search);
        return `/metrics/customers?${params.toString()}`;
      },
      transformResponse: (response) => response.data,
      providesTags: ['Customers']
    }),
    createCustomer: builder.mutation({
      query: (body) => ({
        url: '/metrics/customers',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Metrics', 'Transactions', 'Customers']
    }),
    updateCustomerStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/metrics/customers/${id}`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: ['Metrics', 'Transactions', 'Customers']
    }),
    verifyLicense: builder.mutation({
      query: (body) => ({
        url: '/metrics/license/verify',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Context']
    })
  })
});

export const {
  useGetAuthStatusQuery,
  useRegisterMutation,
  useLoginMutation,
  useGetContextQuery,
  useUpdateProfileMutation,
  useCreateOrganizationMutation,
  useUpdateOrganizationKeyMutation,
  useSyncStripeMutation,
  useGetSummaryQuery,
  useGetTransactionsQuery,
  useRecordTransactionMutation,
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerStatusMutation,
  useVerifyLicenseMutation
} = apiSlice;
