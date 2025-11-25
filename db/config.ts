import { defineDb, defineTable, column, NOW } from "astro:db";

// Better-auth compatible User Table
export const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }), // better-auth uses text IDs
    name: column.text({ optional: true }),
    email: column.text({ unique: true }),
    emailVerified: column.boolean({ default: false }),
    image: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

// Better-auth Session Table
export const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    expiresAt: column.date(),
    ipAddress: column.text({ optional: true }),
    userAgent: column.text({ optional: true }),
    userId: column.text({ references: () => User.columns.id }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

// Better-auth Account Table (for OAuth providers)
export const Account = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    accountId: column.text(),
    providerId: column.text(),
    userId: column.text({ references: () => User.columns.id }),
    accessToken: column.text({ optional: true }),
    refreshToken: column.text({ optional: true }),
    idToken: column.text({ optional: true }),
    expiresAt: column.date({ optional: true }),
    password: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

// Better-auth Verification Table (for email verification)
export const Verification = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    identifier: column.text(),
    value: column.text(),
    expiresAt: column.date(),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ optional: true }),
  },
});

// User Bookmark/Save Table (your custom table)
export const Bookmark = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),

    // Media information
    title: column.text(),
    year: column.number({ optional: true }),
    category: column.text(), // 'Movie' or 'TV Series'
    rating: column.text({ optional: true }),
    thumbnail: column.text({ optional: true }),

    // For external API data (like OMDB)
    imdbId: column.text({ optional: true }),

    createdAt: column.date({ default: NOW }),
  },
});

// User Preferences (your custom table)
export const UserPreferences = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    userId: column.text({ unique: true, references: () => User.columns.id }),

    // Preferences
    language: column.text({ default: "en" }), // 'en', 'zh-TW', etc.
    showAdultContent: column.boolean({ default: false }), // 18+ content filter
    theme: column.text({ default: "dark" }), // 'dark' or 'light'

    updatedAt: column.date({ default: NOW }),
  },
});

export default defineDb({
  tables: { User, Session, Account, Verification, Bookmark, UserPreferences },
});
