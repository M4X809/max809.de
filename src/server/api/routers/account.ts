import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { checkConf, isAdmin, setNestedValue } from "~/lib/sUtils";
import { users } from "~/server/db/schema";
import { db } from "~/server/db";

// Dynamically infer keys of Config and Config["userPage"] from TypeScript's `keyof`
export const accountRouter = createTRPCRouter({
	setConfig: protectedProcedure
		.input(
			z.object({
				path: z.string(),
				value: z
					.string()
					.or(z.boolean())
					.or(z.number().or(z.array(z.string()))),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, ctx.session.user.id),
			});
			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No user found with that ID.",
				});
			}

			if (user.admin && !(await isAdmin())) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to perform this action.",
				});
			}

			const newConf = setNestedValue(user.config, input.path, input.value);
			const checkedConfig = checkConf(newConf);
			await db
				.update(users)
				.set({
					config: checkedConfig.data ?? (user.config as any),
				})
				.where(eq(users.id, ctx.session.user.id))
				.execute();

			return {
				status: "success",
			};
		}),
});
