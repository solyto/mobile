# Tasks: paginate-users

id: slowly
analyst: wilfred (developer, from the room decision)
date: 2026-11-21

## Task breakdown

TASK-1: Page the admin user list through the API (`page`, `per_page=25`, server-side `search`), add a pager, and feed the growth chart from `GET /users/growth`.
     files: src/lib/state/UserManagement.svelte.ts, src/lib/types/managed_user.ts, src/lib/config/apiRoutes.ts,
            src/lib/components/admin/{UserList,UserGrowthChart}.svelte, src/lib/components/ui/Pagination.svelte,
            src/lib/components/ui/buttons/IconButton.svelte, src/routes/admin/{+layout,users/+page}.svelte,
            src/lib/i18n/*.ts, src/lib/types/translation.ts, tests/unit/stores/UserManagement.test.ts
     depends: API contract with solyto-api (room decisions 01M7ZJBJN7JHYKHQYFKHG7GSZ8, 01M7ZJK6FTE25BB483J9DZ1Z8S)
     risk: medium — the growth chart moves from client-side bucketing to a server aggregate
