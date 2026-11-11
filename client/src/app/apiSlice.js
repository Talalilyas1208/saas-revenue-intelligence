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

/**
 * Helper to patch every cached RTK Query entry matching a tag & optional orgId
 */
function patchCachedQueries(api, tagType, endpointName, orgId, updater) {
  const patches = [];
  const entries = apiSlice.util.selectInvalidatedBy(api.getState(), [{ type: tagType }]);
  for (const entry of entries) {
    if (entry.endpointName !== endpointName) continue;
    const argsOrgId = entry.originalArgs?.organizationId;
    if (orgId && argsOrgId && argsOrgId !== orgId) continue;
    patches.push(
      api.dispatch(apiSlice.util.updateQueryData(endpointName, entry.originalArgs, (draft) => updater(draft, entry.originalArgs)))
    );
  }
  return patches;
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 300, // Retain cached views & charts for 5 minutes for instant tab switching
  refetchOnReconnect: true,
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
      async onQueryStarted({ name }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          apiSlice.util.updateQueryData('getContext', undefined, (draft) => {
            if (draft?.user && name?.trim()) {
              draft.user.name = name.trim();
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ['Context']
    }),
    createOrganization: builder.mutation({
      query: (body) => ({
        url: '/metrics/organizations',
        method: 'POST',
        body
      }),
      async onQueryStarted({ name, planTier = 'free' }, { dispatch, queryFulfilled }) {
        const tempId = `temp_org_${Date.now()}`;
        const patch = dispatch(
          apiSlice.util.updateQueryData('getContext', undefined, (draft) => {
            if (draft?.organizations) {
              draft.organizations.push({
                id: tempId,
                name: name.trim(),
                currency: 'usd',
                planTier,
                hasStripeKey: false,
                maskedStripeKey: ''
              });
            }
          })
        );
        try {
          const { data: res } = await queryFulfilled;
          if (res?.data) {
            dispatch(
              apiSlice.util.updateQueryData('getContext', undefined, (draft) => {
                const idx = draft?.organizations?.findIndex((o) => o.id === tempId);
                if (idx !== undefined && idx >= 0) {
                  draft.organizations[idx] = res.data;
                }
              })
            );
          }
        } catch {
          patch.undo();
        }
      },
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
      async onQueryStarted(newTx, { dispatch, getState, queryFulfilled }) {
        const api = { dispatch, getState };
        const tempId = `temp_tx_${Date.now()}`;
        const nowIso = new Date().toISOString();
        const todayKey = nowIso.split('T')[0];
        const amountNum = Number(newTx.amount) || 0;
        const isRevenue = newTx.eventType === 'charge.succeeded' || newTx.eventType === 'invoice.paid';

        const optimisticTx = {
          id: tempId,
          organizationId: newTx.organizationId,
          eventType: newTx.eventType || 'charge.succeeded',
          amount: amountNum,
          currency: 'usd',
          customerEmail: (newTx.customerEmail || '').trim().toLowerCase(),
          description: newTx.description || 'Manual Payment',
          occurredAt: nowIso
        };

        const patches = [
          ...patchCachedQueries(api, 'Transactions', 'getTransactions', newTx.organizationId, (draft, args) => {
            draft.unshift(optimisticTx);
            if (draft.length > (args?.limit || 25)) draft.pop();
          }),
          ...patchCachedQueries(api, 'Metrics', 'getSummary', newTx.organizationId, (draft) => {
            if (isRevenue && draft?.dailyTrend) {
              const todayBucket = draft.dailyTrend.find((d) => d.date === todayKey) || draft.dailyTrend[draft.dailyTrend.length - 1];
              if (todayBucket) {
                todayBucket.revenue = Number((Number(todayBucket.revenue) + amountNum).toFixed(2));
              }
              draft.periodRevenue = Number(((draft.periodRevenue || 0) + amountNum).toFixed(2));
            }
          })
        ];

        try {
          const { data: res } = await queryFulfilled;
          if (res?.data) {
            patchCachedQueries(api, 'Transactions', 'getTransactions', newTx.organizationId, (draft) => {
              const idx = draft.findIndex((t) => t.id === tempId);
              if (idx >= 0) draft[idx] = res.data;
            });
          }
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
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
      async onQueryStarted(newCust, { dispatch, getState, queryFulfilled }) {
        const api = { dispatch, getState };
        const tempCustId = `temp_cust_${Date.now()}`;
        const tempTxId = `temp_tx_${Date.now()}`;
        const nowIso = new Date().toISOString();
        const todayKey = nowIso.split('T')[0];
        const mrrNum = Number(newCust.mrrContribution) || 0;

        const optimisticCust = {
          id: tempCustId,
          organizationId: newCust.organizationId,
          name: (newCust.name || '').trim(),
          email: (newCust.email || '').trim().toLowerCase(),
          plan: newCust.plan || `Pro ($${mrrNum}/mo)`,
          mrrContribution: mrrNum,
          status: 'active',
          joinedDate: todayKey
        };

        const optimisticTx = {
          id: tempTxId,
          organizationId: newCust.organizationId,
          eventType: 'subscription.created',
          amount: mrrNum,
          currency: 'usd',
          customerEmail: optimisticCust.email,
          description: `Subscription started: ${optimisticCust.plan}`,
          occurredAt: nowIso
        };

        const patches = [
          ...patchCachedQueries(api, 'Customers', 'getCustomers', newCust.organizationId, (draft) => {
            draft.unshift(optimisticCust);
          }),
          ...patchCachedQueries(api, 'Transactions', 'getTransactions', newCust.organizationId, (draft, args) => {
            draft.unshift(optimisticTx);
            if (draft.length > (args?.limit || 25)) draft.pop();
          }),
          ...patchCachedQueries(api, 'Metrics', 'getSummary', newCust.organizationId, (draft) => {
            if (!draft) return;
            draft.mrr = Number((Number(draft.mrr || 0) + mrrNum).toFixed(2));
            draft.arr = Number((draft.mrr * 12).toFixed(2));
            draft.activeSubscribers = (draft.activeSubscribers || 0) + 1;
            draft.totalSubscribers = (draft.totalSubscribers || 0) + 1;
            if (draft.dailyTrend) {
              const todayBucket = draft.dailyTrend.find((d) => d.date === todayKey) || draft.dailyTrend[draft.dailyTrend.length - 1];
              if (todayBucket) {
                todayBucket.revenue = Number((Number(todayBucket.revenue) + mrrNum).toFixed(2));
              }
            }
          })
        ];

        try {
          const { data: res } = await queryFulfilled;
          if (res?.data) {
            patchCachedQueries(api, 'Customers', 'getCustomers', newCust.organizationId, (draft) => {
              const idx = draft.findIndex((c) => c.id === tempCustId);
              if (idx >= 0) draft[idx] = res.data;
            });
          }
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: ['Metrics', 'Transactions', 'Customers']
    }),
    updateCustomerStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/metrics/customers/${id}`,
        method: 'PATCH',
        body: { status }
      }),
      async onQueryStarted({ id, status }, { dispatch, getState, queryFulfilled }) {
        const api = { dispatch, getState };
        let matchedCustomer = null;
        let previousStatus = null;

        const custPatches = patchCachedQueries(api, 'Customers', 'getCustomers', '', (draft) => {
          const item = draft.find((c) => c.id === id);
          if (item) {
            matchedCustomer = { ...item };
            previousStatus = item.status;
            item.status = status;
          }
        });

        const patches = [...custPatches];

        if (matchedCustomer && previousStatus !== status) {
          const mrrDelta =
            status === 'active' && previousStatus !== 'active'
              ? Number(matchedCustomer.mrrContribution)
              : status !== 'active' && previousStatus === 'active'
              ? -Number(matchedCustomer.mrrContribution)
              : 0;
          const activeDelta =
            status === 'active' && previousStatus !== 'active'
              ? 1
              : status !== 'active' && previousStatus === 'active'
              ? -1
              : 0;

          patches.push(
            ...patchCachedQueries(api, 'Metrics', 'getSummary', matchedCustomer.organizationId, (draft) => {
              if (!draft) return;
              draft.mrr = Math.max(0, Number((Number(draft.mrr || 0) + mrrDelta).toFixed(2)));
              draft.arr = Number((draft.mrr * 12).toFixed(2));
              draft.activeSubscribers = Math.max(0, (draft.activeSubscribers || 0) + activeDelta);
            }),
            ...patchCachedQueries(api, 'Transactions', 'getTransactions', matchedCustomer.organizationId, (draft, args) => {
              const evtType =
                status === 'canceled'
                  ? 'subscription.canceled'
                  : status === 'past_due'
                  ? 'charge.failed'
                  : 'invoice.paid';
              draft.unshift({
                id: `temp_status_${Date.now()}`,
                organizationId: matchedCustomer.organizationId,
                eventType: evtType,
                amount: matchedCustomer.mrrContribution,
                currency: 'usd',
                customerEmail: matchedCustomer.email,
                description:
                  status === 'canceled'
                    ? `Subscription canceled (${matchedCustomer.plan})`
                    : status === 'past_due'
                    ? `Payment overdue (${matchedCustomer.plan})`
                    : `Subscription active (${matchedCustomer.plan})`,
                occurredAt: new Date().toISOString()
              });
              if (draft.length > (args?.limit || 25)) draft.pop();
            })
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
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
