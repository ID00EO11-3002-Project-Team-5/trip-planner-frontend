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

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      // Clear authentication data
      localStorage.removeItem('authToken');
      
      // Dispatch custom event to notify auth context
      window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'token-expired' } }));
      
      // Redirect to login with expired flag
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        window.location.href = '/login?expired=true';
      }
    }
    
    const error = await response.json().catch(() => ({ error: 'Token is invalid or expired' }));
    throw new Error(error.error || 'Token is invalid or expired');
  }

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

export interface LocationData {
  name_loca: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
}

export interface ItineraryItem {
  id_itit: string;
  id_trip: string;
  title_itit: string;
  date_itit: string; // YYYY-MM-DD
  time_itit?: string; // HH:mm:ss
  location_itit?: string | null;
  cost_itit?: number | null;
  position_itit: number;
  id_loca?: string | null;
  formal_location?: LocationData | null;
}

export interface ItineraryCostSummary {
  tripId: string;
  totalCost: number;
  currency: string;
  itemsCount: number;
}

export const itineraryApi = {
  getByTrip: async (tripId: string): Promise<ItineraryItem[]> => {
    return apiCall(`/itinerary/trip/${tripId}`);
  },

  create: async (item: Omit<ItineraryItem, 'id_itit' | 'formal_location'>): Promise<ItineraryItem> => {
    return apiCall('/itinerary', {
      method: 'POST',
      body: item,
    });
  },

  update: async (itemId: string, updates: Partial<Omit<ItineraryItem, 'id_itit' | 'formal_location'>>): Promise<ItineraryItem> => {
    return apiCall(`/itinerary/${itemId}`, {
      method: 'PATCH',
      body: updates,
    });
  },

  reorder: async (tripId: string, updates: { id_itit: string; position_itit: number }[]): Promise<void> => {
    return apiCall('/itinerary/reorder', {
      method: 'PATCH',
      body: { tripId, updates },
    });
  },

  delete: async (itemId: string): Promise<void> => {
    return apiCall(`/itinerary/${itemId}`, {
      method: 'DELETE',
    });
  },

  getCostSummary: async (tripId: string): Promise<ItineraryCostSummary | null> => {
    return apiCall(`/itinerary/trip/${tripId}/costs`);
  },
};

// ==================== DESTINATION STOPS API ====================

export interface DestinationStop {
  id_loca: string;
  id_trip?: string;
  name_loca: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  createdat_loca?: string;
  position_loca?: number;
}

export const stopsApi = {
  // Get all stops for a trip
  getByTrip: async (tripId: string): Promise<DestinationStop[]> => {
    return apiCall(`/stops/trip/${tripId}`);
  },

  create: async (stop: {
    id_trip: string;
    name_loca: string;
    coordinates?: { lat: number; lng: number };
  }): Promise<DestinationStop> => {
    return apiCall('/stops', {
      method: 'POST',
      body: stop,
    });
  },

  reorder: async (updates: { id_loca: string; position_loca: number }[]): Promise<void> => {
    return apiCall('/stops/reorder', {
      method: 'PATCH',
      body: { updates },
    });
  },

  // Delete a stop
  delete: async (stopId: string): Promise<void> => {
    return apiCall(`/stops/${stopId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== LODGING API ====================

export interface Lodging {
  id_lodg: string;
  id_itit: string;
  name_lodg: string;
  address_lodg?: string | null;
  checkin_lodg?: string | null;
  checkout_lodg?: string | null;
  confirmation_lodg?: string | null;
  link_lodg?: string | null;
  createdat_lodg?: string;
}

export const lodgingApi = {
  getByItinerary: async (itineraryId: string): Promise<Lodging[]> => {
    return apiCall(`/lodging/itinerary/${itineraryId}`);
  },

  getById: async (id: string): Promise<Lodging> => {
    return apiCall(`/lodging/${id}`);
  },

  create: async (lodging: Omit<Lodging, 'id_lodg' | 'createdat_lodg'>): Promise<Lodging> => {
    return apiCall('/lodging', {
      method: 'POST',
      body: lodging,
    });
  },

  update: async (id: string, lodging: Partial<Omit<Lodging, 'id_lodg' | 'createdat_lodg'>>): Promise<Lodging> => {
    return apiCall(`/lodging/${id}`, {
      method: 'PATCH',
      body: lodging,
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiCall(`/lodging/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== TRANSPORT API ====================

export interface Transport {
  id_tran: string;
  id_itit: string;
  type_tran: string;
  provider_tran?: string | null;
  deploc_tran?: string | null;
  arrloc_tran?: string | null;
  deptime_tran?: string | null;
  arrtime_tran?: string | null;
  link_tran?: string | null;
  createdat_tran?: string;
}

export const transportApi = {
  getByItinerary: async (itineraryId: string): Promise<Transport[]> => {
    return apiCall(`/transport/itinerary/${itineraryId}`);
  },

  getById: async (id: string): Promise<Transport> => {
    return apiCall(`/transport/${id}`);
  },

  create: async (transport: Omit<Transport, 'id_tran' | 'createdat_tran'>): Promise<Transport> => {
    return apiCall('/transport', {
      method: 'POST',
      body: transport,
    });
  },

  update: async (id: string, transport: Partial<Omit<Transport, 'id_tran' | 'createdat_tran'>>): Promise<Transport> => {
    return apiCall(`/transport/${id}`, {
      method: 'PATCH',
      body: transport,
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiCall(`/transport/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== HEALTH CHECK ====================

export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    return apiCall('/health');
  },
};

// Export the API client as both named and default
export const apiClient = {
  auth: authApi,
  trips: tripsApi,
  expenses: expensesApi,
  settlements: settlementsApi,
  itinerary: itineraryApi,
  stops: stopsApi,
  lodging: lodgingApi,
  transport: transportApi,
  health: healthApi,
};

export default apiClient;
