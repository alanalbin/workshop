import { EventConfig } from '@/types';

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  id: 'problem-to-possibility-kmct-2026',
  title: 'FROM PROBLEM TO POSSIBILITY',
  tagline: 'Turn Real-World Challenges into Pitch-Ready Innovations!',
  description:
    'A hands-on, activity-driven offline workshop on Problem Solving, Ideation & Pitching organized under the Institution’s Innovation Council (IIC) Quarter 1 Activities framework at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod. Tailored for 1st-year students to identify real problems, prototype concepts on chart paper, and deliver structured pitches.',
  durationHours: 6.5,
  hostInstitution: 'KMCT College of Engineering for Emerging Technologies and Management',
  locationCity: 'Kasaragod',
  locationState: 'Kerala',
  associatedInitiative: 'Institution’s Innovation Council (IIC) Quarter 1 Activities',
  officialWebsite: 'https://www.kmct.org',

  // Schedule & Venue — Confirmed 11th November 2026
  date: '11th November 2026',
  startTime: '09:30 AM',
  endTime: '04:00 PM',
  venue: 'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod, Kerala',
  roomNumber: 'College Seminar Hall',
  registrationClosingDate: '2026-11-11T09:00:00+05:30',
  registrationsClosed: false,
  eventCompleted: false,

  // Pricing & Capacities
  registrationFee: 100, // ₹100 per participant
  registrationFeePaise: 10000,
  officialDiscountFee: 100,
  discountDeadline: '11 November 2026',
  priceDiscrepancyAcknowledged: true,
  livePaymentsEnabled: true,
  minimumTarget: 70, // 70 seats capacity
  capacity: 70, // Strict cap: 70 seats

  // UPI & Payment Defaults
  upiId: 'abdulmujeeb@kmct',
  upiMerchantName: 'KMCT IIC Workshop',
  googleSheetWebhookUrl: process.env.GOOGLE_SHEET_WEBHOOK_URL || '',

  // Coordinators & Approvals
  officialContact: {
    name: 'Mr. Abdul Mujeeb MS',
    email: 'abdulmujeeb@kmct.edu.in',
    phone: '8848563266',
    role: 'IIC Coordinator, KMCT College of Engineering',
  },
  localCoordinator: {
    name: 'Mr. Abdul Mujeeb MS',
    email: 'abdulmujeeb@kmct.edu.in',
    phone: '8848563266',
    role: 'IIC Coordinator',
  },

  // Resource Person / Speakers
  speakers: [
    {
      name: 'Mr. Muhammed Shayiz K P',
      role: 'Senior Software Engineer, Doodleblue Innovations, Chennai & Co-founder, Shine Technologies, Kannur',
      organization: 'Doodleblue Innovations & Shine Technologies',
      topic: 'Problem Solving, Ideation & Pitching (From Problem to Possibility)',
      confirmed: true,
    },
  ],

  // Benefits & Key Takeaways
  benefits: [
    {
      id: 'cert',
      title: 'Official IIC Activity Certificate',
      description: 'Activity-endorsed certificate of participation issued under Institution’s Innovation Council (IIC) Quarter 1 Activities framework.',
      verified: true,
      condition: 'Subject to attending the full-day offline workshop sessions.',
      iconName: 'Award',
    },
    {
      id: 'kit',
      title: 'Workshop Materials & Hand-drawn Concept Poster',
      description: 'Hands-on materials provided including chart papers, markers, pencils, and A4 empathy/problem-framing worksheets to build your physical prototype storyboard.',
      verified: true,
      condition: 'Provided to all registered and attending participants.',
      iconName: 'Package',
    },
    {
      id: 'curriculum',
      title: 'Mentored Ideation & Rapid Pitch Training',
      description: 'Learn Crazy 8s, Yes-And, Worst-Idea reversal, dot voting, impact-feasibility matrix, and build pitch-ready slide decks directly with industry mentors.',
      verified: true,
      condition: 'Live interactive team activities at College Seminar Hall.',
      iconName: 'Sparkles',
    },
    {
      id: 'ecosystem',
      title: 'KSUM & IEDC Incubation Pathway',
      description: 'Top student concepts gain direct advisory access and next-step pathways into user validation, prototype development, and Kerala Startup Mission (KSUM) incubation.',
      verified: true,
      condition: 'Guided by IIC Coordinator and college innovation ecosystem mentors.',
      iconName: 'Compass',
    },
    {
      id: 'refreshments',
      title: 'Refreshments & Canteen Snacks Included',
      description: 'Refreshments including morning tea and fresh hot canteen samosas provided during scheduled workshop breaks.',
      verified: true,
      condition: 'Included in the ₹100 registration pass for all 70 participants.',
      iconName: 'Trophy',
    },
  ],

  // Frequently Asked Questions
  faq: [
    {
      id: 'faq-1',
      question: 'What is "From Problem to Possibility"?',
      answer:
        'It is an offline, activity-driven workshop on Problem Solving, Ideation, and Pitching organized under the Institution’s Innovation Council (IIC) Quarter 1 Activities at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod. Participants work in small multidisciplinary teams to tackle real-world problems and develop pitch-ready innovations.',
      category: 'general',
    },
    {
      id: 'faq-2',
      question: 'When and where will the workshop take place?',
      answer:
        'The workshop is scheduled for Wednesday, 11th November 2026, from 09:30 AM to 04:00 PM offline at the College Seminar Hall, KMCT College of Engineering for Emerging Technologies and Management, Kasaragod, Kerala.',
      category: 'event',
    },
    {
      id: 'faq-3',
      question: 'What is the registration fee and seat limit?',
      answer:
        'The registration fee is ₹100/- per student. Registration is strictly capped at 70 seats to ensure deep interactive participation and personalized mentor feedback.',
      category: 'payment',
    },
    {
      id: 'faq-4',
      question: 'Who is the Resource Person / Keynote Speaker?',
      answer:
        'The workshop is led by Mr. Muhammed Shayiz K P (Senior Software Engineer at Doodleblue Innovations, Chennai, and Co-founder of Shine Technologies, Kannur).',
      category: 'general',
    },
    {
      id: 'faq-5',
      question: 'Who is eligible to participate?',
      answer:
        'The workshop is designed for 1st-year Engineering and Management students of KMCT College of Engineering for Emerging Technologies and Management, Kasaragod.',
      category: 'registration',
    },
    {
      id: 'faq-6',
      question: 'What will each participant/team produce by the end of the day?',
      answer:
        'Each team will produce: (1) A clearly written problem statement and defined target user, (2) Alternative solution ideas and a reasoned selection, (3) A hand-drawn concept/prototype poster showing how the solution works, (4) A short pitch supported by a simple presentation structure, and (5) A next-step plan covering user validation, prototype development, and ecosystem support.',
      category: 'event',
    },
    {
      id: 'faq-7',
      question: 'What does the registration fee cover?',
      answer:
        'The ₹100 pass covers complete access to the 6.5-hour workshop, chart papers, markers, stationery, worksheets, mentor guidance, refreshments (morning tea & canteen samosas), and an official IIC participation certificate.',
      category: 'payment',
    },
  ],

  published: true,
  updatedAt: new Date().toISOString(),
};
