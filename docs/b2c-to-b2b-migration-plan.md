# Migration Strategy: B2C to B2B Growth

This document outlines the strategy for scaling the Fractal Learning platform from a teacher-focused B2C model to a district-focused B2B model, leveraging the current Clerk Organization architecture.

## Core Architecture

We have established a "Tenant-First" architecture where every user belongs to an Organization.
- **B2C Teacher:** Admin of a `type: personal` Organization (their "Personal Workspace").
- **B2B District:** Admin of a `type: district` Organization, which contains multiple `type: school` Organizations.

## Phase 1: B2C (Current State)
Teachers sign up individually.
- **Onboarding:** Captures School Name, State, Grades.
- **Organization:** A Personal Organization is automatically created for them (e.g., "Lincoln High School Workspace").
- **Role:** They are `org:admin` of this personal workspace.
- **Data:** All classes, students, and assignments are linked to this `org_id`.

## Phase 2: The B2B Bridge (Future Migration)
When a School District purchases the platform, we need to "absorb" existing independent teachers into the official District/School hierarchy without data loss.

### Scenario A: Teacher Joins an Official School
*Example: Jane Doe (B2C) is invited to the official "Lincoln High School" (B2B) organization.*

1.  **Invitation:** District Admin invites Jane to the official `type: school` Organization.
2.  **Dual Membership:** Jane now belongs to two organizations:
    *   `org_personal_123` (Her old workspace)
    *   `org_school_456` (The official school)
3.  **Migration (Optional vs. Mandatory):**
    *   *Option 1 (Fresh Start):* Jane switches context to the new Org and starts fresh. She keeps her old personal org for archive/reference.
    *   *Option 2 (Data Migration):* We provide a "Migrate Workspace" tool.
        *   **Action:** Re-parent her Classes/Students from `org_personal_123` to `org_school_456`.
        *   **Result:** Her personal workspace becomes empty/archived, and all her data now lives in the official school bucket.

### Scenario B: "claiming" a School
*Example: 10 Teachers from "Lincoln High" are already on the platform independently. The Principal buys a license.*

1.  **Discovery:** We query `teacher_profiles` for `school_name = "Lincoln High"`.
2.  **Aggregation:** We verify the teachers are real.
3.  **Conversion:** We create the official `org_school_456`.
4.  **Bulk Invite:** We send invites to those 10 teachers.
5.  **Role Transition:**
    *   They accept the invite.
    *   They are assigned `org:teacher` role in the official school (downgraded from `org:admin` of their personal workspace).
    *   They gain access to shared district resources (curriculum, verified rosters).

## RBAC Evolution

### Current Roles (B2C)
| Role | Scope | Capabilities |
| :--- | :--- | :--- |
| **Admin** | Personal Org | Full control. Billing, Roster, Assignments. |

### Future Roles (B2B)
| Role | Scope | Capabilities |
| :--- | :--- | :--- |
| **District Admin** | District Org | Create Schools, View District Analytics, Manage Licenses. |
| **School Admin** | School Org | Manage Teacher Roster, View School Analytics. |
| **Teacher** | School Org | Manage Classes, Assignments, Student Grades. (Cannot delete the School). |
| **Student** | School Org | View Assignments, Submit Work. |

## Database Implications
The current schema (`organizations` table with `parent_id`) supports this transition naturally.

1.  **District Creation:** A new Org is created with `type: district`.
2.  **School Creation:** New Orgs are created with `type: school` and `parent_id` linked to the District.
3.  **Personal Orgs:** Remain `type: personal` with `parent_id: null`.

## Action Items for Future
1.  **Migration Scripts:** Build internal tools to move `classes` and `assignments` from one `org_id` to another.
2.  **Organization Switcher:** Ensure the UI handles users belonging to multiple organizations (e.g., a Personal Workspace AND an Official School).
3.  **Domain Matching:** Eventually implement logic to auto-suggest Schools based on email domain (e.g., `@austinisd.org` -> Suggest "Austin ISD").

