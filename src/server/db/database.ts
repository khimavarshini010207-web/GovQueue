import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import type {
  User,
  Service,
  ServiceCenter,
  OperatingHour,
  Counter,
  StaffProfile,
  Appointment,
  Queue,
  QueueToken,
  Notification,
  AIConversation,
  AIMessage,
  AuditLog,
} from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage path for persistent file storage when DATABASE_URL is not set
const DATA_DIR = path.resolve(__dirname, '../../../data');
const DATA_FILE = path.join(DATA_DIR, 'govqueue_database.json');

export interface DatabaseState {
  users: User[];
  services: Service[];
  serviceCenters: ServiceCenter[];
  operatingHours: OperatingHour[];
  counters: Counter[];
  staffProfiles: StaffProfile[];
  appointments: Appointment[];
  queues: Queue[];
  queueTokens: QueueToken[];
  notifications: Notification[];
  aiConversations: AIConversation[];
  aiMessages: AIMessage[];
  auditLogs: AuditLog[];
}

const emptyState: DatabaseState = {
  users: [],
  services: [],
  serviceCenters: [],
  operatingHours: [],
  counters: [],
  staffProfiles: [],
  appointments: [],
  queues: [],
  queueTokens: [],
  notifications: [],
  aiConversations: [],
  aiMessages: [],
  auditLogs: [],
};

class RelationalDatabase {
  private pgPool: pg.Pool | null = null;
  private state: DatabaseState = { ...emptyState };
  private isUsingPg: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_URL;
    if (dbUrl && dbUrl.startsWith('postgres')) {
      try {
        this.pgPool = new pg.Pool({
          connectionString: dbUrl,
          ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
        });
        this.isUsingPg = true;
      } catch (err) {
        console.warn('PostgreSQL connection setup failed, falling back to persistent file store:', err);
        this.isUsingPg = false;
      }
    }
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (this.isUsingPg && this.pgPool) {
      try {
        await this.initPostgresSchema();
        this.isInitialized = true;
        console.log('Successfully connected and initialized PostgreSQL relational schema.');
        return;
      } catch (err) {
        console.warn('Failed to initialize PostgreSQL tables, falling back to persistent disk store:', err);
        this.isUsingPg = false;
      }
    }

