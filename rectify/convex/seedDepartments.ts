import { mutation } from "./_generated/server";

export const seedCoreDepartments = mutation({
  args: {},
  handler: async (ctx) => {
    // First check if departments already exist
    const existingDepartments = await ctx.db.query("departments").collect();
    
    if (existingDepartments.length > 0) {
      return { message: "Departments already exist", count: existingDepartments.length };
    }

    const coreDepartments = [
      {
        name: "General Administration & Revenue",
        description: "Manages internal operations of the corporation and handles collection of taxes and other revenue. Responsible for administrative functions, policy implementation, and revenue collection activities.",
        contactEmail: "admin-revenue@jansamadhan.gov.in",
        contactPhone: "+91-11-23456789",
        head: "Shri Rajesh Kumar Sharma",
        category: "other" as const,
        status: "active" as const,
        avgResponseTime: 4,
        totalAssigned: 0,
        totalResolved: 0,
        workingHours: {
          start: "09:00",
          end: "18:00",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        }
      },
      {
        name: "Engineering Department",
        description: "Responsible for infrastructure development and maintenance, including roads, buildings, water systems, and structural projects. Handles construction, repairs, and engineering assessments.",
        contactEmail: "engineering@jansamadhan.gov.in",
        contactPhone: "+91-11-23456790",
        head: "Er. Priya Patel",
        category: "infrastructure" as const,
        status: "active" as const,
        avgResponseTime: 8,
        totalAssigned: 0,
        totalResolved: 0,
        workingHours: {
          start: "08:00",
          end: "17:00",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        }
      },
      {
        name: "Town Planning Department",
        description: "Oversees planned development of the city, building plan approvals, master planning, zoning regulations, and urban development projects. Ensures systematic city growth.",
        contactEmail: "townplanning@jansamadhan.gov.in",
        contactPhone: "+91-11-23456791",
        head: "Dr. Anita Singh",
        category: "infrastructure" as const,
        status: "active" as const,
        avgResponseTime: 12,
        totalAssigned: 0,
        totalResolved: 0,
        workingHours: {
          start: "09:30",
          end: "17:30",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        }
      },
      {
        name: "Health Department",
        description: "Provides public health services, sanitation oversight, medical facilities management, disease prevention programs, and health inspections within municipal limits.",
        contactEmail: "health@jansamadhan.gov.in",
        contactPhone: "+91-11-23456792",
        head: "Dr. Vikram Mehta",
        category: "public_safety" as const,
        status: "active" as const,
        avgResponseTime: 6,
        totalAssigned: 0,
        totalResolved: 0,
        workingHours: {
          start: "08:00",
          end: "20:00",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        }
      },
      {
        name: "Education Department",
        description: "Manages local schools, educational facilities, teacher administration, educational programs, and infrastructure for learning institutions within the municipal area.",
        contactEmail: "education@jansamadhan.gov.in",
        contactPhone: "+91-11-23456793",
        head: "Ms. Sunita Gupta",
        category: "other" as const,
        status: "active" as const,
        avgResponseTime: 10,
        totalAssigned: 0,
        totalResolved: 0,
        workingHours: {
          start: "09:00",
          end: "17:00",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        }
      },
      {
        name: "Social Welfare Department",
        description: "Implements social welfare programs, services for vulnerable populations, poverty alleviation schemes, and community development initiatives for local residents.",
        contactEmail: "welfare@jansamadhan.gov.in",
        contactPhone: "+91-11-23456794",
        head: "Shri Mohan Das",
        category: "other" as const,
        status: "active" as const,
        avgResponseTime: 7,
        totalAssigned: 0,
        totalResolved: 0,
        workingHours: {
          start: "09:00",
          end: "18:00",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        }
      },
      {
        name: "Sanitation Department",
        description: "Handles waste management, garbage collection, street cleaning, drainage maintenance, and overall cleanliness operations throughout the municipal area.",
        contactEmail: "sanitation@jansamadhan.gov.in",
        contactPhone: "+91-11-23456795",
        head: "Shri Ramesh Kumar",
        category: "sanitation" as const,
        status: "active" as const,
        avgResponseTime: 4,
        totalAssigned: 0,
        totalResolved: 0,
        workingHours: {
          start: "06:00",
          end: "18:00",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        }
      },
      {
        name: "Water Supply Department",
        description: "Manages municipal water supply systems, water quality monitoring, distribution networks, pipeline maintenance, and water billing services.",
        contactEmail: "water@jansamadhan.gov.in",
        contactPhone: "+91-11-23456796",
        head: "Er. Kavita Sharma",
        category: "utilities" as const,
        status: "active" as const,
        avgResponseTime: 6,
        totalAssigned: 0,
        totalResolved: 0,
        workingHours: {
          start: "07:00",
          end: "19:00",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        }
      },
      {
        name: "Transportation Department",
        description: "Oversees public transportation services, traffic management, parking facilities, and transportation infrastructure within the municipal jurisdiction.",
        contactEmail: "transport@jansamadhan.gov.in",
        contactPhone: "+91-11-23456797",
        head: "Shri Ajay Verma",
        category: "transportation" as const,
        status: "active" as const,
        avgResponseTime: 8,
        totalAssigned: 0,
        totalResolved: 0,
        workingHours: {
          start: "06:00",
          end: "22:00",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        }
      }
    ];

    const now = new Date().toISOString();
    const insertedDepartments = [];

    for (const department of coreDepartments) {
      const departmentId = await ctx.db.insert("departments", {
        ...department,
        createdAt: now,
        updatedAt: now,
      });
      insertedDepartments.push(departmentId);
    }

    return { 
      message: "Successfully seeded core departments", 
      count: insertedDepartments.length,
      departments: insertedDepartments 
    };
  },
});