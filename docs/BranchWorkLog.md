# Branch Work Log

This journal records which assignment was implemented on each branch and its actual
merge/deployment state. Add the newest assignment first.

## `feature/export-licence-item-columns`

- Assignment date: 2026-11-09. Base: `main` at `d6963fc`. Implementation:
  `0f97ffd`. Branch published to origin; main merge and deployment pending.
  Deferred ICT work remains on its own branch and is not included here.
- Request: the November 6 forwarded email and `Export Reports.pdf` add HS Code,
  Description, and QTY after Company Address, before Currency, to Export Licence
  Cancellation, Amendment, and Actual Amendment reports. Table and Excel column
  order match. Existing right-hand HS Code columns were retained as in the sample.
- Reused the existing item HS Code and added item Description / decimal Quantity
  to the SQL/API/export pipeline. Existing first-item selection and one row per
  licence remain; missing items yield NULL details. Filters, counts, currency
  values, and totals were preserved. Shared procedure branches for other families
  return NULL details, omitted from their JSON, without adding UI columns.
- Both table and Excel use the same projection. The three controllers now use
  Excel format version 3 to prevent reuse of old cached workbooks.
- Verification: six backend and three frontend regressions reproduced before
  implementation. All 32 focused backend tests passed, including multi-item,
  missing-item, streamed-export, shared Import Permit compatibility, date-window,
  and cache checks, using disposable LocalDB databases. All three Playwright
  browser cases passed with mocked responses; production frontend build passed
  with the existing chunk-size warning. Temporary Vite server was stopped.
- The broader frontend run passed 24 checks and retained three failures also
  reproduced against original `main`: old subtitle wording, voucher payment
  lookup, and New report Licence Date expectations. The Excel contract run passed
  1,313 checks; its one existing coverage failure is missing Import/Border Import
  Turndown fixture-index entries, also absent on `main`. Only the three requested
  Excel fixtures and their index entries were changed.
- Logs: `artifacts/export-item-columns-{red,green,ui-red,ui-green,baseline,build,
  browser,excel-contracts,fixture-coverage}.log`.
- Rollout: apply `StoredProcedureMigrations/sp_AmendReport_pagination.sql`,
  `sp_ActualAmendReport_pagination.sql`, and `sp_CancelReport_pagination.sql`
  before deploying the backend/frontend. Original non-pagination procedures and
  source data are unchanged. No scripts were installed on the shared database.
  The existing deployed Turndown correction was preserved by merging
  `fix/import-turndown-valid-remarks` in `a788554`; the ICT feature is excluded.
- Release preparation on 2026-11-09: all 56 combined backend regression checks
  and six focused frontend checks passed after that preservation merge. Preflight
  confirmed the three live procedure definitions match pre-feature `main`.
  Site rollback backup: `.deploy/pre-export-items-deploy-20261109-171234/`.
- The pre-existing Frontend README changes and generated graph were preserved.

## `fix/import-turndown-valid-remarks`

- Assignment date: 2026-10-31.
- Base branch: `main`; base commit: `d6963fc`.
- Fix commit: `708887f`.
- Status: Scope correction deployed to production with user approval on
  2026-11-01 from `173a727` (backend version `1.0.0+173a727`), replacing the
  restrictive `70dae93` deployment of 2026-10-31. Branch remains local;
  not pushed or merged into `main`.

### Scope and verification

- Scope correction requested on 2026-10-31 after the deployed current-status
  restriction reduced the October border report to three rows: removed the
  `Status = 'Reject'` restriction from date qualification, main rows, and history.
  Retained NULL/blank/whitespace and `Re Open` remark exclusion consistently.
  Recorded history remains eligible after the application's status changes.
  Both Excel format versions are now 3 to prevent reuse of restrictive exports.
  Correction committed as `173a727` and deployed on 2026-11-01. Updated only the
  two procedures and backend cache versions; frontend unchanged.
