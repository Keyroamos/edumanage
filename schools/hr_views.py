# HR Module Views
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.db.models import Q
import json

from .models import (
    NonTeachingStaff, Employee, Leave, SalaryAdvance,
    LeaveApproval, AdvanceApproval, StaffDocument, Teacher, Expense
)


# ============================================
# STAFF MANAGEMENT VIEWS
# ============================================

@csrf_exempt
@require_http_methods(["GET"])
def api_hr_staff_list(request):
    """Get all staff members for the current school"""
    try:
        from config.models import SchoolConfig
        school = SchoolConfig.get_config(user=request.user, request=request)
        
        staff = NonTeachingStaff.objects.filter(school=school).select_related('supervisor')
        teachers = Teacher.objects.filter(school=school)
        
        staff_data = []
        for s in staff:
            staff_data.append({
                'id': s.id,
                'is_teacher': False,
                'first_name': s.first_name,
                'last_name': s.last_name,
                'email': s.email,
                'phone': s.phone,
                'national_id': s.national_id,
                'staff_type': s.staff_type,
                'staff_type_display': s.get_staff_type_display(),
                'position': s.position,
                'basic_salary': float(s.basic_salary),
                'status': s.status,
                'date_joined': s.date_joined.strftime('%Y-%m-%d'),
                'supervisor_name': s.supervisor.get_full_name() if s.supervisor else None,
                'job_description': s.job_description,
            })

        for t in teachers:
            staff_data.append({
                'id': t.id,
                'is_teacher': True,
                'first_name': t.first_name,
                'last_name': t.last_name,
                'email': t.email,
                'phone': t.phone,
                'national_id': t.national_id,
                'staff_type': 'TEACHER',
                'staff_type_display': 'Teaching Staff',
                'position': t.position,
                'basic_salary': float(t.basic_salary),
                'status': t.status,
                'date_joined': t.date_joined.strftime('%Y-%m-%d'),
                'supervisor_name': None,
                'job_description': 'Teaching',
            })
            
        # Add Drivers
        try:
            from transport.models import TransportDriver
            drivers = TransportDriver.objects.filter(school=school)
            for d in drivers:
                staff_data.append({
                    'id': d.id,
                    'is_teacher': False,
                    'is_driver': True,
                    'first_name': d.first_name,
                    'last_name': d.last_name,
                    'email': d.user.email if d.user else '',
                    'phone': d.phone_number,
                    'national_id': d.license_number, # Using license as ID proxy
                    'staff_type': 'DRIVER',
                    'staff_type_display': 'Driver',
                    'position': 'Driver',
                    'basic_salary': 0.0, # Drivers might not have basic_salary in this model yet
                    'status': d.status,
                    'date_joined': d.joined_at.strftime('%Y-%m-%d'),
                    'supervisor_name': None,
                    'job_description': f"Driver - License: {d.license_number}",
                })
        except ImportError:
            pass # Transport module might not be installed or configured
        except Exception as e:
            # logging the error but continuing to return other staff
            print(f"Error fetching drivers: {e}") 

        return JsonResponse({'staff': staff_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET"])
def api_hr_staff_detail(request, pk):
    """Get staff member details"""
    try:
        staff = get_object_or_404(NonTeachingStaff, pk=pk)
        
        # Get salary info from finance app if available
        basic_salary = float(staff.basic_salary or 0)
        net_salary = basic_salary
        allowances = 0
        deductions = 0
        nssf = 0
        loans = 0

        if staff.user:
            try:
                from finance.models import SalaryStructure
                ss, _ = SalaryStructure.objects.get_or_create(user=staff.user)
                basic_salary = float(ss.base_salary)
                allowances = float(ss.allowances)
                deductions = float(ss.deductions)
                nssf = float(ss.nssf)
                loans = float(ss.loans)
                net_salary = float(ss.net_salary())
            except Exception as e:
                print(f"Error fetching salary structure: {e}")

        data = {
            'id': staff.id,
            'personal': {
                'first_name': staff.first_name,
                'last_name': staff.last_name,
                'full_name': staff.get_full_name(),
                'email': staff.email,
                'phone': staff.phone,
                'national_id': staff.national_id,
                'date_of_birth': staff.date_of_birth.strftime('%Y-%m-%d') if staff.date_of_birth else None,
                'gender': staff.gender,
                'address': staff.address,
                'nationality': staff.nationality,
                'marital_status': staff.marital_status,
                'religion': staff.religion,
            },
            'professional': {
                'staff_type': staff.staff_type,
                'staff_type_display': staff.get_staff_type_display(),
                'position': staff.position,
                'date_joined': staff.date_joined.strftime('%Y-%m-%d'),
                'status': staff.status,
                'job_description': staff.job_description,
                'supervisor_name': staff.supervisor.get_full_name() if staff.supervisor else None,
                'supervisor_id': staff.supervisor.id if staff.supervisor else None,
            },
            'financial': {
                'basic_salary': basic_salary,
                'allowances': allowances,
                'deductions': deductions,
                'nssf': nssf,
                'loans': loans,
                'net_salary': net_salary,
            },
            'emergency': {
                'contact_name': staff.emergency_contact_name,
                'contact_phone': staff.emergency_contact_phone,
            },
            'leaves': [{
                'type': l.get_leave_type_display(),
                'start_date': l.start_date.strftime('%Y-%m-%d'),
                'end_date': l.end_date.strftime('%Y-%m-%d'),
                'status': l.status,
                'reason': l.reason
            } for l in staff.leaves.all().order_by('-start_date')[:5]],
            'advances': [{
                'amount': float(a.amount),
                'date': a.date_requested.strftime('%Y-%m-%d'),
                'status': a.status,
                'reason': a.reason
            } for l in staff.salary_advances.all().order_by('-date_requested')[:5]],
        }
        
        return JsonResponse({'staff': data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_hr_staff_create(request):
    """Create new staff member"""
    try:
        from config.models import SchoolConfig
        school = SchoolConfig.get_config(user=request.user, request=request)
        
        data = json.loads(request.body)
        
        # Get supervisor if provided
        supervisor = None
        if data.get('supervisor_id'):
            supervisor = Employee.objects.get(pk=data['supervisor_id'])
        
        staff = NonTeachingStaff.objects.create(
            school=school, # Associate with school
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            phone=data['phone'],
            national_id=data['national_id'],
            staff_type=data.get('staff_type', 'SUPPORT'),
            position=data.get('position', 'Staff'),
            date_of_birth=data.get('date_of_birth'),
            date_joined=data.get('date_joined', timezone.now().date()),
            address=data.get('address', ''),
            basic_salary=data.get('basic_salary', 0),
            status=data.get('status', 'ACTIVE'),
            gender=data.get('gender', 'M'),
            religion=data.get('religion', 'CHRISTIAN'),
            marital_status=data.get('marital_status', 'SINGLE'),
            nationality=data.get('nationality', 'Kenyan'),
            job_description=data.get('job_description', ''),
            supervisor=supervisor,
            emergency_contact_name=data.get('emergency_contact_name', ''),
            emergency_contact_phone=data.get('emergency_contact_phone', ''),
        )
        
        # Auto-create user account
        from .user_utils import create_staff_user
        create_staff_user(staff, school)
        
        return JsonResponse({
            'success': True,
            'message': 'Staff member created successfully',
            'staff_id': staff.id
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST", "PUT"])
def api_hr_staff_update(request, pk):
    """Update staff member"""
    try:
        staff = get_object_or_404(NonTeachingStaff, pk=pk)
        data = json.loads(request.body)
        
        # Update fields
        for field in ['first_name', 'last_name', 'email', 'phone', 'address', 
                      'basic_salary', 'status', 'staff_type', 'position',
                      'job_description', 'emergency_contact_name', 'emergency_contact_phone']:
            if field in data:
                setattr(staff, field, data[field])
        
        if 'supervisor_id' in data:
            staff.supervisor = Employee.objects.get(pk=data['supervisor_id']) if data['supervisor_id'] else None
        
        staff.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Staff member updated successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["DELETE"])
def api_hr_staff_delete(request, pk):
    """Delete staff member"""
    try:
        staff = get_object_or_404(NonTeachingStaff, pk=pk)
        staff.delete()
        return JsonResponse({'success': True, 'message': 'Staff member deleted successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# ============================================
# LEAVE REQUEST VIEWS
# ============================================

@csrf_exempt
@require_http_methods(["GET"])
def api_hr_leave_requests(request):
    """Get all leave requests for the current school"""
    try:
        from config.models import SchoolConfig
        school = SchoolConfig.get_config(user=request.user, request=request)
        
        leaves = Leave.objects.filter(school=school).select_related('employee').prefetch_related('approvals')
        
        requests_data = []
        for leave in leaves:
            # Get approval statuses
            supervisor_approval = leave.approvals.filter(approval_level='SUPERVISOR').first()
            hr_approval = leave.approvals.filter(approval_level='HR').first()
            
            requests_data.append({
                'id': leave.id,
                'employee_id': leave.employee.id,
                'employee_name': leave.employee.get_full_name(),
                'leave_type': leave.leave_type,
                'leave_type_display': leave.get_leave_type_display(),
                'start_date': leave.start_date.strftime('%Y-%m-%d'),
                'end_date': leave.end_date.strftime('%Y-%m-%d'),
                'duration': leave.get_duration(),
                'reason': leave.reason,
                'status': leave.status,
                'date_requested': leave.created_at.strftime('%Y-%m-%d %H:%M'),
                'supervisor_status': supervisor_approval.status if supervisor_approval else 'PENDING',
                'supervisor_comments': supervisor_approval.comments if supervisor_approval else '',
                'hr_status': hr_approval.status if hr_approval else 'PENDING',
                'hr_comments': hr_approval.comments if hr_approval else '',
            })
        
        return JsonResponse({'requests': requests_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_hr_leave_approve(request, pk):
    """Approve leave request"""
    try:
        leave = get_object_or_404(Leave, pk=pk)
        data = json.loads(request.body)
        comments = data.get('comments', '')
        
        # Determine approval level based on user role
        # This should be determined from request.user
        # For now, we'll check if supervisor approval exists
        supervisor_approval = leave.approvals.filter(approval_level='SUPERVISOR').first()
        
        if not supervisor_approval or supervisor_approval.status == 'PENDING':
            # This is supervisor approval
            approval, created = LeaveApproval.objects.get_or_create(
                leave=leave,
                approval_level='SUPERVISOR',
                defaults={'status': 'APPROVED', 'comments': comments, 'approved_date': timezone.now()}
            )
            if not created:
                approval.status = 'APPROVED'
                approval.comments = comments
                approval.approved_date = timezone.now()
                approval.save()
        else:
            # This is HR approval
            approval, created = LeaveApproval.objects.get_or_create(
                leave=leave,
                approval_level='HR',
                defaults={'status': 'APPROVED', 'comments': comments, 'approved_date': timezone.now()}
            )
            if not created:
                approval.status = 'APPROVED'
                approval.comments = comments
                approval.approved_date = timezone.now()
                approval.save()
            
            # Update leave status if both approvals are done
            if supervisor_approval.status == 'APPROVED':
                leave.status = 'APPROVED'
                leave.save()
        
        return JsonResponse({'success': True, 'message': 'Leave request approved'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_hr_leave_reject(request, pk):
    """Reject leave request"""
    try:
        leave = get_object_or_404(Leave, pk=pk)
        data = json.loads(request.body)
        comments = data.get('comments', '')
        
        # Determine approval level
        supervisor_approval = leave.approvals.filter(approval_level='SUPERVISOR').first()
        
        if not supervisor_approval or supervisor_approval.status == 'PENDING':
            # Supervisor rejection
            approval, created = LeaveApproval.objects.get_or_create(
                leave=leave,
                approval_level='SUPERVISOR',
                defaults={'status': 'REJECTED', 'comments': comments, 'approved_date': timezone.now()}
            )
            if not created:
                approval.status = 'REJECTED'
                approval.comments = comments
                approval.approved_date = timezone.now()
                approval.save()
        else:
            # HR rejection
            approval, created = LeaveApproval.objects.get_or_create(
                leave=leave,
                approval_level='HR',
                defaults={'status': 'REJECTED', 'comments': comments, 'approved_date': timezone.now()}
            )
            if not created:
                approval.status = 'REJECTED'
                approval.comments = comments
                approval.approved_date = timezone.now()
                approval.save()
        
        # Update leave status
        leave.status = 'REJECTED'
        leave.save()
        
        return JsonResponse({'success': True, 'message': 'Leave request rejected'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# ============================================
# SALARY ADVANCE REQUEST VIEWS
# ============================================

@csrf_exempt
@require_http_methods(["GET"])
def api_hr_advance_requests(request):
    """Get all salary advance requests for the current school"""
    try:
        from config.models import SchoolConfig
        # Get Current School
        school = SchoolConfig.get_config(user=request.user, request=request)
        
        advances = SalaryAdvance.objects.filter(school=school).select_related('employee').prefetch_related('approvals')
        
        requests_data = []
        for advance in advances:
            # Get approval statuses
            supervisor_approval = advance.approvals.filter(approval_level='SUPERVISOR').first()
            hr_approval = advance.approvals.filter(approval_level='HR').first()
            
            requests_data.append({
                'id': advance.id,
                'employee_id': advance.employee.id,
                'employee_name': advance.employee.get_full_name(),
                'amount': float(advance.amount),
                'reason': advance.reason,
                'status': advance.status,
                'date_requested': advance.date_requested.strftime('%Y-%m-%d %H:%M'),
                'supervisor_status': supervisor_approval.status if supervisor_approval else 'PENDING',
                'supervisor_comments': supervisor_approval.comments if supervisor_approval else '',
                'hr_status': hr_approval.status if hr_approval else 'PENDING',
                'hr_comments': hr_approval.comments if hr_approval else '',
            })
        
        return JsonResponse({'requests': requests_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_hr_advance_approve(request, pk):
    """Approve salary advance request"""
    try:
        advance = get_object_or_404(SalaryAdvance, pk=pk)
        data = json.loads(request.body)
        comments = data.get('comments', '')
        
        supervisor_approval = advance.approvals.filter(approval_level='SUPERVISOR').first()
        
        if not supervisor_approval or supervisor_approval.status == 'PENDING':
            # Supervisor approval
            approval, created = AdvanceApproval.objects.get_or_create(
                advance=advance,
                approval_level='SUPERVISOR',
                defaults={'status': 'APPROVED', 'comments': comments, 'approved_date': timezone.now()}
            )
            if not created:
                approval.status = 'APPROVED'
                approval.comments = comments
                approval.approved_date = timezone.now()
                approval.save()
        else:
            # HR approval
            approval, created = AdvanceApproval.objects.get_or_create(
                advance=advance,
                approval_level='HR',
                defaults={'status': 'APPROVED', 'comments': comments, 'approved_date': timezone.now()}
            )
            if not created:
                approval.status = 'APPROVED'
                approval.comments = comments
                approval.approved_date = timezone.now()
                approval.save()
            
            # Update advance status if both approvals are done
            if supervisor_approval.status == 'APPROVED':
                advance.status = 'APPROVED'
                advance.date_approved = timezone.now()
                advance.approved_by = request.user
                advance.save()
                
                # Create Expense record for the advance
                Expense.objects.get_or_create(
                    title=f"Salary Advance: {advance.employee.get_full_name()}",
                    category='salaries',
                    date=timezone.now().date(),
                    amount=advance.amount,
                    defaults={
                        'description': f"Approved salary advance for {advance.employee.get_full_name()}. Reason: {advance.reason}",
                        'payment_method': 'mobile_money', # Default for advances
                        'created_by': request.user
                    }
                )
        
        return JsonResponse({'success': True, 'message': 'Salary advance approved'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_hr_advance_reject(request, pk):
    """Reject salary advance request"""
    try:
        advance = get_object_or_404(SalaryAdvance, pk=pk)
        data = json.loads(request.body)
        comments = data.get('comments', '')
        
        supervisor_approval = advance.approvals.filter(approval_level='SUPERVISOR').first()
        
        if not supervisor_approval or supervisor_approval.status == 'PENDING':
            # Supervisor rejection
            approval, created = AdvanceApproval.objects.get_or_create(
                advance=advance,
                approval_level='SUPERVISOR',
                defaults={'status': 'REJECTED', 'comments': comments, 'approved_date': timezone.now()}
            )
            if not created:
                approval.status = 'REJECTED'
                approval.comments = comments
                approval.approved_date = timezone.now()
                approval.save()
        else:
            # HR rejection
            approval, created = AdvanceApproval.objects.get_or_create(
                advance=advance,
                approval_level='HR',
                defaults={'status': 'REJECTED', 'comments': comments, 'approved_date': timezone.now()}
            )
            if not created:
                approval.status = 'REJECTED'
                approval.comments = comments
                approval.approved_date = timezone.now()
                approval.save()
        
        # Update advance status
        advance.status = 'REJECTED'
        advance.save()
        
        return JsonResponse({'success': True, 'message': 'Salary advance rejected'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# ============================================
# SUPERVISOR MANAGEMENT VIEWS
# ============================================

@csrf_exempt
@require_http_methods(["GET"])
def api_supervisors_list(request):
    """Get all supervisors for the current school"""
    try:
        from config.models import SchoolConfig
        school = SchoolConfig.get_config(user=request.user, request=request)
        
        # Get all employees who have supervised staff within this school
        supervisors = Employee.objects.filter(
            school=school,
            supervised_staff__isnull=False
        ).distinct().prefetch_related('supervised_staff')
        
        supervisors_data = []
        for supervisor in supervisors:
            # Count pending requests from supervised staff that need supervisor action
            supervised_ids = list(supervisor.supervised_staff.values_list('id', flat=True))
            
            # Count leave requests pending supervisor approval
            pending_leaves_query = Leave.objects.filter(
                employee_id__in=supervised_ids,
                status='PENDING'
            ).prefetch_related('approvals')
            
            pending_leaves = 0
            for leave in pending_leaves_query:
                supervisor_approval = leave.approvals.filter(approval_level='SUPERVISOR').first()
                if not supervisor_approval or supervisor_approval.status == 'PENDING':
                    pending_leaves += 1
            
            # Count advance requests pending supervisor approval
            pending_advances_query = SalaryAdvance.objects.filter(
                employee_id__in=supervised_ids,
                status='PENDING'
            ).prefetch_related('approvals')
            
            pending_advances = 0
            for advance in pending_advances_query:
                supervisor_approval = advance.approvals.filter(approval_level='SUPERVISOR').first()
                if not supervisor_approval or supervisor_approval.status == 'PENDING':
                    pending_advances += 1
            
            supervisors_data.append({
                'id': supervisor.id,
                'first_name': supervisor.first_name,
                'last_name': supervisor.last_name,
                'email': supervisor.email,
                'phone': supervisor.phone,
                'position': supervisor.position,
                'supervised_count': supervisor.supervised_staff.count(),
                'pending_leaves': pending_leaves,
                'pending_advances': pending_advances,
            })
        
        return JsonResponse({'supervisors': supervisors_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET"])
def api_supervisor_team(request, pk):
    """Get all staff members supervised by a specific supervisor"""
    try:
        supervisor = get_object_or_404(Employee, pk=pk)
        
        # Get all staff supervised by this supervisor
        team_members = supervisor.supervised_staff.all()
        
        team_data = []
        for member in team_members:
            # Check if it's a NonTeachingStaff or Teacher
            staff_type_display = None
            if hasattr(member, 'nonteachingstaff'):
                staff_type_display = member.nonteachingstaff.get_staff_type_display()
            
            team_data.append({
                'id': member.id,
                'first_name': member.first_name,
                'last_name': member.last_name,
                'email': member.email,
                'phone': member.phone,
                'position': member.position,
                'staff_type_display': staff_type_display,
                'status': member.status,
            })
        
        return JsonResponse({'team': team_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET"])
def api_supervisor_pending_requests(request, pk):
    """Get all pending leave and advance requests for a supervisor's team"""
    try:
        supervisor = get_object_or_404(Employee, pk=pk)
        
        # Get supervised staff IDs
        supervised_ids = list(supervisor.supervised_staff.values_list('id', flat=True))
        
        # Get leave requests that are pending supervisor approval
        # (either no supervisor approval record or supervisor approval is pending)
        pending_leaves = Leave.objects.filter(
            employee_id__in=supervised_ids,
            status='PENDING'
        ).select_related('employee').prefetch_related('approvals')
        
        leaves_data = []
        for leave in pending_leaves:
            # Check if supervisor has already acted on this
            supervisor_approval = leave.approvals.filter(approval_level='SUPERVISOR').first()
            
            # Only include if supervisor hasn't approved or rejected yet
            if not supervisor_approval or supervisor_approval.status == 'PENDING':
                leaves_data.append({
                    'id': leave.id,
                    'employee_id': leave.employee.id,
                    'employee_name': leave.employee.get_full_name(),
                    'leave_type': leave.leave_type,
                    'leave_type_display': leave.get_leave_type_display(),
                    'start_date': leave.start_date.strftime('%Y-%m-%d'),
                    'end_date': leave.end_date.strftime('%Y-%m-%d'),
                    'duration': leave.get_duration(),
                    'reason': leave.reason,
                    'status': leave.status,
                    'date_requested': leave.created_at.strftime('%Y-%m-%d'),
                })
        
        # Get salary advance requests that are pending supervisor approval
        pending_advances = SalaryAdvance.objects.filter(
            employee_id__in=supervised_ids,
            status='PENDING'
        ).select_related('employee').prefetch_related('approvals')
        
        advances_data = []
        for advance in pending_advances:
            # Check if supervisor has already acted on this
            supervisor_approval = advance.approvals.filter(approval_level='SUPERVISOR').first()
            
            # Only include if supervisor hasn't approved or rejected yet
            if not supervisor_approval or supervisor_approval.status == 'PENDING':
                advances_data.append({
                    'id': advance.id,
                    'employee_id': advance.employee.id,
                    'employee_name': advance.employee.get_full_name(),
                    'amount': float(advance.amount),
                    'reason': advance.reason,
                    'status': advance.status,
                    'date_requested': advance.date_requested.strftime('%Y-%m-%d'),
                })
        
        return JsonResponse({
            'leaves': leaves_data,
            'advances': advances_data
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_supervisor_leave_approve(request, pk):
    """Supervisor approves leave request"""
    try:
        leave = get_object_or_404(Leave, pk=pk)
        data = json.loads(request.body)
        comments = data.get('comments', '')
        
        # Create or update supervisor approval
        approval, created = LeaveApproval.objects.get_or_create(
            leave=leave,
            approval_level='SUPERVISOR',
            defaults={'status': 'APPROVED', 'comments': comments, 'approved_date': timezone.now()}
        )
        if not created:
            approval.status = 'APPROVED'
            approval.comments = comments
            approval.approved_date = timezone.now()
            approval.save()
        
        return JsonResponse({'success': True, 'message': 'Leave request approved and sent to HR'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_supervisor_leave_reject(request, pk):
    """Supervisor rejects leave request"""
    try:
        leave = get_object_or_404(Leave, pk=pk)
        data = json.loads(request.body)
        comments = data.get('comments', '')
        
        # Create or update supervisor approval
        approval, created = LeaveApproval.objects.get_or_create(
            leave=leave,
            approval_level='SUPERVISOR',
            defaults={'status': 'REJECTED', 'comments': comments, 'approved_date': timezone.now()}
        )
        if not created:
            approval.status = 'REJECTED'
            approval.comments = comments
            approval.approved_date = timezone.now()
            approval.save()
        
        # Update leave status
        leave.status = 'REJECTED'
        leave.save()
        
        return JsonResponse({'success': True, 'message': 'Leave request rejected'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_supervisor_advance_approve(request, pk):
    """Supervisor approves salary advance request"""
    try:
        advance = get_object_or_404(SalaryAdvance, pk=pk)
        data = json.loads(request.body)
        comments = data.get('comments', '')
        
        # Create or update supervisor approval
        approval, created = AdvanceApproval.objects.get_or_create(
            advance=advance,
            approval_level='SUPERVISOR',
            defaults={'status': 'APPROVED', 'comments': comments, 'approved_date': timezone.now()}
        )
        if not created:
            approval.status = 'APPROVED'
            approval.comments = comments
            approval.approved_date = timezone.now()
            approval.save()
        
        return JsonResponse({'success': True, 'message': 'Salary advance approved and sent to HR'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_supervisor_advance_reject(request, pk):
    """Supervisor rejects salary advance request"""
    try:
        advance = get_object_or_404(SalaryAdvance, pk=pk)
        data = json.loads(request.body)
        comments = data.get('comments', '')
        
        # Create or update supervisor approval
        approval, created = AdvanceApproval.objects.get_or_create(
            advance=advance,
            approval_level='SUPERVISOR',
            defaults={'status': 'REJECTED', 'comments': comments, 'approved_date': timezone.now()}
        )
        if not created:
            approval.status = 'REJECTED'
            approval.comments = comments
            approval.approved_date = timezone.now()
            approval.save()
        
        # Update advance status
        advance.status = 'REJECTED'
        advance.save()
        
        return JsonResponse({'success': True, 'message': 'Salary advance rejected'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


