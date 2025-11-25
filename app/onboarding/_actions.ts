"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { teacherProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const completeOnboarding = async (formData: FormData) => {
  console.log("[Onboarding] Starting onboarding submission");
  
  try {
    const { userId } = await auth();
    console.log("[Onboarding] UserId:", userId);

    if (!userId) {
      console.log("[Onboarding] No user ID found");
      return { error: "No Logged In User" };
    }

    // Check environment variable
    if (!process.env.CLERK_SECRET_KEY) {
      console.error("[Onboarding] Missing CLERK_SECRET_KEY");
      return { error: "Server configuration error: Missing Clerk Secret Key" };
    }

    const client = await clerkClient();
    console.log("[Onboarding] Clerk client initialized");
    
    const db = getDb();
    console.log("[Onboarding] Database initialized");

    const schoolName = formData.get("schoolName") as string;
    const state = formData.get("state") as string;
    const gradesRaw = formData.getAll("grades");
    const grades = Array.isArray(gradesRaw) ? gradesRaw : [];
    const yearsExperience = parseInt(formData.get("yearsExperience") as string) || 0;

    console.log("[Onboarding] Form data parsed:", { schoolName, state, grades, yearsExperience });

    // 1. Save to Database
    console.log("[Onboarding] Saving to database...");
    await db
      .insert(teacherProfiles)
      .values({
        userId,
        schoolName,
        state,
        grades,
        yearsExperience,
      })
      .onConflictDoUpdate({
        target: teacherProfiles.userId,
        set: {
          schoolName,
          state,
          grades,
          yearsExperience,
          updatedAt: new Date(),
        },
      });
    console.log("[Onboarding] Database save successful");

    // 2. Create Personal Organization & Update Metadata
    console.log("[Onboarding] Creating Personal Organization...");
    try {
      // Create the organization
      // We use the school name as the org name, or fall back to "My Workspace"
      const orgName = schoolName || "My Workspace";
      const organization = await client.organizations.createOrganization({
        name: orgName,
        createdBy: userId,
        publicMetadata: {
            type: "personal", // Explicitly mark this as their personal workspace
        }
      });
      console.log("[Onboarding] Organization created:", organization.id);

      // Update User Metadata
      const res = await client.users.updateUser(userId, {
        publicMetadata: {
          onboardingComplete: true,
          personalOrgId: organization.id,
        },
      });
      console.log("[Onboarding] Clerk metadata updated successfully:", res.publicMetadata);
      
      return { message: res.publicMetadata };

    } catch (clerkError) {
        console.error("[Onboarding] Clerk Operation Failed:", clerkError);
        
        // Check if error is because user already has too many orgs or other specific logic
        // But generally, we fail the request so the user can try again
        return { error: "Failed to set up your workspace. Please try again." };
    }

  } catch (err) {
    console.error("[Onboarding] Global Error:", err);
    if (err instanceof Error) {
      return { error: `Error: ${err.message}` };
    }
    return { error: "There was an unknown error updating the user profile." };
  }
};