- Correction verification: six regression failures reproduced before changing
  SQL/cache versions; all 24 focused backend tests passed afterward. A read-only
  execution of the corrected SQL body against October 1-31 production border
  data returned 906 rows with zero missing remarks, without altering procedures.
  Logs: `artifacts/turndown-status-scope-red.log` and
  `artifacts/turndown-status-scope-green.log`. No frontend changes were needed.
- Correction rollout: both SQL definitions updated in one transaction before
  running `deploy.ps1 -NoGit -NoFrontend`. Source data, Apply Types, and SQL
  permissions were unchanged. Backup:
  `.deploy/pre-turndown-scope-deploy-20261101-112737/`, including site files and
  `rollback-procedures.sql` (uploaded images excluded).
- Live correction verification passed with the application SQL login: October
  reports returned 2,949 oversea and 906 border rows with zero missing remarks.
  Pending and Reject samples in both families matched history counts and latest
  dates/remarks. Both procedure EXECUTE permissions remain present.
- API health and public site returned HTTP 200; API.dll matches the release;
  backend settings and frontend web.config match the backup. The unchanged public
  bundle matches the existing built asset. Both report routes return HTTP 401
  without login; authenticated production browser testing was not performed.
  Logs: `.deploy/turndown-scope-deployment-20261101.log` and
  `.deploy/turndown-scope-live-{sql,site}-verification.log`.
- The following notes describe the earlier deployed revision, before that
  local scope correction.

- Corrected both Import Licence Turndown reports to include only applications
  currently at `Status = 'Reject'`. NULL, empty, whitespace-only, and identifiable
  `Re Open` remarks are excluded before date qualification, latest-event
  selection, counts, history details, and Excel generation. Whitespace checks
  cover spaces, tabs, line breaks, and non-breaking spaces.
- The custom Turndown reports have no matching legacy RDLC/view. Report columns,
  filter controls, and Apply Type lookup values were preserved. Legacy API code
  confirms rejection sets `Reject` and writes a history remark; later checking
  can clear history remarks.
- Replaced the stale missing-remark explanation with the valid-event counting
  rule. Existing wrapping, Show more/Show less, and inline expansion remain.
- Bumped both report controllers' Excel format versions to 2 so cached exports
  generated under the old eligibility rules cannot be reused after rollout.
- Regression run reproduced 11 failures before the fix. All 24 focused backend
  SQL, validation, cache-version, and export-contract tests passed afterward.
  Tests use disposable LocalDB databases. Both updated browser tests and the
  frontend production build passed (existing bundle-size warning only).
- Read-only production-data inspection for 2026-10-01 through 2026-10-02 found
  historical events on 311 now-approved oversea applications and 40 now-approved
  border applications, confirming the senior's concern. Running the corrected
  procedure body without installing it returned 12 oversea applications and
  zero border applications for that range, with no missing remarks or
  non-rejected rows (~1.8s / ~0.6s). These counts reflect current statuses at the
  time of inspection, not historical status snapshots.

### Rollout notes

- Update `dbo.sp_ImportLicenceTurndownReport_pagination` and
  `dbo.sp_ImportLicenceTurndownHistory` from
  `StoredProcedureMigrations/sp_ImportLicenceTurndownReport.sql` before deploying
  the backend/frontend. The Apply Type procedure is unchanged. Running
  `deploy.bat` alone does not install these SQL changes.
- Updated both procedures in one transaction on production `TradeNetDB` using
  Windows authentication, then deployed the exact reviewed branch with
  `deploy.ps1 -NoGit`. The Apply Type procedure, source records, and permissions
  were not changed. Application-login EXECUTE permissions were verified.
- Rollback backup: `.deploy/pre-valid-remarks-deploy-20261031-115039/` contains
  the previous backend/frontend and `rollback-procedures.sql`. Uploaded images
  were excluded from the site backup. Live backend settings and frontend
  `web.config` hashes match their pre-deployment backups.
- Live checks passed: API health and public frontend HTTP 200; deployed API.dll,
  public frontend bundle `/assets/index-DUtLZXjn.js`, and share files match the
  built outputs. Both report routes return HTTP 401 without authentication.
  Authenticated production browser testing was not performed.
