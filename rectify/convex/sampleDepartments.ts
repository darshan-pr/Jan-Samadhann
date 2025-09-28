// Sample seed data for departments
// This can be used to populate the departments collection

export const sampleDepartments = [
  {
    name: "Public Works Department",
    description: "Responsible for infrastructure maintenance, road repairs, and public utilities",
    contactEmail: "publicworks@jansamadhan.gov.in",
    contactPhone: "+91-98765-43210",
    head: "Rajesh Kumar",
    category: "infrastructure",
    workingHours: {
      start: "09:00",
      end: "18:00",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    }
  },
  {
    name: "Sanitation Department",
    description: "Waste management, cleanliness, and hygiene services",
    contactEmail: "sanitation@jansamadhan.gov.in",
    contactPhone: "+91-98765-43211",
    head: "Priya Sharma",
    category: "sanitation",
    workingHours: {
      start: "06:00",
      end: "22:00",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }
  },
  {
    name: "Traffic Management",
    description: "Traffic control, signal maintenance, and road safety",
    contactEmail: "traffic@jansamadhan.gov.in",
    contactPhone: "+91-98765-43212",
    head: "Amit Singh",
    category: "transportation",
    workingHours: {
      start: "24/7",
      end: "24/7",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }
  },
  {
    name: "Electricity Board",
    description: "Power supply, electrical maintenance, and utility services",
    contactEmail: "electricity@jansamadhan.gov.in",
    contactPhone: "+91-98765-43213",
    head: "Sunita Patel",
    category: "utilities",
    workingHours: {
      start: "08:00",
      end: "17:00",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    }
  },
  {
    name: "Fire & Emergency Services",
    description: "Fire safety, emergency response, and disaster management",
    contactEmail: "emergency@jansamadhan.gov.in",
    contactPhone: "+91-98765-43214",
    head: "Vikram Yadav",
    category: "public_safety",
    workingHours: {
      start: "24/7",
      end: "24/7",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }
  },
  {
    name: "Environment Protection Agency",
    description: "Pollution control, environmental monitoring, and green initiatives",
    contactEmail: "environment@jansamadhan.gov.in",
    contactPhone: "+91-98765-43215",
    head: "Dr. Meera Gupta",
    category: "environment",
    workingHours: {
      start: "09:00",
      end: "18:00",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    }
  }
];

// Instructions for seeding:
// 1. Run this in your Convex dashboard or create a mutation to insert these
// 2. Each department will be created with default values for stats (totalAssigned: 0, totalResolved: 0, etc.)
// 3. The departments will be available for routing posts in the admin interface