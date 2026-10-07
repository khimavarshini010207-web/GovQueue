import bcrypt from 'bcryptjs';
import { db } from './database.js';
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
} from '../../shared/types.js';

export async function seedDatabase(): Promise<void> {
  const users = await db.getUsers();
  if (users.length > 0) {
    // Already seeded, skip
    return;
  }

  console.log('Seeding initial demo data for GovQueue AI...');

  const passwordHash = await bcrypt.hash('Demo@123', 10);
  const now = new Date('2026-10-07T09:00:00.000Z').toISOString();

  // 1. Create Demo Users
  const citizenUser: User = {
    id: 'user-citizen-rahul',
    fullName: 'Rahul Sharma',
    email: 'citizen@govqueue.demo',
    phone: '+91 98765 43210',
    passwordHash,
    role: 'CITIZEN',
    createdAt: now,
    updatedAt: now,
  };

  const staffUser: User = {
    id: 'user-staff-priya',
    fullName: 'Priya Verma',
    email: 'staff@govqueue.demo',
    phone: '+91 98765 43211',
    passwordHash,
    role: 'STAFF',
    createdAt: now,
    updatedAt: now,
  };

  const adminUser: User = {
    id: 'user-admin-rajesh',
    fullName: 'Rajesh Kumar',
    email: 'admin@govqueue.demo',
    phone: '+91 98765 43212',
    passwordHash,
    role: 'ADMIN',
    createdAt: now,
    updatedAt: now,
  };

  // Additional mock citizens for queue demonstration
  const mockCitizens: User[] = [
    {
      id: 'user-mock-23',
      fullName: 'Ananya Deshmukh',
      email: 'ananya.d@example.com',
      phone: '+91 98765 11123',
      passwordHash,
      role: 'CITIZEN',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'user-mock-24',
      fullName: 'Vikram Patel',
      email: 'vikram.p@example.com',
      phone: '+91 98765 11124',
      passwordHash,
      role: 'CITIZEN',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'user-mock-25',
      fullName: 'Meera Iyer',
      email: 'meera.i@example.com',
      phone: '+91 98765 11125',
      passwordHash,
      role: 'CITIZEN',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'user-mock-26',
      fullName: 'Arjun Reddy',
      email: 'arjun.r@example.com',
      phone: '+91 98765 11126',
      passwordHash,
      role: 'CITIZEN',
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.createUser(citizenUser);
  await db.createUser(staffUser);
  await db.createUser(adminUser);
  for (const m of mockCitizens) {
    await db.createUser(m);
  }

  // 2. Create Service Centers
  const centers: ServiceCenter[] = [
    {
      id: 'center-district',
      name: 'District Citizen Service Center',
      code: 'DCSC',
      address: 'Administrative Complex, Collectorate Road, Sector 4',
      district: 'Central District',
      state: 'National Capital Region',
      pincode: '110001',
      phone: '+91 11 2345 6789',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'center-mandal',
      name: 'Mandal Citizen Service Center',
      code: 'MCSC',
      address: 'Tehsil Civic Office, Old Bazaar Circle',
      district: 'South District',
      state: 'National Capital Region',
      pincode: '110019',
      phone: '+91 11 2345 6790',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'center-regional',
      name: 'Regional Citizen Service Center',
      code: 'RCSC',
      address: 'Sub-Divisional Revenue Complex, Ring Road Phase 2',
      district: 'North District',
      state: 'National Capital Region',
      pincode: '110054',
      phone: '+91 11 2345 6791',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const c of centers) {
    await db.createCenter(c);
  }

  // 3. Operating Hours (Mon-Sat, 09:00 - 17:00)
  for (const c of centers) {
    for (let day = 0; day <= 6; day++) {
      const isSunday = day === 0;
      await db.createOperatingHour({
        id: `op-${c.id}-${day}`,
        centerId: c.id,
        dayOfWeek: day,
        openTime: '09:00',
        closeTime: '17:00',
        isClosed: isSunday,
      });
    }

    // Counters 1 to 4
    for (let counterNum = 1; counterNum <= 4; counterNum++) {
      await db.createCounter({
        id: `counter-${c.id}-${counterNum}`,
        centerId: c.id,
        name: `Counter ${counterNum}`,
        counterNumber: counterNum,
        isActive: true,
      });
    }
  }

  // Staff Profile
  await db.createStaffProfile({
    id: 'staff-profile-1',
    userId: staffUser.id,
    centerId: centers[0].id,
    employeeId: 'EMP-9021',
    designation: 'Senior Public Services Officer',
  });

  // 4. Seed 10 Realistic Government Services
  const services: Service[] = [
    {
      id: 'service-aadhaar-address',
      name: 'Aadhaar Address Update',
      slug: 'aadhaar-address-update',
      description: 'Official update of residential address in the Aadhaar card database with biometric / OTP verification.',
      category: 'Identity & Civil Records',
      department: 'Unique Identification Authority',
      estimatedMinutes: 6, // 6 min duration per citizen = 18 min for 3 people ahead
      requiredDocuments: [
        'Proof of Address (Utility bill, Registered Rent Agreement, or Bank Statement within 3 months)',
        'Original Aadhaar Card',
        'Registered Mobile Number for OTP authentication',
        'Recent passport-size photograph (optional, captured digitally on-site)',
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'service-pan-services',
      name: 'PAN Services',
      slug: 'pan-services',
      description: 'Issuance of new Permanent Account Number (PAN), corrections, updates, and linking with Aadhaar.',
      category: 'Taxation & Finance',
      department: 'Income Tax Department',
      estimatedMinutes: 10,
      requiredDocuments: [
        'Proof of Identity (Aadhaar Card, Voter ID, or Passport)',
        'Proof of Date of Birth (Birth Certificate or Matriculation Marksheet)',
        'Proof of Address',
        'Two recent color passport photographs',
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'service-birth-certificate',
      name: 'Birth Certificate',
      slug: 'birth-certificate',
      description: 'Application, verification, and issuance of official digital birth certificate.',
      category: 'Identity & Civil Records',
      department: 'Municipal Corporation & Registrar of Births',
      estimatedMinutes: 12,
      requiredDocuments: [
        'Hospital Discharge Summary / Birth Intimation Slip',
        "Parents' Identity Proof (Aadhaar or Voter ID)",
        "Parents' Marriage Certificate",
        'Affidavit in case of delayed registration (> 21 days)',
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'service-income-certificate',
      name: 'Income Certificate',
      slug: 'income-certificate',
      description: 'Revenue department certification of annual family income for scholarship and welfare schemes.',
      category: 'Certificates & Revenue',
      department: 'Revenue & District Administration',
      estimatedMinutes: 10,
      requiredDocuments: [
        'Salary Slips / Form 16 or Self-declaration of Agriculture / Business Income',
        'Ration Card or Family Register entry',
        'Proof of Residence',
        'Affidavit sworn before Notary Public',
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'service-residence-certificate',
      name: 'Residence Certificate',
      slug: 'residence-certificate',
      description: 'Domicile / Permanent Residence Certificate establishing legal residence status.',
      category: 'Certificates & Revenue',
      department: 'Revenue Department',
      estimatedMinutes: 8,
      requiredDocuments: [
        'Continuous residence proof for specified years (School records, Electricity bills)',
        'Voter ID or Aadhaar Card',
        'Property tax receipt or Rent Agreement',
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'service-caste-certificate',
      name: 'Caste Certificate',
      slug: 'caste-certificate',
      description: 'Official community verification and certificate issuance under reserved category provisions.',
      category: 'Certificates & Revenue',
      department: 'Social Welfare & Revenue',
      estimatedMinutes: 15,
      requiredDocuments: [
        "Father's or Blood Relative's Caste Certificate",
        'School Leaving Certificate mentioning caste',
        'Family Tree / Pedigree declaration',
        'Proof of Residence',
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'service-driving-licence',
      name: 'Driving Licence Services',
      slug: 'driving-licence-services',
      description: "Learner's licence renewal, permanent driving licence renewal, international permit, and address change.",
      category: 'Transport & Vehicles',
      department: 'Regional Transport Office (RTO)',
      estimatedMinutes: 15,
      requiredDocuments: [
        'Existing Driving Licence or Learner Licence',
        'Medical Fitness Certificate (Form 1A)',
        'Proof of Age and Address',
        'Slot booking receipt for biometrics',
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'service-passport-assistance',
      name: 'Passport Assistance',
      slug: 'passport-assistance',
      description: 'Document verification and citizen facilitation counter for online Passport Seva Kendra filings.',
      category: 'Foreign Affairs & Travel',
      department: 'Consular & Passport Division',
      estimatedMinutes: 20,
      requiredDocuments: [
        'Proof of Date of Birth',
        'Proof of Identity with Present Address',
        'Educational Qualification Certificate',
        'Standard Annexures for minor/tatkaal where applicable',
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'service-property-registration',
      name: 'Property Registration',
      slug: 'property-registration',
      description: 'Sub-registrar appointment for deed verification, stamp duty check, and sale deed registration.',
      category: 'Land & Housing',
      department: 'Registration & Stamps Department',
      estimatedMinutes: 25,
      requiredDocuments: [
        'Draft Deed / Conveyance Document',
        'Title Search Report and Encumbrance Certificate',
        'E-Challan payment proof of Stamp Duty & Registration Fees',
        'ID and PAN cards of both buyer and seller with 2 witnesses',
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'service-senior-citizen',
      name: 'Senior Citizen Services',
      slug: 'senior-citizen-services',
      description: 'Senior Citizen Identity Card, state pension enrollment, and concession card issuance.',
      category: 'Welfare & Social Security',
      department: 'Social Justice & Empowerment',
      estimatedMinutes: 10,
      requiredDocuments: [
        'Proof of Age (showing 60+ years: Birth Certificate, PAN, or Voter ID)',
        'Proof of Residence',
        'Bank Account passbook details',
        'Blood Group report',
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const s of services) {
    await db.createService(s);
  }

  // 5. Build the Exact Citizen Demo Scenario (Section 37 & 51)
  // Date: 7 October 2026
  // Service: Aadhaar Address Update
  // Center: District Citizen Service Center
  // Current token: A23 (Serving)
  // Ahead tokens: A24, A25, A26 (3 people ahead!)
  // Citizen Rahul Sharma's Token: A27 (10:30 AM appointment)
  // Estimated wait: 18 minutes (3 ahead * 6 min = 18 min)

  const queueDate = '2026-10-07';
  const aadhaarService = services[0];
  const districtCenter = centers[0];

  const queue: Queue = {
    id: 'queue-aadhaar-dcsc-20261007',
    centerId: districtCenter.id,
    serviceId: aadhaarService.id,
    queueDate,
    currentNumber: 23, // Currently serving A23
    status: 'ACTIVE',
    createdAt: new Date('2026-10-07T08:30:00.000Z').toISOString(),
    updatedAt: new Date('2026-10-07T10:12:00.000Z').toISOString(),
  };
  await db.updateQueue(queue.id, queue) || await db.createAppointment({
    // dummy check
    id: 'init-queue-trigger',
    citizenId: citizenUser.id,
    serviceId: aadhaarService.id,
    centerId: districtCenter.id,
    appointmentDate: queueDate,
    startTime: '09:00',
    endTime: '09:15',
    status: 'COMPLETED',
    bookingReference: 'GQ-2026-INIT',
    createdAt: now,
    updatedAt: now,
  });

  // Setup the Queue directly in DB
  const queues = await db.getQueues();
  if (!queues.some(q => q.id === queue.id)) {
    // Save queue
    const createdQueue = await db.findOrCreateQueue(districtCenter.id, aadhaarService.id, queueDate);
    await db.updateQueue(createdQueue.id, {
      currentNumber: 23,
      status: 'ACTIVE',
    });
    queue.id = createdQueue.id;
  }

  // Setup Tokens A23 (Serving), A24, A25, A26 (Waiting ahead), A27 (Rahul Sharma - Waiting)
  const tokensToSeed = [
    {
      num: 23,
      code: 'A23',
      status: 'SERVING' as const,
      citizen: mockCitizens[0],
      time: '10:10',
      calledAt: new Date('2026-10-07T10:12:00.000Z').toISOString(),
      checkedInAt: new Date('2026-10-07T10:05:00.000Z').toISOString(),
    },
    {
      num: 24,
      code: 'A24',
      status: 'WAITING' as const,
      citizen: mockCitizens[1],
      time: '10:15',
      calledAt: null,
      checkedInAt: new Date('2026-10-07T10:10:00.000Z').toISOString(),
    },
    {
      num: 25,
      code: 'A25',
      status: 'WAITING' as const,
      citizen: mockCitizens[2],
      time: '10:20',
      calledAt: null,
      checkedInAt: new Date('2026-10-07T10:14:00.000Z').toISOString(),
    },
    {
      num: 26,
      code: 'A26',
      status: 'WAITING' as const,
      citizen: mockCitizens[3],
      time: '10:25',
      calledAt: null,
      checkedInAt: new Date('2026-10-07T10:18:00.000Z').toISOString(),
    },
    {
      num: 27,
      code: 'A27',
      status: 'WAITING' as const,
      citizen: citizenUser, // Rahul Sharma
      time: '10:30',
      calledAt: null,
      checkedInAt: new Date('2026-10-07T10:20:00.000Z').toISOString(),
    },
  ];

  for (const item of tokensToSeed) {
    const aptId = `apt-demo-${item.code.toLowerCase()}`;
    const apt: Appointment = {
      id: aptId,
      citizenId: item.citizen.id,
      serviceId: aadhaarService.id,
      centerId: districtCenter.id,
      appointmentDate: queueDate,
      startTime: item.time,
      endTime: `${item.time.slice(0, 3)}${parseInt(item.time.slice(3)) + 15}`,
      status: item.status === 'SERVING' ? 'IN_QUEUE' : 'CHECKED_IN',
      bookingReference: `GQ-2026-07${item.code}`,
      createdAt: now,
      updatedAt: now,
    };
    await db.createAppointment(apt);

    const token: QueueToken = {
      id: `token-${item.code.toLowerCase()}`,
      queueId: queue.id,
      appointmentId: apt.id,
      tokenNumber: item.num,
      tokenCode: item.code,
      status: item.status,
      checkedInAt: item.checkedInAt,
      calledAt: item.calledAt,
      completedAt: null,
      estimatedWaitMinutes: item.num === 27 ? 18 : (item.num - 23) * 6,
      createdAt: now,
      updatedAt: now,
    };
    await db.createQueueToken(token);
  }

  // Rahul Sharma's Notification
  const rahulNotification: Notification = {
    id: 'notif-rahul-welcome',
    userId: citizenUser.id,
    appointmentId: 'apt-demo-a27',
    type: 'CHECK_IN',
    title: 'Checked In - Token A27 Generated',
    message: 'You are checked in for Aadhaar Address Update. Your token is A27. There are 3 citizens ahead of you.',
    isRead: false,
    createdAt: new Date('2026-10-07T10:20:00.000Z').toISOString(),
  };
  await db.createNotification(rahulNotification);

  // System audit log
  await db.createAuditLog({
    id: `audit-${Date.now()}`,
    userId: null,
    action: 'SYSTEM_SEED',
    entityType: 'SYSTEM',
    entityId: null,
    metadata: { demoDate: '2026-10-07', tokenSeed: 'A27' },
    createdAt: now,
  });

  console.log('GovQueue AI database seeded successfully! Ready for demo.');
}
