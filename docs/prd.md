# Product Requirements Document (PRD) - One Staff Dashboard

## 1. Product Overview

One Staff Dashboard is an internal web application (panel) in MVP (Minimum Viable Product) version, designed to streamline basic operations in a temporary staffing agency. The product's goal is to replace existing manual processes based on spreadsheets by centralizing management of temporary worker data, clients, work locations, and schedules. The panel will enable coordinators to quickly assign workers to open positions, monitor their workload, and generate key reports on worked hours. The RWD (Responsive Web Design) architecture will provide a foundation for future development, including a potential PWA (Progressive Web App) application.

## 2. User Problem

Currently, coordinators and administrators in the agency rely on scattered spreadsheets and manual communication to manage worker schedules, availability, and client data. Such a system is inefficient, error-prone, and does not scale with the growing number of workers and assignments. The main problems to solve are:

* Lack of a central source of truth about worker data and their status (available, assigned).
* Significant time investment and risk of errors when manually creating and updating schedules.
* Difficulties in quickly finding available workers matching open requirements.
* Time-consuming and manual generation of worked hours reports for payroll and client billing.
* Lack of transparency and change history, making it difficult to verify settlements and audits.

Users need a single, integrated tool that will automate and simplify these processes, allowing them to focus on effectively matching workers to client needs.

## 3. Functional Requirements

### 3.1. User and Access Management

* System based on two roles: `Administrator` and `Agency Employee (Coordinator)`.
* Administrator manages Coordinator accounts.
* System login is done using username and password.

### 3.2. Master Data Management

* CRUD (Create, Read, Update, Delete) for Clients (managed by Administrator).
* CRUD for Work Locations, linked to Clients (managed by Administrator).
* CRUD for Temporary Workers with fields: First Name, Last Name, Phone Number.
* Ability to create "Open Positions" in the context of a Work Location.

### 3.3. Main Workflow: Assignment Management

* Ability to assign a worker to a position with a specified start date and time, and optional end date/time.
* System intentionally allows creating time-overlapping assignments for one worker.
* "End Work" function for active assignments, allowing to add an end date/time.
* "Cancel Assignment" function available only until the work starts within a given assignment.

### 3.4. Main Application View ("Board")

* Tabular list of all temporary workers.
* Columns: `Full Name`, `Assigned Work Locations`, `Work Hours`, `Total Hours`.
* Data sorting by all columns.
* Filtering workers by date and time availability, and text search.
* Expandable row for each worker, displaying details of their active assignments.

### 3.5. Reporting and History

* Dedicated view for generating worked hours reports within a given date range.
* Ability to export the generated report to CSV/Excel format.
* Immutable event log (audit log) recording all operations on assignments (who, what, when).

## 4. Product Scope Boundaries

The following functionalities are intentionally excluded from the MVP scope:

* No tools for automatic data migration from existing systems.
* Temporary workers do not have access (login) to the system.
* System does not send any automatic notifications (e.g., SMS, email).
* System does not block or warn against creating time-overlapping assignments. Responsibility for this lies with the Coordinator.
* No advanced analytical features beyond basic hours report.

## 5. User Stories

### ID: US-001

* Title: System Login
* Description: As a user (Administrator or Coordinator), I want to be able to securely log into the system to access the panel.
* Acceptance Criteria:
    1. System displays a login page with username and password fields.
    2. After entering correct credentials, user is redirected to the main application view ("Board").
    3. After entering incorrect credentials, system displays an error message.

### ID: US-002

* Title: Client Management by Administrator
* Description: As an Administrator, I want to manage the client list to maintain up-to-date data in the system.
* Acceptance Criteria:
    1. I can view the list of all clients.
    2. I can add a new client by providing their name.
    3. I can edit an existing client's name.
    4. I can delete a client (if there are no Work Locations associated with it).

### ID: US-003

