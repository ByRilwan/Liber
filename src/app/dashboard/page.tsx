import Dashboard from "@/components/Dashboard";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";

const Page = async () => {
  // Load the session to ensure it's fully available
  const session = await getKindeServerSession();

  // Extract the user once the session is available
  const user = await session?.getUser();

  // Redirect to login if user data or user ID is missing
  if (!user || !user.id) {
    return redirect("/auth-callback?origin=dashboard");
  }

  // Check if the user exists in the database by querying with the user ID
  const dbUser = await db.user.findUnique({
    where: {
      id: user.id, // Use the user ID directly since it was checked above
    },
  });

  // Redirect if the user does not exist in the database
  if (!dbUser) {
    return redirect("/auth-callback?origin=dashboard");
  }

  // Render the Dashboard component if the user exists
  return <Dashboard />;
};

export default Page;