- Installed procedures executed successfully with the application SQL login.
  October 1-2 returned 12 oversea and zero border rows, all currently rejected
  with valid remarks. Positive samples from both families matched their history
  counts, latest dates, and remarks; approved-application histories were excluded.
- Deployment log: `.deploy/valid-remarks-deployment-20261031.log`; live SQL and
  site verification logs use the `valid-remarks-live-*-verification.log` names.
  Build completed with existing Node engine, dependency audit, and bundle-size
  warnings. No dependency changes were made.
- Historical cleared remarks cannot be recovered; counts now represent the
  remaining valid, recorded turndown events.
- The temporary browser-test server was stopped after verification. Existing
  unrelated README changes and generated graph artifacts remain uncommitted.

## `feature/import-licence-turndown-reports`

- Assignment date: 2026-10-29
- Base branch: `main`; base commit: `af518fa`.
- Backend/SQL commit: `eaa34ad`; frontend commit: `6096006`.
- Inline-history follow-up commit: `2969341`.
- Three-line remark preview follow-up commit: `b254124`.
- Main-table Turn Down Remark preview follow-up commit: `9628c62`.
- Status: Implemented and committed locally. The three new procedures were deployed
  to the configured `TradeNetDB` on 2026-10-29 with user approval. Local backend
  and frontend were stopped at the user's request; ports 8001 and 5173 were
  verified closed. Feature branch pushed and fast-forward merged into `main` at
  `b2ef610` on 2026-10-29. Both remote branch heads were verified at that commit
  after pushing `main`. Site commit `32d52c2` was subsequently deployed and
  verified on 2026-10-30 using `deploy.ps1 -NoGit`, with explicit user approval.
- Publication note: GitHub redirected the existing `origin` URL from
  `SakBran/tradenet-admin-report` to `Shwe-Digits/tradenet-admin-report` and accepted
  both pushes. The configured remote URL was preserved.

### Scope and verification

- Added Import Licence and Border Import Licence Turndown reports, with turndown
  date range, Import Section, Company Registration No, Company Name, and database
  Apply Type filters. Existing family access permissions cover both routes.
- Applications qualify when a history event falls within the selected dates.
  The displayed latest event and clickable count use complete history, including
  events outside that range. Clicking the count expands dated remarks beneath
  the selected row; clicking again collapses them. Retry and loading states are
  shown inline. Identifiable `Re Open` events are excluded throughout.
- Added three procedures in
  `StoredProcedureMigrations/sp_ImportLicenceTurndownReport.sql`: paginated report,
  application history, and Apply Type options. Grid and queued Excel use the same
  procedure and filters, with database sorting, searching, and paging.
- Focused backend checks passed: 7 new SQL/validation tests and 18 existing Excel
  registration, row-type, layout, and access tests. SQL tests used disposable
  LocalDB databases, without altering the configured application database.
- Focused frontend checks passed: 1,547 tests covering menu access and Excel
  presentation. Frontend production build passed with the existing bundle-size
  warning.
- Both Playwright browser tests passed against mocked API responses, covering
  database-provided Apply Types, history errors/retry, full history, missing
  remarks, and Excel submission. Used temporary Node 22.17.0 and installed Chrome
  (`E2E_BROWSER_CHANNEL=chrome`); system Node 18.17.1 cannot load Playwright's ESM
  configuration.
- Inline-history follow-up: replaced the modal with an expanded table row on
  both reports. The two updated browser tests passed, checking row adjacency,
  absence of a dialog, loading failure/retry, history contents, collapse, and
  Excel submission. Eight focused shared-table/presentation tests, TypeScript
  checking, and the frontend production build also passed. No backend or
  database change was needed for this follow-up.
