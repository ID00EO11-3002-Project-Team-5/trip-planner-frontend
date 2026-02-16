/**
 * API Client for Trip Planner Backend
 * 
 * Handles all HTTP requests to the backend API with authentication
 * Automatically switches between local development and production
 */

// Automatically detect environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Log the API URL in development for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔌 API Client connected to:', API_URL);
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Generic API call handler with authentication
 */
async function apiCall<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  // Get auth token from localStorage or your auth provider
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ==================== AUTH API ====================

export const authApi = {
  signup: async (email: string, password: string, name?: string) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: { email, password, name },
    });
  },

  login: async (email: string, password: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST',
    });
  },
};

// ==================== TRIPS API ====================

export interface Trip {
  id_trip: string;
  title_trip: string;
  description_trip?: string | null;
  startdate_trip: string;
  enddate_trip: string;
  id_user_creator: string;
  createdat_trip?: string | null;
}

export const tripsApi = {
  getAll: async (): Promise<Trip[]> => {
    return apiCall('/trips');
  },

  getById: async (id: string): Promise<Trip> => {
    return apiCall(`/trips/${id}`);
  },

  create: async (trip: Partial<Trip>): Promise<Trip> => {
    return apiCall('/trips', {
      method: 'POST',
      body: trip,
    });
  },

  update: async (id: string, trip: Partial<Trip>): Promise<Trip> => {
    return apiCall(`/trips/${id}`, {
      method: 'PUT',
      body: trip,
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiCall(`/trips/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== EXPENSES API ====================

export interface ExpenseShare {
  id_user: string;
  shareamount_exsh: number;
}

export interface ExpensePayer {
  id_user: string;
  payeramount_expa: number;
}

export interface Expense {
  id_expe: string;
  id_trip: string;
  title_expe: string;
  amount_expe: number;
  currency_expe: 'USD' | 'EUR' | 'GBP';
  createdat_expe: string;
  created_by: string;
  t_expense_share_exsh?: ExpenseShare[];
  t_expense_payer_expa?: ExpensePayer[];
}

export interface CreateExpensePayload {
  id_trip: string;
  title_expe: string;
  amount_expe: number;
  currency_expe: 'USD' | 'EUR' | 'GBP';
  shares: ExpenseShare[];
}

export interface UpdateExpensePayload {
  title_expe?: string;
  amount_expe?: number;
  currency_expe?: 'USD' | 'EUR' | 'GBP';
  shares?: ExpenseShare[];
}

export const expensesApi = {
  getByTrip: async (tripId: string): Promise<Expense[]> => {
    return apiCall(`/expenses?tripId=${tripId}`);
  },

  create: async (expense: CreateExpensePayload): Promise<Expense> => {
    return apiCall('/expenses', {
      method: 'POST',
      body: expense,
    });
  },

  update: async (id: string, expense: UpdateExpensePayload): Promise<Expense> => {
    return apiCall(`/expenses/${id}`, {
      method: 'PUT',
      body: expense,
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiCall(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== SETTLEMENTS API ====================

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export const settlementsApi = {
  getByTrip: async (tripId: string): Promise<Settlement[]> => {
    return apiCall(`/settlements?tripId=${tripId}`);
  },
};

// ==================== ITINERARY API ====================

export interface ItineraryItem {
  id: string;
  trip_id: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  order_index?: number;
  created_at?: string;
}

export const itineraryApi = {
  getByTrip: async (tripId: string): Promise<ItineraryItem[]> => {
    return apiCall(`/itinerary/trip/${tripId}`);
  },

  create: async (item: Partial<ItineraryItem>): Promise<ItineraryItem> => {
    return apiCall('/itinerary', {
      method: 'POST',
      body: item,
    });
  },

  reorder: async (tripId: string, itemIds: string[]): Promise<void> => {
    return apiCall('/itinerary/reorder', {
      method: 'PATCH',
      body: { tripId, itemIds },
    });
  },

  delete: async (itemId: string): Promise<void> => {
    return apiCall(`/itinerary/${itemId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== DESTINATION STOPS API ====================

export interface DestinationStop {
  id: string;
  trip_id: string;
  name: string;
  latitude: number;
  longitude: number;
  order_index?: number;
  notes?: string;
  created_at?: string;
}

export const stopsApi = {
  create: async (stop: Partial<DestinationStop>): Promise<DestinationStop> => {
    return apiCall('/stops', {
      method: 'POST',
      body: stop,
    });
  },

  reorder: async (tripId: string, stopIds: string[]): Promise<void> => {
    return apiCall('/stops/reorder', {
      method: 'PATCH',
      body: { tripId, stopIds },
    });
  },
};

// ==================== HEALTH CHECK ====================

export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    return apiCall('/health');
  },
};

// Export the API client as default
const apiClient = {
  auth: authApi,
  trips: tripsApi,
  expenses: expensesApi,
  settlements: settlementsApi,
  itinerary: itineraryApi,
  stops: stopsApi,
  health: healthApi,
};

export default apiClient;
