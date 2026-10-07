// Shared Types for GovQueue AI

export type UserRole = 'CITIZEN' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  department: string;
  estimatedMinutes: number;
  requiredDocuments: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OperatingHour {
  id: string;
  centerId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  openTime: string; // "09:00"
  closeTime: string; // "17:00"
  isClosed: boolean;
}

export interface ServiceCenter {
  id: string;
  name: string;
  code: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  phone: string;
  isActive: boolean;
  operatingHours?: OperatingHour[];
  createdAt: string;
  updatedAt: string;
}

export interface Counter {
  id: string;
  centerId: string;
  name: string;
  counterNumber: number;
  isActive: boolean;
}

export interface StaffProfile {
  id: string;
  userId: string;
  centerId: string;
  employeeId: string;
  designation: string;
  user?: SafeUser;
  center?: ServiceCenter;
}

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_QUEUE'
  | 'CALLED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Appointment {
  id: string;
  citizenId: string;
  serviceId: string;
  centerId: string;
  appointmentDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  status: AppointmentStatus;
  bookingReference: string;
  createdAt: string;
  updatedAt: string;
  // Hydrated references
  service?: Service;
  center?: ServiceCenter;
  citizen?: SafeUser;
  token?: QueueToken;
}

export type QueueStatus = 'ACTIVE' | 'CLOSED';

export interface Queue {
  id: string;
  centerId: string;
  serviceId: string;
  queueDate: string; // "YYYY-MM-DD"
  currentNumber: number;
  status: QueueStatus;
  createdAt: string;
  updatedAt: string;
  service?: Service;
  center?: ServiceCenter;
  activeServingToken?: QueueToken;
  waitingCount?: number;
}

export type TokenStatus =
  | 'WAITING'
  | 'CALLED'
  | 'SERVING'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED';

export interface QueueToken {
  id: string;
  queueId: string;
  appointmentId: string;
  tokenNumber: number;
  tokenCode: string; // e.g. "A27"
  status: TokenStatus;
  checkedInAt: string | null;
  calledAt: string | null;
  completedAt: string | null;
  estimatedWaitMinutes: number;
  createdAt: string;
  updatedAt: string;
  // Computed / hydrated fields
  peopleAhead?: number;
  currentlyServing?: string | null;
  appointment?: Appointment;
  service?: Service;
  center?: ServiceCenter;
  citizen?: SafeUser;
}

export type NotificationType =
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'CHECK_IN'
  | 'QUEUE_APPROACHING'
  | 'TOKEN_CALLED'
  | 'APPOINTMENT_COMPLETED';

export interface Notification {
  id: string;
  userId: string;
  appointmentId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  userName?: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AIGuideResponse {
  intent: string;
  recommendedServiceId: string | null;
  recommendedServiceName: string;
  reason: string;
  requiredDocuments: string[];
  nextAction: 'VIEW_SERVICE' | 'BOOK_APPOINTMENT' | 'ASK_CLARIFICATION';
  confidence: number;
  conversationId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface AvailabilitySlot {
  time: string; // "10:30"
  available: boolean;
  reason?: string;
}

export interface AnalyticsSummary {
  appointmentsToday: number;
  completedToday: number;
  waitingToday: number;
  cancelledToday: number;
  noShowToday: number;
  activeCenters: number;
  activeServices: number;
  averageWaitMinutes: number;
  completionRatePercentage: number;
  appointmentsByDay: { date: string; count: number; completed: number }[];
  appointmentsByService: { name: string; count: number }[];
  appointmentsByCenter: { name: string; count: number }[];
  queueLengthTrend: { time: string; waiting: number }[];
}
