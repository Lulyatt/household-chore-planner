# Shared Household Chores Tool — MVP Scope

## 1. Purpose

Build a tool that helps a household (housemates, couples, or families) organise shared chores, manage recurring tasks, and understand how chores are distributed over time.

## 2. Household Access

- Everyone uses one shared household account.
- Household members are identified within that account.
- Users can manage household members.

## 3. Chore Management

Users can:
- Create custom chores from scratch.
- Choose suggested chore templates and configure them.
- Assign chores manually.
- Leave chores unassigned so another member can claim them.
- Set recurring schedules for chores.

A chore should support the relevant details needed to manage it, such as its title, description, schedule or due date, and assignee.

## 4. Assignment Options

The tool supports three assignment approaches:

- **Manual assignment:** a member chooses who is responsible for a chore.
- **Automatic rotation:** recurring chores rotate between household members.
- **Claiming chores:** members can claim unassigned chores only. They cannot directly take over chores assigned to someone else.

Rotation rules should be customisable.

## 5. Recurring and Overdue Chores

- Recurring chores are generated according to their schedule, with assignments managed through the selected rotation rules.
- Overdue chores remain overdue until completed.
- Missed recurring occurrences should remain distinguishable in the chore history rather than silently disappearing when the next occurrence is generated.

## 6. Completing Chores

- Completing a chore requires proof in the form of a note or photo.
- The tool records completed chores so household contributions can be tracked over time.

## 7. Main Dashboard

The main screen combines:
- Today's priorities, including due and overdue chores.
- Upcoming chores.
- A household contribution summary.

## 8. Contribution Tracking

- Track the number of chores each household member completes over time.
- Keep the initial contribution summary simple; weighted points and effort scoring are out of scope for the MVP.

## 9. MVP Feature Checklist

- [ ] Shared household account
- [ ] Add and manage household members
- [ ] Dashboard showing today's priorities, upcoming chores, and contribution summary
- [ ] Create custom chores
- [ ] Suggested chore templates
- [ ] Manual chore assignment
- [ ] Automatic rotation for recurring chores
- [ ] Customisable rotation rules
- [ ] Claim unassigned chores
- [ ] Recurring chore schedules
- [ ] Keep overdue chores visible until completed
- [ ] Require a note or photo when completing a chore
- [ ] Track completed chores and contributions over time

## 10. Explicitly Out of Scope for the MVP

To keep the first version manageable, do not include these unless the scope changes later:

- Notifications and reminders
- Points or gamification
- Weighted contribution scoring
- Approval from another household member before a chore counts as complete
- Claiming or taking over chores already assigned to someone else
- Advanced analytics

## 11. Core User Flow

1. A household member opens the shared household account.
2. They view today's priorities, upcoming chores, and the contribution summary.
3. They create a chore from a template or from scratch.
4. They assign it manually, set it to rotate as a recurring chore, or leave it unassigned for someone to claim.
5. A household member completes the chore and provides a note or photo as proof.
6. The chore is marked complete and contributes to the household's completion history and contribution summary.
7. Overdue chores remain visible until completed.

## 12. Scope Principles

- Prioritise a clear, usable core workflow over a large number of features.
- Keep assignment and rotation behaviour predictable.
- Make it easy to see who is responsible for each chore.
- Track contributions without implying that chore count alone perfectly measures effort or fairness.
