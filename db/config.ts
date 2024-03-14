import { defineDb } from "astro:db";
import { Session, User } from "./tables";

export default defineDb({
	tables: {
		Session,
		User,
	},
});