    // Persistent JSON disk store fallback
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.state = {
          ...emptyState,
          ...parsed,
        };
      } catch (err) {
        console.error('Error reading persistent database file, initializing fresh:', err);
        this.state = { ...emptyState };
        this.persist();
      }
    } else {
      this.state = { ...emptyState };
      this.persist();
    }

    this.isInitialized = true;
    console.log('Persistent relational database store initialized at:', DATA_FILE);
  }

  private persist(): void {
    if (this.isUsingPg) return;
    try {
      const tempPath = `${DATA_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.state, null, 2), 'utf-8');
      fs.renameSync(tempPath, DATA_FILE);
    } catch (err) {
      console.error('Failed to persist database state to disk:', err);
    }
  }

  private async initPostgresSchema(): Promise<void> {
    if (!this.pgPool) return;
    const client = await this.pgPool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          full_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS services (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          department TEXT NOT NULL,
          estimated_minutes INT NOT NULL,
          required_documents JSONB NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS service_centers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT UNIQUE NOT NULL,
          address TEXT NOT NULL,
          district TEXT NOT NULL,
          state TEXT NOT NULL,
          pincode TEXT NOT NULL,
          phone TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS operating_hours (
          id TEXT PRIMARY KEY,
          center_id TEXT NOT NULL REFERENCES service_centers(id) ON DELETE CASCADE,
          day_of_week INT NOT NULL,
          open_time TEXT NOT NULL,
          close_time TEXT NOT NULL,
          is_closed BOOLEAN NOT NULL DEFAULT false
        );

        CREATE TABLE IF NOT EXISTS counters (
          id TEXT PRIMARY KEY,
          center_id TEXT NOT NULL REFERENCES service_centers(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          counter_number INT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true
        );

        CREATE TABLE IF NOT EXISTS staff_profiles (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          center_id TEXT NOT NULL REFERENCES service_centers(id) ON DELETE CASCADE,
          employee_id TEXT NOT NULL,
          designation TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS appointments (
          id TEXT PRIMARY KEY,
          citizen_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
          center_id TEXT NOT NULL REFERENCES service_centers(id) ON DELETE CASCADE,
          appointment_date TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          status TEXT NOT NULL,
          booking_reference TEXT UNIQUE NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS queues (
          id TEXT PRIMARY KEY,
          center_id TEXT NOT NULL REFERENCES service_centers(id) ON DELETE CASCADE,
          service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
          queue_date TEXT NOT NULL,
          current_number INT NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS queue_tokens (
          id TEXT PRIMARY KEY,
          queue_id TEXT NOT NULL REFERENCES queues(id) ON DELETE CASCADE,
          appointment_id TEXT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
          token_number INT NOT NULL,
          token_code TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'WAITING',
          checked_in_at TIMESTAMPTZ,
          called_at TIMESTAMPTZ,
          completed_at TIMESTAMPTZ,
          estimated_wait_minutes INT NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          appointment_id TEXT REFERENCES appointments(id) ON DELETE SET NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_conversations (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT,
          metadata JSONB,
          created_at TIMESTAMPTZ NOT NULL
        );
      `);
    } finally {
      client.release();
    }
  }

  // --- CRUD Operations for persistent store ---

  // Users
  public async getUsers(): Promise<User[]> {
    return [...this.state.users];
  }

  public async getUserById(id: string): Promise<User | null> {
    return this.state.users.find(u => u.id === id) || null;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    return this.state.users.find(u => u.email.toLowerCase() === normalized) || null;
  }

  public async createUser(user: User): Promise<User> {
    this.state.users.push(user);
    this.persist();
    return user;
  }

  public async updateUser(id: string, patch: Partial<User>): Promise<User | null> {
    const idx = this.state.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.state.users[idx] = {
      ...this.state.users[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.state.users[idx];
  }

  // Services
  public async getServices(): Promise<Service[]> {
    return [...this.state.services];
  }

  public async getServiceById(id: string): Promise<Service | null> {
    return this.state.services.find(s => s.id === id || s.slug === id) || null;
  }

  public async createService(service: Service): Promise<Service> {
    this.state.services.push(service);
    this.persist();
    return service;
  }

  public async updateService(id: string, patch: Partial<Service>): Promise<Service | null> {
    const idx = this.state.services.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.state.services[idx] = {
      ...this.state.services[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.state.services[idx];
  }

  public async deleteService(id: string): Promise<boolean> {
    const idx = this.state.services.findIndex(s => s.id === id);
    if (idx === -1) return false;
    // Prefer soft-delete / deactivation
    this.state.services[idx].isActive = false;
    this.state.services[idx].updatedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  // Service Centers
  public async getCenters(): Promise<ServiceCenter[]> {
    return [...this.state.serviceCenters];
  }

  public async getCenterById(id: string): Promise<ServiceCenter | null> {
    return this.state.serviceCenters.find(c => c.id === id || c.code === id) || null;
  }

  public async createCenter(center: ServiceCenter): Promise<ServiceCenter> {
    this.state.serviceCenters.push(center);
    this.persist();
    return center;
  }

  public async updateCenter(id: string, patch: Partial<ServiceCenter>): Promise<ServiceCenter | null> {
    const idx = this.state.serviceCenters.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.state.serviceCenters[idx] = {
      ...this.state.serviceCenters[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.state.serviceCenters[idx];
  }

  public async deleteCenter(id: string): Promise<boolean> {
    const idx = this.state.serviceCenters.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.state.serviceCenters[idx].isActive = false;
    this.state.serviceCenters[idx].updatedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  // Operating Hours
  public async getOperatingHours(centerId?: string): Promise<OperatingHour[]> {
    if (!centerId) return [...this.state.operatingHours];
    return this.state.operatingHours.filter(o => o.centerId === centerId);
  }

  public async createOperatingHour(op: OperatingHour): Promise<OperatingHour> {
    this.state.operatingHours.push(op);
    this.persist();
    return op;
  }

  public async updateOperatingHour(id: string, patch: Partial<OperatingHour>): Promise<OperatingHour | null> {
    const idx = this.state.operatingHours.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.state.operatingHours[idx] = { ...this.state.operatingHours[idx], ...patch };
    this.persist();
    return this.state.operatingHours[idx];
  }

  // Counters
  public async getCounters(centerId?: string): Promise<Counter[]> {
    if (!centerId) return [...this.state.counters];
    return this.state.counters.filter(c => c.centerId === centerId);
  }

  public async createCounter(counter: Counter): Promise<Counter> {
    this.state.counters.push(counter);
    this.persist();
    return counter;
  }

  public async updateCounter(id: string, patch: Partial<Counter>): Promise<Counter | null> {
    const idx = this.state.counters.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.state.counters[idx] = { ...this.state.counters[idx], ...patch };
    this.persist();
    return this.state.counters[idx];
  }

  // Staff Profiles
  public async getStaffProfiles(centerId?: string): Promise<StaffProfile[]> {
    const profiles = centerId
      ? this.state.staffProfiles.filter(p => p.centerId === centerId)
      : [...this.state.staffProfiles];

    return profiles.map(p => {
      const u = this.state.users.find(u => u.id === p.userId);
      const c = this.state.serviceCenters.find(c => c.id === p.centerId);
      return {
        ...p,
        user: u ? { id: u.id, fullName: u.fullName, email: u.email, phone: u.phone, role: u.role, createdAt: u.createdAt, updatedAt: u.updatedAt } : undefined,
        center: c,
      };
    });
  }

  public async createStaffProfile(staff: StaffProfile): Promise<StaffProfile> {
    this.state.staffProfiles.push(staff);
    this.persist();
    return staff;
  }

  // Appointments
  public async getAppointments(filter?: {
    citizenId?: string;
    centerId?: string;
    serviceId?: string;
    date?: string;
    status?: string;
  }): Promise<Appointment[]> {
    let list = [...this.state.appointments];
    if (filter) {
      if (filter.citizenId) list = list.filter(a => a.citizenId === filter.citizenId);
      if (filter.centerId) list = list.filter(a => a.centerId === filter.centerId);
      if (filter.serviceId) list = list.filter(a => a.serviceId === filter.serviceId);
      if (filter.date) list = list.filter(a => a.appointmentDate === filter.date);
      if (filter.status) list = list.filter(a => a.status === filter.status);
    }

    return list.map(a => this.hydrateAppointment(a));
  }

  public async getAppointmentById(id: string): Promise<Appointment | null> {
    const apt = this.state.appointments.find(a => a.id === id || a.bookingReference === id);
    if (!apt) return null;
    return this.hydrateAppointment(apt);
  }

  private hydrateAppointment(apt: Appointment): Appointment {
    const service = this.state.services.find(s => s.id === apt.serviceId);
    const center = this.state.serviceCenters.find(c => c.id === apt.centerId);
    const citizen = this.state.users.find(u => u.id === apt.citizenId);
    const token = this.state.queueTokens.find(t => t.appointmentId === apt.id);
    return {
      ...apt,
      service,
      center,
      citizen: citizen ? { id: citizen.id, fullName: citizen.fullName, email: citizen.email, phone: citizen.phone, role: citizen.role, createdAt: citizen.createdAt, updatedAt: citizen.updatedAt } : undefined,
      token,
    };
  }

  public async createAppointment(appointment: Appointment): Promise<Appointment> {
    this.state.appointments.push(appointment);
    this.persist();
    return this.hydrateAppointment(appointment);
  }

  public async updateAppointment(id: string, patch: Partial<Appointment>): Promise<Appointment | null> {
    const idx = this.state.appointments.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.state.appointments[idx] = {
      ...this.state.appointments[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.hydrateAppointment(this.state.appointments[idx]);
  }

  // Queues
  public async getQueues(filter?: { centerId?: string; serviceId?: string; date?: string }): Promise<Queue[]> {
    let list = [...this.state.queues];
    if (filter) {
      if (filter.centerId) list = list.filter(q => q.centerId === filter.centerId);
      if (filter.serviceId) list = list.filter(q => q.serviceId === filter.serviceId);
      if (filter.date) list = list.filter(q => q.queueDate === filter.date);
    }
    return list.map(q => this.hydrateQueue(q));
  }

  public async getQueueById(id: string): Promise<Queue | null> {
    const q = this.state.queues.find(queue => queue.id === id);
    if (!q) return null;
    return this.hydrateQueue(q);
  }

  public async findOrCreateQueue(centerId: string, serviceId: string, date: string): Promise<Queue> {
    let queue = this.state.queues.find(
      q => q.centerId === centerId && q.serviceId === serviceId && q.queueDate === date
    );
    if (!queue) {
      const now = new Date().toISOString();
      queue = {
        id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        centerId,
        serviceId,
        queueDate: date,
        currentNumber: 0,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      };
      this.state.queues.push(queue);
      this.persist();
    }
    return this.hydrateQueue(queue);
  }

  public async updateQueue(id: string, patch: Partial<Queue>): Promise<Queue | null> {
    const idx = this.state.queues.findIndex(q => q.id === id);
    if (idx === -1) return null;
    this.state.queues[idx] = {
      ...this.state.queues[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.hydrateQueue(this.state.queues[idx]);
  }

  private hydrateQueue(q: Queue): Queue {
    const service = this.state.services.find(s => s.id === q.serviceId);
    const center = this.state.serviceCenters.find(c => c.id === q.centerId);
    const activeServingToken = this.state.queueTokens.find(
      t => t.queueId === q.id && (t.status === 'SERVING' || t.status === 'CALLED')
    );
    const waitingCount = this.state.queueTokens.filter(
      t => t.queueId === q.id && t.status === 'WAITING'
    ).length;

    return {
      ...q,
      service,
      center,
      activeServingToken,
      waitingCount,
    };
  }

  // Queue Tokens
  public async getQueueTokens(queueId?: string): Promise<QueueToken[]> {
    const list = queueId ? this.state.queueTokens.filter(t => t.queueId === queueId) : [...this.state.queueTokens];
    return list.map(t => this.hydrateToken(t));
  }

  public async getQueueTokenById(id: string): Promise<QueueToken | null> {
    const token = this.state.queueTokens.find(t => t.id === id || t.appointmentId === id || t.tokenCode === id);
    if (!token) return null;
    return this.hydrateToken(token);
  }

  public async createQueueToken(token: QueueToken): Promise<QueueToken> {
    this.state.queueTokens.push(token);
    this.persist();
    return this.hydrateToken(token);
  }

  public async updateQueueToken(id: string, patch: Partial<QueueToken>): Promise<QueueToken | null> {
    const idx = this.state.queueTokens.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.state.queueTokens[idx] = {
      ...this.state.queueTokens[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.hydrateToken(this.state.queueTokens[idx]);
  }

  public hydrateToken(t: QueueToken): QueueToken {
    const queue = this.state.queues.find(q => q.id === t.queueId);
    const appointment = this.state.appointments.find(a => a.id === t.appointmentId);
    const service = appointment ? this.state.services.find(s => s.id === appointment.serviceId) : undefined;
    const center = appointment ? this.state.serviceCenters.find(c => c.id === appointment.centerId) : undefined;
    const citizen = appointment ? this.state.users.find(u => u.id === appointment.citizenId) : undefined;

    // Queue algorithm calculations (Deterministic server-side!)
    // Find currently serving token in this queue
    const servingToken = this.state.queueTokens.find(
      tok => tok.queueId === t.queueId && (tok.status === 'SERVING' || tok.status === 'CALLED')
    );

    // People ahead: number of WAITING tokens in the same queue created before this token or with a lower token number
    let peopleAhead = 0;
    if (t.status === 'WAITING') {
      const waitingTokens = this.state.queueTokens.filter(
        tok => tok.queueId === t.queueId && tok.status === 'WAITING' && tok.tokenNumber < t.tokenNumber
      );
      peopleAhead = waitingTokens.length;
    } else if (t.status === 'SERVING' || t.status === 'CALLED') {
      peopleAhead = 0;
    }

    const estimatedDuration = service?.estimatedMinutes || 6;
    const estimatedWait = peopleAhead * estimatedDuration;

    return {
      ...t,
      peopleAhead,
      currentlyServing: servingToken ? servingToken.tokenCode : (queue && queue.currentNumber > 0 ? `A${queue.currentNumber}` : 'None'),
      appointment,
      service,
      center,
      citizen: citizen ? { id: citizen.id, fullName: citizen.fullName, email: citizen.email, phone: citizen.phone, role: citizen.role, createdAt: citizen.createdAt, updatedAt: citizen.updatedAt } : undefined,
    };
  }

  // Notifications
  public async getNotifications(userId: string): Promise<Notification[]> {
    return this.state.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async createNotification(notification: Notification): Promise<Notification> {
    this.state.notifications.unshift(notification);
    this.persist();
    return notification;
  }

  public async markNotificationRead(id: string, userId: string): Promise<boolean> {
    const n = this.state.notifications.find(item => item.id === id && item.userId === userId);
    if (!n) return false;
    n.isRead = true;
    this.persist();
    return true;
  }

  public async markAllNotificationsRead(userId: string): Promise<number> {
    let count = 0;
    this.state.notifications.forEach(item => {
      if (item.userId === userId && !item.isRead) {
        item.isRead = true;
        count++;
      }
    });
    if (count > 0) this.persist();
    return count;
  }

  // AI Conversations & Messages
  public async createAIConversation(convo: AIConversation): Promise<AIConversation> {
    this.state.aiConversations.push(convo);
    this.persist();
    return convo;
  }

  public async getAIConversationById(id: string): Promise<AIConversation | null> {
    return this.state.aiConversations.find(c => c.id === id) || null;
  }

  public async getAIMessages(conversationId: string): Promise<AIMessage[]> {
    return this.state.aiMessages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async createAIMessage(msg: AIMessage): Promise<AIMessage> {
    this.state.aiMessages.push(msg);
    this.persist();
    return msg;
  }

  // Audit Logs
  public async createAuditLog(log: AuditLog): Promise<AuditLog> {
    this.state.auditLogs.unshift(log);
    this.persist();
    return log;
  }

  public async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.state.auditLogs.slice(0, limit).map(log => {
      const u = log.userId ? this.state.users.find(user => user.id === log.userId) : null;
      return {
        ...log,
        userName: u ? u.fullName : 'System / Anonymous',
      };
    });
  }

  // Transaction helper (atomic snapshot / commit)
  public async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const backup = JSON.stringify(this.state);
    try {
      const result = await callback();
      this.persist();
      return result;
    } catch (err) {
      this.state = JSON.parse(backup);
      this.persist();
      throw err;
    }
  }
}

export const db = new RelationalDatabase();