- Long-remark follow-up: history remarks wrap and show at most three lines, with
  inline `Show more` / `Show less` controls only when text overflows. The original
  API and Excel text is unchanged. Both updated browser tests passed, measuring
  the collapsed height and checking expansion, full text, collapse, and missing
  remarks on both report families. The frontend production build also passed
  with the existing bundle-size warning.
- Main-table remark follow-up: applied the same three-line preview to the
  `Turn Down Remark` column, using one shared renderer for main and history
  remarks. Both browser tests passed with long main-row messages, verifying
  preview height, full-text expansion, collapse, and the existing history flow.
  API, stored procedures, and Excel text were unchanged. The frontend production
  build passed with the existing bundle-size warning.
- Executed the report procedure body read-only against the configured database
  for 2026-10-28: 402 oversea applications (~1.9 seconds) and 10 border applications
  (~0.5 seconds). Each first-page result had the expected 19 API fields. This
  check used temporary tables and did not deploy procedures or change source data.

### Deployment and data notes

- Site deployment on 2026-10-30: stopped local servers and verified ports 5173
  and 8001 closed, confirmed `main` matched `origin/main`, then deployed commit
  `32d52c2` to `M:\T20-ADMIN-REPORT-BACKEND` and
  `M:\T20-ADMIN-REPORT-FRONTEND` using `deploy.ps1 -NoGit`.
- Rollback backup: `.deploy/pre-turndown-deploy-20261030-101023`, with separate
  backend and frontend folders. Backend backup excludes user-uploaded images.
  Deployment transcript: `.deploy/turndown-deployment-20261030.log`.
- Backend Release build and publish passed (existing compiler warnings, zero
  errors). Backend and frontend copy operations returned Robocopy code 3
  (success). The script restored the backend online and reported
  `DEPLOY OK - health check returned 200.` No app-pool fallback was required.
- Verified live backend `API.dll` SHA-256 matches the publish output and reports
  product version `1.0.0+32d52c2`. Existing `appsettings.json` SHA-256 remained
  unchanged; `app_offline.htm` was absent after deployment. All three procedures
  remained installed and executable by the live application database login.
- Verified `https://reportapi.myanmartradenet.com/health` and
  `https://report.myanmartradenet.com/` returned HTTP 200. Both new report POST
  endpoints returned HTTP 401 without credentials, confirming protected routes.
  No authenticated production session was used for these endpoint checks.
- Public frontend index references `/assets/index-BI4BVRGT.js`. Both deployed
  frontend files and the publicly downloaded bundle match the local production
  build by SHA-256. Bundle contains both report routes, remark previews, and the
  production API URL. Local servers remain stopped.
- Frontend dependency installation left the package lock unchanged. It reported
  existing Node engine warnings and 44 dependency audit findings (4 low,
  13 moderate, 21 high, 6 critical). These findings were not triaged or fixed in
  this deployment. Frontend production build passed with its existing large
  bundle warning; no dependencies were changed as part of the assignment.
- The three new procedures from the SQL file were deployed on 2026-10-29 using
  Windows Authentication after explicit user approval. The application SQL login
  lacked `CREATE PROCEDURE`, and that initial transaction rolled back without
  changes. Windows Authentication had the required permissions. Deployment used
  `CREATE PROCEDURE` after verifying all three names were absent, preventing
  replacement of existing procedures. No existing tables, data, or procedures
  were changed, and no extra permissions needed to be granted.
- Executed all three installed procedures through the application's SQL login.
  For 2026-10-28, oversea returned 402 applications (~633 ms) and border returned
  10 (~304 ms). Sample report counts matched the full-history results: 2 oversea
  events and 4 border events. Both Apply Type lookups returned all five stored
  types. The application login has EXECUTE permission on all three procedures.
- Local frontend: `http://localhost:5173`; local API:
  `http://localhost:8001` (health checks returned HTTP 200). Runtime-only settings
  use the separate LocalDB database `TradeNet_Report_LocalTest_20261029_Turndown`
  for login tokens, test exports, and activity logs; report queries use the
  configured shared `TradeNetDB`. No site deployment was performed during that
  local-testing setup; the later site deployment is recorded above.
