import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

let rawPrisma = null;
const isDbConfigured = process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0;

if (isDbConfigured) {
  try {
    rawPrisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (e) {
    console.error('Failed to initialize Prisma client with URL:', e);
  }
}

// Prepopulated local in-memory database matching the redesign mockup
const mockDb = {
  users: [
    {
      id: '60d5ec4b1234567890abcdef',
      name: 'Krishan Chamoli',
      email: 'krishan@gmail.com',
      password: bcrypt.hashSync('password', 10),
      createdAt: new Date('2025-05-29T10:30:00.000Z'),
    }
  ],
  contents: [
    {
      id: '60d5ec4b1234567890f912e1',
      userId: '60d5ec4b1234567890abcdef',
      contentType: 'Blog Post',
      topic: '10 Productivity Tips for Remote Developers',
      tone: 'Professional',
      prompt: 'Generate a highly engaging Blog Post about "10 Productivity Tips for Remote Developers".',
      output: `# 10 Productivity Tips for Remote Developers\n\nWorking remotely offers incredible flexibility, but it also comes with unique challenges. Here are 10 proven tips to stay focused, motivated, and highly productive.\n\n### 1. Establish a Dedicated Workspace\nDesignate a specific area in your home solely for work. This helps mentally separate "home mode" from "work mode."`,
      createdAt: new Date('2025-05-29T10:30:00.000Z'),
    },
    {
      id: '60d5ec4b1234567890f912e2',
      userId: '60d5ec4b1234567890abcdef',
      contentType: 'Marketing Ad',
      topic: 'New Feature Launch Announcement',
      tone: 'Persuasive',
      prompt: 'Generate a highly engaging Marketing Ad about "New Feature Launch Announcement".',
      output: `## 🚨 ATTENTION: Next-Gen Content Studio is Live! 🚨\n\nAre you ready to revolutionize the way you write? Introducing the all-new content assistant designed to speed up your workflows by 2x. Try it free today!`,
      createdAt: new Date('2025-05-29T09:15:00.000Z'),
    },
    {
      id: '60d5ec4b1234567890f912e3',
      userId: '60d5ec4b1234567890abcdef',
      contentType: 'Email Draft',
      topic: 'Weekly Newsletter - May Edition',
      tone: 'Informative',
      prompt: 'Generate a highly engaging Email Draft about "Weekly Newsletter - May Edition".',
      output: `**Subject:** Your weekly digest is here! 📩\n\nHi [Name],\n\nWelcome to the May edition of our newsletter. This week, we cover the latest web development trends, Javascript updates, and design tips.`,
      createdAt: new Date('2025-05-28T16:45:00.000Z'),
    },
    {
      id: '60d5ec4b1234567890f912e4',
      userId: '60d5ec4b1234567890abcdef',
      contentType: 'Social Media Post',
      topic: 'Summer Collection Promo Post',
      tone: 'Casual',
      prompt: 'Generate a highly engaging Social Media Post about "Summer Collection Promo Post".',
      output: `🚀 Our new summer line is officially live! Check out the link in bio to shop the latest fits. Warm weather is here, let's style! ☀️ #SummerDrop #CasualStyle`,
      createdAt: new Date('2025-05-28T11:20:00.000Z'),
    }
  ]
};

// Expose Prisma Client interface wrapped with safe mock database support
export const prisma = {
  user: {
    findUnique: async ({ where }) => {
      const isMockId = where.id && (typeof where.id === 'string') && where.id.startsWith('mock_');
      if (rawPrisma && isDbConfigured && !isMockId) {
        try {
          return await rawPrisma.user.findUnique({ where });
        } catch (e) {
          console.warn('Prisma findUnique failed, using in-memory mock:', e);
        }
      }
      return mockDb.users.find(u => u.email === where.email || u.id === where.id) || null;
    },
    create: async ({ data }) => {
      if (rawPrisma && isDbConfigured) {
        try {
          return await rawPrisma.user.create({ data });
        } catch (e) {
          console.warn('Prisma create user failed, using in-memory mock:', e);
        }
      }
      const newUser = {
        id: 'mock_user_' + Math.random().toString(36).substring(2, 9),
        name: data.name,
        email: data.email,
        password: data.password || '',
        createdAt: new Date(),
      };
      mockDb.users.push(newUser);
      return newUser;
    }
  },
  content: {
    findMany: async ({ where, orderBy }) => {
      const isMockUserId = where && where.userId && (typeof where.userId === 'string') && where.userId.startsWith('mock_');
      if (rawPrisma && isDbConfigured && !isMockUserId) {
        try {
          return await rawPrisma.content.findMany({ where, orderBy });
        } catch (e) {
          console.warn('Prisma findMany content failed, using in-memory mock:', e);
        }
      }
      // Filter list
      let results = [...mockDb.contents];
      if (where && where.userId) {
        results = results.filter(c => c.userId === where.userId);
      }
      if (orderBy && orderBy.createdAt === 'desc') {
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      return results;
    },
    create: async ({ data }) => {
      if (rawPrisma && isDbConfigured) {
        try {
          return await rawPrisma.content.create({ data });
        } catch (e) {
          console.warn('Prisma create content failed, using in-memory mock:', e);
        }
      }
      const newContent = {
        id: 'mock_content_' + Math.random().toString(36).substring(2, 9),
        userId: data.userId,
        contentType: data.contentType,
        topic: data.topic,
        tone: data.tone,
        prompt: data.prompt,
        output: data.output,
        createdAt: new Date(),
      };
      mockDb.contents.push(newContent);
      return newContent;
    },
    delete: async ({ where }) => {
      const isMockId = where && where.id && (typeof where.id === 'string') && where.id.startsWith('mock_');
      if (rawPrisma && isDbConfigured && !isMockId) {
        try {
          return await rawPrisma.content.delete({ where });
        } catch (e) {
          console.warn('Prisma delete content failed, using in-memory mock:', e);
        }
      }
      const idx = mockDb.contents.findIndex(c => c.id === where.id);
      if (idx !== -1) {
        const deleted = mockDb.contents[idx];
        mockDb.contents.splice(idx, 1);
        return deleted;
      }
      throw new Error('Record to delete does not exist.');
    }
  }
};
