from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import user_passes_test
from django.views.decorators.csrf import csrf_exempt
from config.models import SchoolConfig
from schools.models import Student, Teacher, Employee
from django.db.models import Sum, Count
import json

def is_superuser(user):
    return user.is_authenticated and user.is_superuser

@require_http_methods(["GET"])
def api_app_status(request):
    try:
        from config.models import SystemSettings
        settings = SystemSettings.load()
        return JsonResponse({
            'maintenance_mode': settings.maintenance_mode,
            'registration_open': settings.registration_open,
            'basic_price': float(settings.basic_price),
            'standard_price': float(settings.standard_price),
            'enterprise_price': float(settings.enterprise_price),
            'currency': settings.currency,
        })
    except Exception as e:
        import traceback, logging
        logging.error(f"App Status API Error: {str(e)}")
        logging.error(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)

@user_passes_test(is_superuser)
@require_http_methods(["GET"])
def api_super_schools_list(request):
    try:
        from django.db.models import Count, Q
        # Sort by active status and then student count to show the most important schools first
        # Exclude system default/internal accounts for registry accuracy
        schools = SchoolConfig.objects.exclude(
            school_name__in=["EduManage Academy", "school", "Unassigned Account"]
        ).select_related('admin').annotate(
            s_count=Count('students', distinct=True),
            t_count=Count('employees', filter=Q(employees__position='TEACHER'), distinct=True),
            staff_count=Count('employees', distinct=True),
            p_count=Count('subscription_payments', distinct=True)
        ).filter(
            Q(s_count__gt=0) | 
            Q(staff_count__gt=0) | 
            Q(p_count__gt=0) |
            ~Q(school_code='EDU')
        ).order_by('-s_count', '-t_count', 'school_name')
        
        data = []
        for school in schools:
            data.append({
                'id': school.id,
                'school_name': school.school_name,
                'school_code': school.school_code,
                'school_email': school.school_email,
                'school_phone': school.school_phone,
                'portal_slug': school.portal_slug,
                'subscription_plan': school.subscription_plan,
                'subscription_status': school.subscription_status,
                'admin_email': school.admin.email if school.admin else "N/A",
                'student_count': school.s_count,
                'teacher_count': school.t_count, # This is specifically teachers
                'staff_total': school.staff_count, # This is all employees
                'is_active': school.is_active,
            })
        return JsonResponse(data, safe=False)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@user_passes_test(is_superuser)