- Legacy code clears history remarks after checking. Missing remarks display as
  `Remark unavailable`; original text cannot be recovered from these rows.
  Cleared reopen remarks also prevent exact historical event classification, so
  old counts can include reopen events that are no longer identifiable.
- Existing unrelated `Frontend/README.md` changes were preserved and excluded
  from assignment commits. Local `.project-graph` artifacts remain untracked.

## `feature/report-user-oga-recommendation`

- Assignment date: 2026-10-19
- Base branch: `main`; base commit: `0036894`
- Feature commit: `32ab430` (`feat: allow report users to open OGA recommendation reports`)
- Status: Fast-forward merged into `main` without conflicts on 2026-10-19.
  `main` was pushed to `origin/main`, and site commit `5269bd5` was deployed
  via `deploy.ps1 -NoGit` on 2026-10-19.

### Scope and verification

- Active users with the `Report` user type now receive the existing
  `report-oga-recommendation` category without a `UserDetail` assignment.
  This opens both OGA Recommendation report pages, their APIs, and their Excel
  exports. Other user types keep their existing access rules.
- Limited the backend category mapping to `OGARecommendationReport` and
  `OGARecommendationHistoryReport`, so future similarly named controllers do
  not receive this grant automatically.
- This grants access to OGA report data, not only the menu. The list defaults
  to all OGA departments; the history report accepts a reference number.
  No database migration, stored procedure, user record, or production config
  was changed.
- The new backend access tests failed before the change and passed afterward.
  Focused backend tests: 9 passed. Frontend menu tests: 15 passed. Backend
  Release and frontend production builds passed; the frontend build retained
  its existing large-chunk warning. No authenticated login was tested.
- Deployed backend DLL, frontend index, and active bundle hashes match the
  build. Backend version is `1.0.0+5269bd5`. Public API health and frontend
  returned HTTP 200; unauthenticated permissions returned HTTP 401. The old
  all-report grant setting is absent and `app_offline.htm` is absent.
- Previous site files are backed up under
  `.deploy/pre-deploy-20261019-report-user-oga`, excluding environment config.
  The dependency audit reported 67 pre-existing advisories (5 critical,
  44 high); no dependencies changed. Node engine warnings remain.
- A signed-in Report-user menu/API/Excel walkthrough remains outstanding.

## `revert/report-user-all-reports-grant`

- Assignment date: 2026-10-13
- Base branch: `main`; base commit: `a365c7d`
- Revert commit: `ff8b7dd` (`revert: remove report-wide user grant`)
- Status: Fast-forward merged into `main` without conflicts, pushed to
  `origin/main`, and deployed from commit `ff8b7dd` on 2026-10-13.

### Scope and verification

- Reverted the report-wide permission for configured Report users. The report
  policy, API permissions response, sidebar menu, and related tests now match
  their pre-grant code. Other role-scoped report access remains in place.
- Removed `ReportAccess.ViewAllReportUserIds` from the production backend config;
  the only configured value had been database user ID `1503`. No database role,
  migration, stored procedure, or user record was changed.
- Focused backend tests: 7 passed. Frontend menu tests: 14 passed. Backend and
  frontend production builds passed. The frontend install reported Node engine
  compatibility warnings; dependencies were not changed by this revert.
- Deployed backend DLL, frontend index, and active bundle hashes match the
  build. The active bundle has no `canViewAllReports` flag, the server config
  has no grant setting, and `app_offline.htm` is absent. Public API health and
  frontend returned HTTP 200; unauthenticated permissions returned HTTP 401.
  No authenticated production-account menu walkthrough was performed.
- Previous site code is backed up in
  `.deploy/pre-deploy-20261013-report-grant-revert` (environment config excluded).
  Previous production config is backed up outside the repository under the
  operator's local profile.

## `feature/report-user-all-reports-grant`

