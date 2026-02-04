# Deprecated frontend API routes

These frontend API route files were intentionally deprecated and their behavior moved to the backend. You can safely delete the following files to remove the routes from the frontend app:

- app/api/admin/users/route.ts
- app/api/admin/users/[id]/route.ts
- app/api/user/profile/route.ts
- app/api/user/avatar/route.ts
- app/api/auth/logout/route.ts

Why: Routes belonging to application business logic (auth, profile, admin actions, uploads) belong in the backend. Keeping them in the frontend increases ambiguity and duplicates responsibilities. The backend now exposes these endpoints; update your frontend to call the backend directly (this workspace already does).

If you want these files physically removed from the repo, confirm and I will remove them (I will also add a short test for the backend logout/profile endpoints if you want).