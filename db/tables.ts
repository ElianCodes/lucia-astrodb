import { defineTable, column, NOW } from "astro:db";

export const Session = defineTable({
	columns: {
		id: column.text({ primaryKey: true }),
		userId: column.number({ references: () => User.columns.id }),
		expiresAt: column.number(),
	},
});

export const User = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		url: column.text({ optional: true }),
		name: column.text(),
		email: column.text({ unique: true, optional: true }),
		avatar: column.text({ optional: true }),
		githubId: column.number({ unique: true }),
		username: column.text(),
		updatedAt: column.date({ default: NOW, nullable: true }),
		createdAt: column.date({ default: NOW, nullable: true }),
	},
});