- Assignment date: 2026-10-09
- Base branch: `main`
- Base commit: `fcfcc83`
- Feature commit: `c4bd9bf` (`feat: grant configured report users view-all report access`)
- Status: Fast-forward merged into local `main` on 2026-10-09 with no conflicts.
  Pushed to `origin/main` and deployed site commit `3e968f5` on 2026-10-09.
  Subsequently reverted, removed from production config, and redeployed on
  2026-10-13 by `revert/report-user-all-reports-grant` (`ff8b7dd`).

### Scope and verification

- Verified `knyeinthu_Rpt` has TradeNet `dbo.Users.Id = 1503` (the Users-list
  row number 433 is not the database ID). Kept the user type as `Report`.
- Added an opt-in, report-only view-all permission for configured, active
  `Report` users. Other roles and unconfigured users keep their existing
  assigned-family limits. Data Import, Activity Log, and other users' exports
  remain restricted. No database migration or stored procedure change.
- Focused backend tests: 18 passed. Frontend report-menu tests: 15 passed.
  Frontend production build passed with its existing large-chunk warning.
  `git diff --cached --check` passed. Three unrelated deployment-folder tests
  still fail because they expect dated folders directly below `Deployments`.
- Deployment completed via `deploy.ps1 -NoGit`. Published backend DLL and
  frontend index/bundle hashes matched the deployed files. API health and
  frontend returned HTTP 200; unauthenticated permissions returned HTTP 401.
  The config grant was present and `app_offline.htm` absent after deployment.
  No authenticated production-account/browser verification was performed.
- `npm install` reported 67 dependency advisories (5 critical, 44 high).
  No dependency changes were made for this assignment.
- The original activation and rollback guide was removed by the revert.
  The deployment script preserves server `appsettings*.json`; the setting was
  originally added separately. Pre-deploy code is in
  `.deploy/pre-deploy-20261009-report-grant`; the previous config is backed up
  outside the repository under the operator's local profile.

## `feature/role-scoped-report-menus`

- Assignment date: 2026-10-05
- Base branch: `feature/all-pending-reports-licence-date`
- Base commit: `9de75d7`
- Feature commit: `67401fe` (`feat: scope report menus and APIs by user assignment`)
- Status: Completed and fast-forward merged into local `main` on 2026-10-08
  through branch tip `f12101e` (no conflicts). The feature branch is present
  on `origin` at that tip; `main` was pushed to `origin/main` on 2026-10-08
  and site commit `5ef1de9` was deployed on 2026-10-08. No database object
  or data was changed for this assignment.

### Scope completed

- Resolve the current login user's active TradeNet account and `UserDetail`
  `Type`/`SubType` assignments. Super Administrator sees all reports; Report,
  Check User, and Approve User see only assigned report families. Account User
  retains Payment reports; other roles receive no general report access.
- Apply the same family policy to the sidebar, direct report routes, and all
  report controller APIs (including Excel requests). Advance Search follows
  the assigned application families. Data Import and Activity Log are admin-only.
- Keep Home and Logout available to signed-in users. Non-admin Home no longer
  renders the unrestricted eight-family report summary.
- Show non-admin users only their own saved exports for currently permitted
  reports; prevent cross-user reuse of queued/completed export jobs. Admins can
  see every export.
- Authorization uses current database assignments on each request. It does
  not filter report rows by `UserDetail.Section`; that was outside this
  menu-family assignment and needs a separate data-scope decision if required.

### Verification completed

- Focused backend policy/export tests: 7 passed. An ownership-check mutation
  caused the expected test failure, then was restored and the suite passed.
- Frontend report-menu tests: 14 passed.
- Frontend production build passed with the pre-existing large-chunk warning.
- Backend build passed through the focused test run. `git diff --check` passed.
- Before the 2026-10-08 merge, focused backend checks passed 14/14 and
  frontend menu/New/Pending report checks passed 36/36.
- No live login-role or browser walkthrough was performed; verify with one
  Super Administrator and assigned/unassigned Report, Check, and Approve users
  after deployment.
