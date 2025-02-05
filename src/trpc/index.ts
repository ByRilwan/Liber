import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id || !user.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Check if the user exists in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id, // Using awaited user.id (although async is unnecessary)
      },
    });

    // If the user doesn't exist, create a new one
    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id, // Keep await here if user is async (which it's not)
          email: user.email, // Keep await here if necessary
        },
      });
    }

    return { success: true };
  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({
      where: {
        userId,
      },
    });
  }),

  
getFile: privateProcedure
.input(z.object({key: z.string()}))
.mutation(async({ctx, input}) => {
const {userId} = ctx

const file = await db.file.findFirst({
  where: {
    key: input.key,
    userId
  },
})

if(!file) throw new TRPCError({code : "NOT_FOUND"})
  
  return file
}),


  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      }) 

     if(!file) throw new TRPCError({code:"NOT_FOUND"})
      await db.file.delete({
        where:{
          id: input.id,
        },
    })
      return file
    }),
});

export type AppRouter = typeof appRouter;
