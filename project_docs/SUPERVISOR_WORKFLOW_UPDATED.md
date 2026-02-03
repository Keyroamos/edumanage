# Supervisor Approval Workflow - Updated Implementation

## Changes Made

### 1. **Accurate Request Filtering**

The system now correctly filters requests so supervisors only see:
- ✅ Requests from their supervised staff
- ✅ Requests that are PENDING overall status
- ✅ Requests where supervisor hasn't acted yet (no supervisor approval record OR supervisor approval is PENDING)

### 2. **Request Counting**

Supervisor statistics now accurately count only requests that need their action:
- Excludes requests they've already approved
- Excludes requests they've already rejected
- Only shows truly pending items

### 3. **Workflow Logic**

#### **When Staff Submits Request:**
1. Request created with status='PENDING'
2. No approval records exist yet
3. Supervisor sees it in their pending list ✅

#### **When Supervisor Approves:**
1. LeaveApproval/AdvanceApproval record created with:
   - approval_level='SUPERVISOR'
   - status='APPROVED'
2. Request disappears from supervisor's pending list ✅
3. Request appears in HR Approvals (supervisor_status='APPROVED') ✅

#### **When Supervisor Rejects:**
1. LeaveApproval/AdvanceApproval record created with:
   - approval_level='SUPERVISOR'
   - status='REJECTED'
2. Main request status updated to 'REJECTED'
3. Request disappears from supervisor's pending list ✅
4. Request does NOT appear in HR Approvals ✅

#### **When HR Approves (after supervisor approval):**
1. LeaveApproval/AdvanceApproval record created with:
   - approval_level='HR'
   - status='APPROVED'
2. Main request status updated to 'APPROVED'
3. Process complete ✅

#### **When HR Rejects (after supervisor approval):**
1. LeaveApproval/AdvanceApproval record created with:
   - approval_level='HR'
   - status='REJECTED'
2. Main request status updated to 'REJECTED'
3. Process complete ✅

## API Endpoints Updated

### `GET /api/hr/supervisors/`
**Returns:** List of supervisors with accurate pending counts
**Filtering:** Only counts requests needing supervisor action

### `GET /api/hr/supervisors/<id>/pending-requests/`
**Returns:** Leave and advance requests pending supervisor approval
**Filtering:** 
- Requests from supervised staff
- Status='PENDING'
- No supervisor approval OR supervisor approval status='PENDING'

### `POST /api/hr/supervisors/leave-requests/<id>/approve/`
**Action:** Creates SUPERVISOR-level approval with status='APPROVED'
**Result:** Request moves to HR queue

### `POST /api/hr/supervisors/leave-requests/<id>/reject/`
**Action:** Creates SUPERVISOR-level approval with status='REJECTED'
**Result:** Request ends (status='REJECTED'), doesn't go to HR

### `POST /api/hr/supervisors/advance-requests/<id>/approve/`
**Action:** Creates SUPERVISOR-level approval with status='APPROVED'
**Result:** Request moves to HR queue

### `POST /api/hr/supervisors/advance-requests/<id>/reject/`
**Action:** Creates SUPERVISOR-level approval with status='REJECTED'
**Result:** Request ends (status='REJECTED'), doesn't go to HR

## Testing Checklist

### Scenario 1: New Request
- [ ] Staff submits leave request
- [ ] Supervisor sees it in pending list
- [ ] Count increases by 1
- [ ] HR does NOT see it yet

### Scenario 2: Supervisor Approves
- [ ] Supervisor clicks "Approve" on request
- [ ] Request disappears from supervisor's pending list
- [ ] Count decreases by 1
- [ ] HR now sees the request
- [ ] Request shows supervisor_status='APPROVED' in HR view

### Scenario 3: Supervisor Rejects
- [ ] Supervisor clicks "Reject" on request
- [ ] Request disappears from supervisor's pending list
- [ ] Count decreases by 1
- [ ] HR does NOT see the request
- [ ] Request status='REJECTED'

### Scenario 4: HR Final Approval
- [ ] HR sees supervisor-approved request
- [ ] HR clicks "Approve"
- [ ] Request status changes to 'APPROVED'
- [ ] Both supervisor and HR approvals recorded

### Scenario 5: HR Final Rejection
- [ ] HR sees supervisor-approved request
- [ ] HR clicks "Reject"
- [ ] Request status changes to 'REJECTED'
- [ ] Supervisor approval remains 'APPROVED'
- [ ] HR approval recorded as 'REJECTED'

### Scenario 6: Multiple Supervisors
- [ ] Supervisor A only sees requests from their team
- [ ] Supervisor B only sees requests from their team
- [ ] No cross-visibility

## Database State Examples

### New Request (Pending Supervisor)
```
Leave:
  id: 1
  employee_id: 5
  status: 'PENDING'
  
LeaveApproval: (none yet)
```

### Supervisor Approved (Pending HR)
```
Leave:
  id: 1
  employee_id: 5
  status: 'PENDING'
  
LeaveApproval:
  id: 1
  leave_id: 1
  approval_level: 'SUPERVISOR'
  status: 'APPROVED'
```

### Supervisor Rejected (Ended)
```
Leave:
  id: 1
  employee_id: 5
  status: 'REJECTED'
  
LeaveApproval:
  id: 1
  leave_id: 1
  approval_level: 'SUPERVISOR'
  status: 'REJECTED'
```

### Fully Approved (Completed)
```
Leave:
  id: 1
  employee_id: 5
  status: 'APPROVED'
  
LeaveApproval:
  id: 1
  leave_id: 1
  approval_level: 'SUPERVISOR'
  status: 'APPROVED'
  
  id: 2
  leave_id: 1
  approval_level: 'HR'
  status: 'APPROVED'
```

## Key Points

1. **Supervisor Independence**: Supervisors work in their own section, separate from HR
2. **Accurate Counts**: Only truly pending items are counted
3. **No Duplication**: Once supervisor acts, request leaves their queue
4. **HR Filtering**: HR only sees supervisor-approved items
5. **Audit Trail**: Both approval levels are tracked separately
6. **Clear Workflow**: Staff → Supervisor → HR (if approved)

---

**Status**: ✅ Fully Implemented and Accurate
**Date**: January 10, 2026