- The deployed API DLL reports `1.0.0+5ef1de9`; the public frontend index and
  bundle match the built files. The API health endpoint returned 200 on eight
  public probes, and the unauthenticated permissions endpoint returned 401.

### Deployment note

This branch brought both parent feature assignments into local `main` as a
cumulative fast-forward merge. The backend and frontend were deployed through
`deploy.ps1 -NoGit` to `M:\T20-ADMIN-REPORT-BACKEND` and
`M:\T20-ADMIN-REPORT-FRONTEND`; no new stored procedure was needed for this
assignment. The previous site files were backed up under
`.deploy/pre-deploy-20261008-231057`, excluding environment configuration.
Database connections in this environment use Windows Authentication. A live
role-based login/browser walkthrough remains outstanding. Frontend installation
reported 67 dependency advisories (5 critical, 44 high) and Node engine
compatibility warnings; dependency remediation was not part of this deployment.

## `feature/all-pending-reports-licence-date`

- Assignment date: 2026-10-02
- Base branch: `feature/all-new-reports-licence-date`
- Base commit: `423adde`
- Feature commit: `08e681c` (`feat: add licence date to pending reports`)
- Status: Completed and committed locally on the feature branch. Its work was
  included in local `main` through the 2026-10-08 fast-forward of
  `feature/role-scoped-report-menus` at `f12101e`. The stored procedure was
  deployed to `tn2db\\PRODUCTION / TradeNetDB` on 2026-10-02 using Windows
  Authentication. Site commit `5ef1de9` was deployed on 2026-10-08; `main`
  was pushed to `origin/main` on 2026-10-08.

### Scope completed

- Confirmed there are four Pending report menus: Import Licence Pending Report,
  Border Import Licence Pending Report, and their two Detail Report (Pending)
  counterparts.
- Confirmed both Detail Report (Pending) menus already displayed `Licence Date`.
- Added `Licence Date` after `Application Date` to the two plain Pending report
  tables and Excel exports.
- Mapped the value to the nullable `IssuedDate` field for Import Licence, Export
  Licence, and Border Import Licence LINQ branches and for both stored-procedure
  branches.
- Incremented the two changed Excel export format versions to invalidate files
  cached with the old column layout.
- Added a database-first deployment package at
  `StoredProcedureMigrations/Deployments/Done For Fix/2026-10-02_PendingReportsLicenceDate`.

### Verification completed

- Focused Pending config tests: 6 passed.
- Focused backend behavior tests: 7 passed.
- Pending/Excel integration contract tests: 1,321 passed.
- Frontend production build passed (existing large-chunk warning only).
- Backend build passed with 0 errors.
- SQL Server parse-only validation passed against `TradeNetDB` using Windows
  Authentication; no database object or data was changed.
- Post-deployment definition and execution checks passed for both Import Licence
  and Border Import Licence procedure branches. All current Pending/Reject rows
  have a null `IssuedDate`, so their visible `Licence Date` cells are expected to
  be blank until an issued date exists.
- Repository-wide frontend tests: 1,849 passed and 7 unrelated parity tests failed.
- Repository-wide backend tests: 2,550 passed and 350 unrelated baseline tests
  failed, primarily because `TradeNetDBTest` or unrelated stored procedures are
  unavailable and because older config-source extractors do not parse the current
  configuration shape.

### Deployment note

Use Windows Authentication for database work. `dbo.sp_PendingReport_pagination`
has been deployed and verified, and its previous definition is preserved as
`RollbackCaptured.sql`. The site was deployed on 2026-10-08; verify all four
Pending menus in the grid and Excel. This branch is based on and includes the
`feature/all-new-reports-licence-date` work now present in local `main`.

## `feature/all-new-reports-licence-date`

- Assignment date: 2026-10-02
- Base commit: `0a6d8e6`
- Feature commit: `15b1632` (`feat: add licence date to all new reports`)
- Status: Completed and committed locally on the feature branch. Its work was
  included in local `main` through the 2026-10-08 fast-forward of
  `feature/role-scoped-report-menus` at `f12101e`. The database procedure was
  deployed to `tn2db\\PRODUCTION / TradeNetDB` on 2026-10-02 using Windows
  Authentication. Site commit `5ef1de9` was deployed on 2026-10-08; `main`
  was pushed to `origin/main` on 2026-10-08.