@require_http_methods(["PATCH", "DELETE"])
def api_super_school_detail(request, pk):
    try:
        school = SchoolConfig.objects.get(pk=pk)
    except SchoolConfig.DoesNotExist:
        return JsonResponse({'error': 'School not found'}, status=404)

    if request.method == "DELETE":
        school.delete()
        return JsonResponse({'message': 'School deleted successfully'})

    if request.method == "PATCH":
        try:
            body = json.loads(request.body)
            if 'subscription_plan' in body:
                school.subscription_plan = body['subscription_plan']
            if 'subscription_status' in body:
                school.subscription_status = body['subscription_status']
            if 'is_active' in body:
                school.is_active = body['is_active']
            school.save()
            return JsonResponse({'message': 'School updated successfully'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@user_passes_test(is_superuser)
@require_http_methods(["POST"])
def api_super_school_toggle_active(request, pk):
    try:
        school = SchoolConfig.objects.get(pk=pk)
        if hasattr(school, 'is_active'):
            school.is_active = not school.is_active
        else:
            # If field doesn't exist yet, we'll need to add it or use subscription_status
            if school.subscription_status == 'Active':
                school.subscription_status = 'Inactive'
            else:
                school.subscription_status = 'Active'
        school.save()
        return JsonResponse({'message': 'Status toggled', 'new_status': getattr(school, 'is_active', school.subscription_status)})
    except SchoolConfig.DoesNotExist:
        return JsonResponse({'error': 'School not found'}, status=404)

@user_passes_test(is_superuser)
@require_http_methods(["GET"])
def api_super_stats(request):
    from django.db.models import Count, Q, Sum
    
    # Exclude system default/internal accounts AND empty "phantom" accounts
    # A school is considered "Registered" if it has population, payments, 
    # or has meaningfully moved away from default configuration (changed school code).
    active_schools_query = SchoolConfig.objects.exclude(
        school_name__in=["EduManage Academy", "school", "Unassigned Account"]
    ).annotate(
        s_count=Count('students', distinct=True),
        e_count=Count('employees', distinct=True),
        p_count=Count('subscription_payments', distinct=True)
    ).filter(
        Q(s_count__gt=0) | 
        Q(e_count__gt=0) | 
        Q(p_count__gt=0) |
        ~Q(school_code='EDU')
    )
    
    total_records = active_schools_query.count()
    
    # Population counts system-wide
    total_students = Student.objects.count()
    total_teachers = Teacher.objects.count()
    total_employees = Employee.objects.count()
    
    # Subscription Breakdown (filtered by the same active/real schools)
    enterprise_count = active_schools_query.filter(subscription_plan='Enterprise').count()
    standard_count = active_schools_query.filter(subscription_plan='Standard').count()
    basic_count = active_schools_query.filter(subscription_plan='Basic').count()
    
    # Calculate Subscription Revenue from COLLECTED payments across ALL schools
    from config.models import SubscriptionPayment
    total_revenue = SubscriptionPayment.objects.filter(status='COMPLETED').aggregate(total=Sum('amount'))['total'] or 0
    
    # Active terminals (meaningful schools that are marked active)
    online_count = active_schools_query.filter(is_active=True).count()
    
    return JsonResponse({
        'total_schools': total_records,
        'active_terminals': online_count,
        'total_revenue': float(total_revenue),
        'total_students': total_students,
        'total_teachers': total_teachers,
        'total_employees': total_employees,
        'plans': {
            'Enterprise': enterprise_count,
            'Standard': standard_count,
            'Basic': basic_count,
        }
    })

@user_passes_test(is_superuser)
@require_http_methods(["GET"])
def api_super_subscriptions(request):
    from config.models import SubscriptionPayment
    
    # Get recent payments
    payments = SubscriptionPayment.objects.select_related('school').order_by('-date')[:50]
    
    data = []
    for p in payments:
        data.append({
            'id': p.id,
            'school_name': p.school.school_name,
            'amount': float(p.amount),
            'plan': p.plan,
            'reference': p.reference,
            'status': p.status,
            'date': p.date.strftime('%Y-%m-%d %H:%M'),
            'transaction_id': p.transaction_id or 'N/A'
        })
        
    return JsonResponse({'payments': data})

@csrf_exempt
@user_passes_test(is_superuser)
@require_http_methods(["GET", "POST"])
def api_system_settings(request):
    from config.models import SystemSettings
    
    if request.method == "GET":
        try:
            settings = SystemSettings.load()
            return JsonResponse({
                'system': {
                    'maintenance_mode': settings.maintenance_mode,
                    'registration_open': settings.registration_open,
                    'debug_mode': settings.debug_mode,
                    'allow_api_access': settings.allow_api_access,
                },
                'pricing': {
                    'currency': settings.currency,
                    'trial_days': settings.trial_days,
                    'basic_price': float(settings.basic_price),
                    'standard_price': float(settings.standard_price),
                    'enterprise_price': float(settings.enterprise_price),
                },
                'communication': {
                    'sms_gateway': settings.sms_gateway,
                    'sms_active': settings.sms_active,
                    'email_active': settings.email_active,
                },
                'security': {
                    'force_2fa_admins': settings.force_2fa_admins,
                    'session_timeout': settings.session_timeout,
                }
            })
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return JsonResponse({'error': str(e)}, status=500)
        
    if request.method == "POST":
        try:
            settings = SystemSettings.load()
            data = json.loads(request.body)
            
            # Helper for safe type conversion
            def safe_int(val, default):
                if val == "": return default
                try: 
                    return int(val)
                except (ValueError, TypeError): 
                    return default
            
            def safe_decimal(val, default):
                if val == "": return default
                try:
                    return float(val) # Django DecimalField accepts float/string
                except (ValueError, TypeError):
                    return default

            # Update fields
            if 'system' in data:
                settings.maintenance_mode = data['system'].get('maintenance_mode', settings.maintenance_mode)
                settings.registration_open = data['system'].get('registration_open', settings.registration_open)
                settings.debug_mode = data['system'].get('debug_mode', settings.debug_mode)
            
            if 'pricing' in data:
                settings.currency = data['pricing'].get('currency', settings.currency)
                settings.trial_days = safe_int(data['pricing'].get('trial_days'), settings.trial_days)
                settings.basic_price = safe_decimal(data['pricing'].get('basic_price'), settings.basic_price)
                settings.standard_price = safe_decimal(data['pricing'].get('standard_price'), settings.standard_price)
                settings.enterprise_price = safe_decimal(data['pricing'].get('enterprise_price'), settings.enterprise_price)
                
            if 'communication' in data:
                settings.sms_gateway = data['communication'].get('sms_gateway', settings.sms_gateway)
                settings.sms_active = data['communication'].get('sms_active', settings.sms_active)
                settings.email_active = data['communication'].get('email_active', settings.email_active)
                
            if 'security' in data:
                settings.force_2fa_admins = data['security'].get('force_2fa_admins', settings.force_2fa_admins)
                settings.session_timeout = safe_int(data['security'].get('session_timeout'), settings.session_timeout)
                
            settings.save()
            return JsonResponse({'message': 'Settings updated successfully'})
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return JsonResponse({'error': str(e)}, status=400)
