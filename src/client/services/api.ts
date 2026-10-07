import type {
  ApiResponse,
  SafeUser,
  Service,
  ServiceCenter,
  Appointment,
  Queue,
  QueueToken,
  Notification,
  AIGuideResponse,
  AnalyticsSummary,
  AuditLog,
  OperatingHour,
  Counter,
  StaffProfile,
} from '../../shared/types.js';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    // Also send authorization header if token is stored in localStorage as fallback
    const savedToken = localStorage.getItem('govqueue_token');
    if (savedToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${savedToken}`);
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
      credentials: 'include', // for HTTP-only cookies
    });

    const json = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !json.success) {
      const msg = json.error?.message || `Request failed with status ${response.status}`;
      const err = new Error(msg);
      (err as any).code = json.error?.code || 'API_ERROR';
      (err as any).status = response.status;
      throw err;
    }

    return json.data as T;
  }

  // --- Auth ---
  public async getMe(): Promise<{ user: SafeUser | null }> {
    return this.request<{ user: SafeUser | null }>('/api/auth/me');
  }

  public async login(body: { email: string; password: string }): Promise<{ user: SafeUser; token: string }> {
    const data = await this.request<{ user: SafeUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (data.token) {
      localStorage.setItem('govqueue_token', data.token);
    }
    return data;
  }

  public async internalLogin(body: { email: string; password: string }): Promise<{ user: SafeUser; token: string }> {
    const data = await this.request<{ user: SafeUser; token: string }>('/api/auth/internal-login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (data.token) {
      localStorage.setItem('govqueue_token', data.token);
    }
    return data;
  }

  public async register(body: { fullName: string; email: string; phone: string; password: string }): Promise<{ user: SafeUser; token: string }> {
    const data = await this.request<{ user: SafeUser; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (data.token) {
      localStorage.setItem('govqueue_token', data.token);
    }
    return data;
  }

  public async logout(): Promise<void> {
    await this.request<{ message: string }>('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('govqueue_token');
  }

  public async updateProfile(body: { fullName?: string; phone?: string }): Promise<{ user: SafeUser }> {
    return this.request<{ user: SafeUser }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  // --- Services ---
  public async getServices(params?: { search?: string; category?: string; department?: string; sort?: string }): Promise<Service[]> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.category) q.set('category', params.category);
    if (params?.department) q.set('department', params.department);
    if (params?.sort) q.set('sort', params.sort);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.request<Service[]>(`/api/services${qs}`);
  }

  public async getServiceById(id: string): Promise<Service & { availableCenters: ServiceCenter[] }> {
    return this.request<Service & { availableCenters: ServiceCenter[] }>(`/api/services/${id}`);
  }

  public async createService(body: Partial<Service>): Promise<Service> {
    return this.request<Service>('/api/services', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async updateService(id: string, body: Partial<Service>): Promise<Service> {
    return this.request<Service>(`/api/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  public async deleteService(id: string): Promise<void> {
    return this.request<void>(`/api/services/${id}`, { method: 'DELETE' });
  }

  // --- Centers ---
  public async getCenters(params?: { district?: string; state?: string }): Promise<(ServiceCenter & { operatingHours: OperatingHour[]; countersCount: number })[]> {
    const q = new URLSearchParams();
    if (params?.district) q.set('district', params.district);
    if (params?.state) q.set('state', params.state);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.request<any>(`/api/centers${qs}`);
  }

  public async getCenterById(id: string): Promise<ServiceCenter & { operatingHours: OperatingHour[]; counters: Counter[]; availableServices: Service[] }> {
    return this.request<any>(`/api/centers/${id}`);
  }

  public async createCenter(body: Partial<ServiceCenter>): Promise<ServiceCenter> {
    return this.request<ServiceCenter>('/api/centers', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async updateCenter(id: string, body: Partial<ServiceCenter>): Promise<ServiceCenter> {
    return this.request<ServiceCenter>(`/api/centers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  public async deleteCenter(id: string): Promise<void> {
    return this.request<void>(`/api/centers/${id}`, { method: 'DELETE' });
  }

  // --- Availability ---
  public async getAvailability(centerId: string, serviceId: string, date: string): Promise<{
    date: string;
    dayOfWeek: number;
    isClosed: boolean;
    reason?: string;
    openTime?: string;
    closeTime?: string;
    slots: { time: string; available: boolean; reason?: string }[];
  }> {
    return this.request<any>(`/api/availability?centerId=${centerId}&serviceId=${serviceId}&date=${date}`);
  }

  // --- Appointments ---
  public async getAppointments(params?: { centerId?: string; date?: string; status?: string }): Promise<Appointment[]> {
    const q = new URLSearchParams();
    if (params?.centerId) q.set('centerId', params.centerId);
    if (params?.date) q.set('date', params.date);
    if (params?.status) q.set('status', params.status);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.request<Appointment[]>(`/api/appointments${qs}`);
  }

  public async getAppointmentById(id: string): Promise<Appointment> {
    return this.request<Appointment>(`/api/appointments/${id}`);
  }

  public async createAppointment(body: { serviceId: string; centerId: string; appointmentDate: string; startTime: string }): Promise<Appointment> {
    return this.request<Appointment>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async checkInAppointment(id: string): Promise<Appointment> {
    return this.request<Appointment>(`/api/appointments/${id}/check-in`, {
      method: 'POST',
    });
  }

  public async cancelAppointment(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Queues ---
  public async getQueues(params?: { centerId?: string; serviceId?: string; date?: string }): Promise<Queue[]> {
    const q = new URLSearchParams();
    if (params?.centerId) q.set('centerId', params.centerId);
    if (params?.serviceId) q.set('serviceId', params.serviceId);
    if (params?.date) q.set('date', params.date);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return this.request<Queue[]>(`/api/queues${qs}`);
  }

  public async getQueueById(id: string): Promise<Queue & { waitingCount: number; servingCount: number; tokens: QueueToken[] }> {
    return this.request<any>(`/api/queues/${id}`);
  }

  public async callNextQueueToken(queueId: string): Promise<{ queue: Queue; calledToken: QueueToken }> {
    return this.request<any>(`/api/queues/${queueId}/call-next`, {
      method: 'POST',
    });
  }

  public async recallQueueToken(queueId: string): Promise<{ recalledToken: QueueToken }> {
    return this.request<any>(`/api/queues/${queueId}/recall`, {
      method: 'POST',
    });
  }

  // --- Queue Tokens ---
  public async getQueueTokenById(id: string): Promise<QueueToken> {
    return this.request<QueueToken>(`/api/queue-tokens/${id}`);
  }

  public async completeQueueToken(tokenId: string): Promise<QueueToken> {
    return this.request<QueueToken>(`/api/queue-tokens/${tokenId}/complete`, {
      method: 'POST',
    });
  }

  public async noShowQueueToken(tokenId: string): Promise<QueueToken> {
    return this.request<QueueToken>(`/api/queue-tokens/${tokenId}/no-show`, {
      method: 'POST',
    });
  }

  // --- Notifications ---
  public async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    return this.request<{ notifications: Notification[]; unreadCount: number }>('/api/notifications');
  }

  public async markNotificationRead(id: string): Promise<void> {
    return this.request<void>(`/api/notifications/${id}/read`, { method: 'PATCH' });
  }

  public async markAllNotificationsRead(): Promise<{ updatedCount: number }> {
    return this.request<{ updatedCount: number }>('/api/notifications/read-all', { method: 'PATCH' });
  }

  // --- AI Guidance ---
  public async askGovGuide(query: string, conversationId?: string): Promise<AIGuideResponse> {
    return this.request<AIGuideResponse>('/api/ai/guide', {
      method: 'POST',
      body: JSON.stringify({ query, conversationId }),
    });
  }

  // --- Admin ---
  public async getAdminAnalytics(): Promise<AnalyticsSummary> {
    return this.request<AnalyticsSummary>('/api/admin/analytics');
  }

  public async getAdminAuditLogs(): Promise<AuditLog[]> {
    return this.request<AuditLog[]>('/api/admin/audit-logs');
  }

  public async getAdminStaff(): Promise<StaffProfile[]> {
    return this.request<StaffProfile[]>('/api/admin/staff');
  }

  public async assignStaff(body: { userId: string; centerId: string; employeeId: string; designation: string }): Promise<StaffProfile> {
    return this.request<StaffProfile>('/api/admin/staff', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async getAdminUsers(): Promise<SafeUser[]> {
    return this.request<SafeUser[]>('/api/admin/users');
  }

  public async updateUserRole(userId: string, role: 'CITIZEN' | 'STAFF' | 'ADMIN'): Promise<SafeUser> {
    return this.request<SafeUser>(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }
}

export const api = new ApiClient();