### Scope completed

- Defined **all application** as Import/Export/Border Import/Border Export, each
  covering both Licence and Permit (eight report families total).
- Added `Licence Date` immediately after `Licence No` in all eight New Report
  (New Report) tables and Excel exports.
- Mapped the visible value to each application table's `IssuedDate` field.
- Removed `Online No`, `Online Date`, and `Remark` from the visible Import Licence
  New Report table and Excel export, leaving only `Licence Date` from that field set.
- Kept the shared backend result fields for compatibility with the already deployed
  result shape.
- Added a database-first deployment package at
  `StoredProcedureMigrations/Deployments/Done For Fix/2026-10-02_AllNewReportsLicenceDate`.

### Verification completed

- Focused frontend and Excel fixture tests: 25 passed.
- Frontend production build passed (existing large-chunk warning only).
- SQL parse-only validation passed against `TradeNetDB` using Windows
  Authentication; no database object or data was changed.
- Post-deployment execution checks passed for all eight form types over the
  2018-2026 range: every result shape was complete and every sample row had a
  non-null `Licence Date`.
- Read-only schema validation confirmed `IssuedDate` exists on all eight target
  application tables.
- Static backend projection, deployment-bundle parity, and checksum checks passed.
- Installed the complete x64 .NET SDK `8.0.425`, pinned the repository to .NET 8
  with `global.json`, and successfully rebuilt the backend with that SDK.
- Focused backend tests passed: 18 passed, 0 failed.
- Frontend lint could not run because the repository uses ESLint 9 without an
  `eslint.config.js`/`.mjs`/`.cjs` configuration file.

### Deployment note

Use Windows Authentication for database work. `dbo.sp_NewReport_pagination` has
been deployed and verified. The pre-deployment definition is preserved as
`RollbackCaptured.sql` in the deployment package. The matching site deployment
was completed on 2026-10-08; verify the eight New Report menus in the grid
and Excel.

## `feature/import-pending-status-filters`

- Assignment date: 2026-09-30
- Recorded on main: 2026-10-02
- Base commit: `a813696`
- Feature commit: `aa8069a` (`feat: add filters to import pending reports`)
- Status: Completed and committed locally on the feature branch. Not merged into
  `main`, not pushed, and not deployed.

### Scope completed

- Updated both `ImportLicencePendingReport` and
  `BorderImportLicencePendingReport`.
- Added Company Registration No, readonly auto-populated Company Name, and Status
  filters while keeping the existing date and Import Section filters.
- Added these Status choices: All Application, Auto Cancel, Auto Cancel Feedback,
  Pending, Reject, and Payment Ready.
- Defined All Application as the five requested workflow states only; Approved and
  Archive are excluded.
- Applied the same filters to grid and queued Excel data paths.
- Updated the shared LINQ query and `dbo.sp_PendingReport_pagination` for company and
  status filtering.
- Appended the new optional stored-procedure parameters and changed the new backend
  call to named parameters, allowing a database-first rollout without breaking the
  old deployed backend.
- Added the deployment package at
  `StoredProcedureMigrations/Deployments/Done For Fix/2026-09-30_ImportPendingStatusFilters`.

### Verification completed

- Focused frontend tests: 3 passed.
- Focused backend tests: 13 passed.
- Frontend production build passed.
- SQL Server parse-only validation passed against `TradeNetDB` using Windows
  Authentication; no database object or data was changed.
- The repository-wide frontend/backend suites still contain unrelated pre-existing
  failures, including old report-config expectations and test databases missing
  unrelated stored procedures.

### Deployment note

Use Windows Authentication for database work. Deploy the stored procedure first,
verify it, and then deploy the site. The feature branch has not performed either
deployment step.