* Title: Work Location Management by Administrator
* Description: As an Administrator, I want to manage Work Locations and assign them to clients so that Coordinators can create assignments in correct locations.
* Acceptance Criteria:
    1. I can add a new Work Location by providing `Facility Name`, `Address`, `Email`, `Phone`.
    2. Each Work Location must be assigned to an existing Client.
    3. I can edit data of an existing Work Location.

### ID: US-004

* Title: Temporary Worker Management
* Description: As a Coordinator, I want to quickly add and edit temporary worker data to maintain an up-to-date database.
* Acceptance Criteria:
    1. I can open a form for adding a new worker.
    2. The form requires providing `First Name`, `Last Name`, and `Phone Number`.
    3. After saving, the new worker appears on the main worker list.
    4. I can edit existing worker data.

### ID: US-005

* Title: Displaying and Filtering Worker List
* Description: As a Coordinator, I want to see a list of all workers on one screen and filter it to quickly find available people.
* Acceptance Criteria:
    1. The main view is a table with worker list.
    2. I can sort the list by clicking on column headers (`Full Name`, `Total Hours`).
    3. A date and time filter (`Available From`) is available, showing only workers without assignments at a given moment.
    4. A search field is available, filtering the list by entering part of name, surname, or phone number.

### ID: US-006

* Title: Creating and Assigning Worker to Position
* Description: As a Coordinator, I want to create an "Open Position" at a given Work Location, and then assign a worker to it.
* Acceptance Criteria:
    1. I can create a position (simple text field) in the context of a selected Work Location.
    2. From the worker list, I can initiate the "Assign" action.
    3. In the assignment form, I select Work Location, Position, and provide `start date and time`.
    4. Optionally, I can provide `end date and time`.
    5. After saving, the assignment is visible in the expanded row of the given worker.

### ID: US-007

* Title: Assignment Details View
* Description: As a Coordinator, I want to see details of all assignments for a given worker to have a complete picture of their schedule.
* Acceptance Criteria:
    1. On the worker list, clicking on a row expands it, showing the list of assignments.
    2. Each assignment on the list shows Work Location, Position, and work hours in `HH:MM - HH:MM` format.
    3. The `Total Hours` column in the main row shows the sum of duration of all assignments.

### ID: US-008

* Title: Ending Active Assignment
* Description: As a Coordinator, I want to be able to end an active work assignment when a worker has actually finished it.
* Acceptance Criteria:
    1. For each assignment without an end date, an "End Work" action is visible.
    2. After clicking it, a modal window appears for entering the end date and time.
    3. After saving, the assignment is updated with the end date.

### ID: US-009

* Title: Canceling Erroneous Assignment
* Description: As a Coordinator, I want to be able to cancel an erroneously created assignment before it starts.
* Acceptance Criteria:
    1. For each assignment, a "Cancel Assignment" action is visible.
    2. The action is active only when the system time is earlier than the assignment's start date and time.
    3. After clicking the action and confirming, the assignment is permanently deleted.
    4. The cancellation operation is recorded in the event log.

### ID: US-010

* Title: Generating and Exporting Hours Report
* Description: As a Coordinator, I want to generate a worked hours report for a selected period and client, and then export it to a file for further processing.
* Acceptance Criteria:
    1. In a dedicated "Reports" section, I can select a date range.
    2. After confirmation, the system generates a table with a summary of worked hours broken down by workers and work locations.
    3. On the report page, there is an "Export to CSV/Excel" button.
    4. Clicking the button downloads a file containing data from the generated report.

## 6. Success Metrics

* Main Business Goal: Streamlining and accelerating the process of matching workers to open positions.
* Key Success Indicator (KPI 1): Reducing the average time from creating an "Open Position" to assigning a worker by 30% within the first 3 months of implementation.
* Key Success Indicator (KPI 2): Centralizing 100% of worker data and their schedules in the system, measured by completely eliminating the use of external spreadsheets for work planning within 3 months.
* Adoption Indicator: Active use of the panel by 90% of agency employees (target users) within the first month of implementation.
