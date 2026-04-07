# Idea Submission Template

**Submitted by**: Ruslan Horyn
**Date**: 2026-01-29
**Contact**: <ruslan.horyn@nexlylab.com>

---

## 1. Idea Title

One Staff Dashboard

---

## 2. Problem Statement

Coordinators and administrators in temporary staffing agencies rely on scattered spreadsheets and manual communication (email/Excel) to manage worker schedules, availability, and client data. This system is inefficient, error-prone, and does not scale with growing numbers of workers and assignments.

Key problems include:

- No central source of truth for worker data and status
- Time-consuming manual scheduling with high error risk
- Difficulty quickly finding available workers for open positions
- Manual generation of worked hours reports for payroll and billing
- Lack of transparency and change history for audits and verification

---

## 3. Target Users

Coordinators and administrators at temporary staffing agencies, including:

- Cleaning services agencies
- Gastronomy/hospitality staffing
- Medical facility staffing (working with subcontractors)
- Other temp worker agencies

Typical agency size: 50-150+ workers, often managed by 1-2 coordinators. These agencies currently rely on Excel and email for all worker management.

---

## 4. Proposed Solution

A SaaS web application (panel) that centralizes management of temporary worker data, clients, work locations, and schedules. The MVP includes:

- Worker database with status tracking (available/assigned)
- Client and work location management
- Scheduling board with filtering and sorting
- Assignment management (create, end, cancel)
- Hours reporting with CSV/Excel export
- Audit log for all operations
- Multi-tenant architecture for multiple agencies

The system replaces manual spreadsheet processes and provides a single source of truth for all staffing operations.

---

## 5. Why Now?

Based on personal experience working at a staffing agency and conversations with industry contacts, this problem is widespread. Many agencies still rely on Excel because existing solutions are either unknown, too expensive, or don't fit their workflow. Excel is free and flexible but hits its limits when tracking workers, schedules, and hours at scale. There's a clear gap for an affordable, focused tool built specifically for this use case.

---

## 6. Similar Solutions

**Competitors/Alternatives**:

1. **Zoho Workerly** (~$45/month) - End-to-end temp lifecycle management with scheduling, timesheets, and invoicing. Full-featured but may be overly complex for small agencies focused on basic scheduling.

2. **Workstaff** - Workforce management for flexible/temp staff with shift publishing and availability tracking. Event-focused, may not fit daily staffing agency workflows.

3. **Shiftboard** - Enterprise staffing scheduling with rules-based auto-assignment. Designed for large organizations; likely overkill and expensive for 50-150 worker agencies.

4. **NextCrew** - Full spectrum platform covering CRM, recruitment, onboarding, timesheets, payroll, and billing. Comprehensive but complex; targets larger operations.

5. **Liveforce** - End-to-end platform for event and temporary staffing. Strong in events/hospitality but heavy on features small agencies don't need.

6. **Connecteam** (~$29/month for 30 users) - General employee scheduling with HR and communication tools. Not staffing-agency specific; lacks client/assignment management.

7. **Excel/Google Sheets** - The actual current solution for most small agencies. Free and flexible but breaks down at scale, no audit trail, error-prone.

**How This Is Different**:

- **Simplicity-first**: Built specifically for coordinators at 50-150 worker agencies, not enterprise HR departments. Only the features they actually need daily.
- **Affordable for small agencies**: Pricing from ~50 PLN/month vs $45-200+ USD for competitors.
- **Polish market focus**: Localized for Central European staffing workflows, Polish language, local payment methods.
- **Purpose-built for temp staffing**: Client management + worker database + scheduling + hours reporting in one focused tool. Not a generic scheduling app or full recruitment suite.
- **Replaces Excel, not everything**: Targets agencies currently on spreadsheets who need a step up, not enterprises needing advanced automation.

---

## 7. Success Indicators

1. **30% reduction** in average time from creating an open position to assigning a worker (within 3 months of implementation)
2. **100% data centralization** — complete elimination of external spreadsheets for work planning within 3 months
3. **90% user adoption** — active use by target users within the first month of implementation

---

## 8. Rough Effort Estimate

- [ ] **Small** (1-2 people, 1-2 months)
- [x] **Medium** (2-4 people, 2-4 months)
- [ ] **Large** (4+ people, 4+ months)

**Additional Notes on Complexity**:
MVP includes multi-tenancy, user authentication with roles (Admin/Coordinator), CRUD for multiple entities, scheduling board with filtering, and reporting with export. Tech stack defined: Next.js 16, React 19, Supabase, Tailwind CSS, deployed on Cloudflare Pages.

---

## 9. Business Model

- [x] Subscription (SaaS)
- [ ] One-time purchase
- [x] Freemium (free + paid features)
- [ ] Advertising
- [ ] Marketplace (take commission)
- [ ] Other
- [ ] Not sure yet / Strategic project

**Your Thoughts**:

- Free trial period to test the application
- Tiered subscription based on agency size:
  - Small agencies: ~50 PLN/month
  - Large agencies: ~100 PLN/month
  - Very large agencies: ~200 PLN/month
- Annual subscription discount: one month free
- Exact tiers to be refined after market research on typical agency sizes

---

## 10. Research Done

- [x] Talked to potential users (how many: 2+)
- [ ] Researched competitors
- [ ] Found market data
- [ ] Created mockups or prototype
- [x] Tested the problem with a manual solution

**Summary of Findings**:

- Personal experience working at a cleaning staffing agency (~150 workers) — saw firsthand the challenges of tracking attendance, verifying hours, finding workers for vacancies
- Friend owns a gastronomy agency (~50 workers, solo manager) — confirms the pain points
- Friend manages a medical facility working with multiple subcontractors — all worker tracking done via email/Excel, very manual process
- Additional pain points identified for future features: document/permit tracking (visas, work authorization expiry), training records

---

## 11. Your Involvement

- [x] Yes, I want to lead this project
- [ ] Yes, I want to contribute (part-time)
- [ ] Happy to advise but can't commit time
- [ ] Just sharing the idea

**Your Skills/Background Relevant to This**:
Direct experience working in a staffing agency, understands the workflow and pain points firsthand. Industry contacts for validation and early feedback.

---

## 12. Additional Context

- Detailed PRD already created: see `prd.md` in repository root
- Tech stack defined: see `tech-stack.md` in repository root
- 14 user stories documented covering full MVP workflow
- Future feature ideas: worker document management (visa/permit expiry tracking), training records, notifications

---

## For Reviewers (Do not fill out)

**Initial Review Date**: ___________
**Reviewed By**: ___________
**Decision**:

- [ ] Move to Evaluation
- [ ] Needs Revision
- [ ] Archive

**Feedback**:
[Reviewer comments]
