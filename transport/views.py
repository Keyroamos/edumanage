from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.db.models import Sum, Count, Q
from django.utils import timezone
from .models import TransportStudentAccount, TransportTransaction, Route, TransportAssignment, TransportVehicle, TransportDriver, TransportExpense, TransportLeaveRequest, TransportAdvanceRequest
from schools.models import Student
import json

@login_required
def api_transport_dashboard(request):
    try:
        from config.models import SchoolConfig
        school = SchoolConfig.get_config(user=request.user, request=request)
        from django.db.models.functions import TruncDate
        from django.utils import timezone
        import datetime

        # 1. Targets (Full Year Expected)
        target_revenue = TransportAssignment.objects.filter(account__school=school, active=True).aggregate(
            total=Sum(F('route__cost_per_term') * 3)
        )['total'] or 0

        # 2. Collected
        total_collected = TransportTransaction.objects.filter(school=school, type='PAYMENT').aggregate(sum=Sum('amount'))['sum'] or 0
        
        # 3. Outstanding (Target - Collected)
        outstanding = max(0, float(target_revenue) - float(total_collected))
        
        # New Stats
        active_students = TransportStudentAccount.objects.filter(school=school, active=True).count()
        
        today = timezone.now().date()
        todays_revenue = TransportTransaction.objects.filter(
            school=school, type='PAYMENT', date__date=today
        ).aggregate(sum=Sum('amount'))['sum'] or 0

        # Recent Transactions
        recent_tx = TransportTransaction.objects.filter(school=school).select_related('account__student').order_by('-date')[:5]
        
        tx_data = [{
            'id': t.id,
            'student': t.account.student.get_full_name(),
            'amount': float(t.amount),
            'type': t.type,
            'date': t.date.strftime('%Y-%m-%d'),
            'description': t.description
        } for t in recent_tx]

        # Popular Routes
        popular_routes_qs = TransportAssignment.objects.filter(account__school=school).values('route__name').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        popular_routes = [{'name': r['route__name'], 'value': r['count']} for r in popular_routes_qs]

        return JsonResponse({
            'stats': {
                'billed': float(target_revenue),
                'collected': float(total_collected),
                'outstanding': float(outstanding),
                'active_students': active_students,
                'todays_revenue': float(todays_revenue)
            },
            'recent_transactions': tx_data,
            'popular_routes': popular_routes
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def api_transport_students(request):
    """
    List all students with their transport account status.
    """
    try:
        from config.models import SchoolConfig
        school = SchoolConfig.get_config(user=request.user, request=request)
        students = Student.objects.filter(school=school).select_related('grade', 'transport_account').order_by('first_name')
        
        data = []
        for s in students:
            has_account = hasattr(s, 'transport_account')
            balance = float(s.transport_account.balance) if has_account else 0
            status = 'ACTIVE' if has_account and s.transport_account.active else 'INACTIVE'
            
            data.append({
                'id': s.id,
                'name': s.get_full_name(),
                'admission_number': s.admission_number,
                'grade': s.grade.name if s.grade else '',
                'photo': s.photo.url if s.photo else None,
                'has_account': has_account,
                'balance': balance,
                'status': status
            })
            
        return JsonResponse({'students': data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
def api_transport_student_detail(request, student_id):
    try:
        student = get_object_or_404(Student, pk=student_id)
        account, created = TransportStudentAccount.objects.get_or_create(student=student)
        
        if request.method == 'POST':
            data = json.loads(request.body)
            action = data.get('action')
            
            if action == 'TRANSACTION':
                tx_type = data.get('type')
                amount = data.get('amount')
                desc = data.get('description')
                method = data.get('method', 'CASH')
                
                TransportTransaction.objects.create(
                    account=account,
                    type=tx_type,
                    amount=amount,
                    description=desc,
                    payment_method=method,
                    recorded_by=request.user
                )
                return JsonResponse({'success': True})
            
            elif action == 'ASSIGN_ROUTE':
                # Check 1: Single Route Policy
                if TransportAssignment.objects.filter(account=account, active=True).exists():
                    return JsonResponse({'error': 'Student already has an active route. Please remove the existing route before assigning a new one.'}, status=400)

                # Check 2: Sufficient Funds (Must have credit/money in account)
                # Balance > 0 means owing, Balance < 0 means credit
                if account.balance >= 0:
                    return JsonResponse({'error': 'Insufficient funds. Student must have money in their account (credit balance) to be assigned a route.'}, status=400)

                route_id = data.get('route_id')
                pickup_point = data.get('pickup_point', '')
                pickup_location_embed = data.get('pickup_location_embed', '')
                route = get_object_or_404(Route, pk=route_id)
                
                TransportAssignment.objects.create(
                    account=account,
                    route=route,
                    pickup_point=pickup_point,
                    pickup_location_embed=pickup_location_embed
                )
                
                # Auto-charge for the route
                TransportTransaction.objects.create(
                    account=account,
                    type='CHARGE',
                    amount=route.cost_per_term,
                    description=f"Route Assignment: {route.name}",
                    recorded_by=request.user
                )

                return JsonResponse({'success': True})

            elif action == 'REMOVE_ROUTE':
                assignment_id = data.get('assignment_id')
                assignment = get_object_or_404(TransportAssignment, pk=assignment_id, account=account)
                assignment.active = False
                assignment.save()
                return JsonResponse({'success': True})

        # GET Data
        transactions = account.transport_transactions.order_by('-date')
        assignments = account.assignments.filter(active=True).select_related('route')
        
        tx_list = [{
            'id': t.id,
            'date': t.date.strftime('%Y-%m-%d'),
            'type': t.type,
            'amount': float(t.amount),
            'description': t.description,
            'method': t.payment_method
        } for t in transactions]
        
        assignment_list = [{
            'id': a.id,
            'route_name': a.route.name,
            'cost': float(a.route.cost_per_term),
            'pickup_point': a.pickup_point,
            'pickup_location_embed': a.pickup_location_embed,
            'route_map_embed': a.route.map_embed_code,
            'latitude': a.latitude,
            'longitude': a.longitude
        } for a in assignments]

        available_routes = Route.objects.filter(active=True).values('id', 'name', 'cost_per_term', 'pickup_points')

        return JsonResponse({
            'student': {
                'id': student.id,
                'name': student.get_full_name(),
                'adm': student.admission_number,
                'grade': student.grade.name if student.grade else '',
                'photo': student.photo.url if student.photo else None,
                'balance': float(account.balance)
            },
            'transactions': tx_list,
            'assignments': assignment_list,
            'available_routes': list(available_routes)
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
def api_transport_routes(request):
    try:
        if request.method == 'GET':
            routes = Route.objects.filter(active=True).annotate(
                student_count=Count('students', filter=Q(students__active=True))
            )
            data = [{
                'id': r.id,
                'name': r.name,
                'cost_per_term': float(r.cost_per_term),
                'cost_per_month': float(r.cost_per_month),
                'description': r.description,
                'pickup_points': r.pickup_points,
                'map_embed_code': r.map_embed_code,
                'student_count': r.student_count
            } for r in routes]
            return JsonResponse({'routes': data})

        elif request.method == 'POST':
            data = json.loads(request.body)
            action = data.get('action')

            if action == 'CREATE':
                Route.objects.create(
                    name=data['name'],
                    cost_per_term=data['cost_per_term'],
                    cost_per_month=data.get('cost_per_month', 0),
                    description=data.get('description', ''),
                    pickup_points=data.get('pickup_points', ''),
                    map_embed_code=data.get('map_embed_code', '')
                )
                return JsonResponse({'success': True})
            
            elif action == 'UPDATE':
                route = get_object_or_404(Route, pk=data['id'])
                route.name = data.get('name', route.name)
                route.cost_per_term = data.get('cost_per_term', route.cost_per_term)
                route.cost_per_month = data.get('cost_per_month', route.cost_per_month)
                route.description = data.get('description', route.description)
                route.pickup_points = data.get('pickup_points', route.pickup_points)
                route.map_embed_code = data.get('map_embed_code', route.map_embed_code)
                route.save()
                return JsonResponse({'success': True})
            
            elif action == 'DELETE':
                route = get_object_or_404(Route, pk=data['id'])
                route.active = False
                route.save()
                return JsonResponse({'success': True})

        return JsonResponse({'error': 'Invalid method'}, status=405)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def api_transport_route_detail(request, route_id):
    try:
        route = get_object_or_404(Route, pk=route_id)
        assignments = TransportAssignment.objects.filter(route=route, active=True).select_related('account__student')
        
        students_data = []
        for a in assignments:
            s = a.account.student
            students_data.append({
                'id': s.id,
                'name': s.get_full_name(),
                'adm': s.admission_number,
                'grade': s.grade.name if s.grade else '',
                'pickup_point': a.pickup_point,
                'balance': float(a.account.balance),
                'photo': s.photo.url if s.photo else None,
                'assignment_id': a.id,
                'pickup_location_embed': a.pickup_location_embed
            })
            
        return JsonResponse({
            'route': {
                'id': route.id,
                'name': route.name,
                'cost_per_term': float(route.cost_per_term),
                'cost_per_month': float(route.cost_per_month),
                'description': route.description,
                'pickup_points': route.pickup_points,
                'map_embed_code': route.map_embed_code,
                'student_count': assignments.count(),
                'potential_revenue': float(assignments.count() * route.cost_per_term),
                'assigned_vehicles': [{
                    'id': v.id,
                    'plate': v.plate_number,
                    'model': v.model,
                    'driver': v.driver.get_full_name() if hasattr(v, 'driver') else 'Unassigned'
                } for v in route.vehicles.all()]
            },
            'students': students_data
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@login_required
def api_transport_vehicles(request):
    try:
        if request.method == 'GET':
            vehicles = TransportVehicle.objects.all().select_related('route')
            # Handle driver separately since O2O reverse relation might raise DoesNotExist if joined wrong, but select_related works for FK. 
            # driver is reverse O2O on TransportVehicle (vehicle related_name='driver' on TransportDriver model).
            # Wait, TransportDriver has `vehicle = OneToOneField(TransportVehicle, related_name='driver')`.
            # So vehicle.driver refers to the driver.
            
            data = []
            for v in vehicles:
                driver_name = 'Unassigned'
                driver_id = None
                if hasattr(v, 'driver'):
                    driver_name = v.driver.get_full_name()
                    driver_id = v.driver.id

                data.append({
                    'id': v.id,
                    'plate_number': v.plate_number,
                    'model': v.model,
                    'capacity': v.capacity,
                    'status': v.status,
                    'route_name': v.route.name if v.route else 'Unassigned',
                    'route_id': v.route.id if v.route else None,
                    'driver_name': driver_name,
                    'driver_id': driver_id,
                })
            return JsonResponse({'vehicles': data})

        elif request.method == 'POST':
            data = json.loads(request.body)
            action = data.get('action')

            if action == 'CREATE':
                vehicle = TransportVehicle.objects.create(
                    plate_number=data['plate_number'],
                    model=data['model'],
                    capacity=data['capacity'],
                    status=data.get('status', 'ACTIVE'),
                    route_id=data.get('route_id')
                )
                return JsonResponse({'success': True, 'id': vehicle.id})
            
            return JsonResponse({'error': 'Invalid action'}, status=400)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@login_required
def api_transport_vehicle_detail(request, vehicle_id):
    try:
        vehicle = get_object_or_404(TransportVehicle, pk=vehicle_id)

        if request.method == 'GET':
            driver_info = None
            if hasattr(vehicle, 'driver'):
                driver_info = {
                    'id': vehicle.driver.id,
                    'name': vehicle.driver.get_full_name(),
                    'phone': vehicle.driver.phone_number
                }

            return JsonResponse({
                'id': vehicle.id,
                'plate_number': vehicle.plate_number,
                'model': vehicle.model,
                'capacity': vehicle.capacity,
                'status': vehicle.status,
                'route_id': vehicle.route.id if vehicle.route else None,
                'route_name': vehicle.route.name if vehicle.route else 'Unassigned',
                'driver': driver_info
            })

        elif request.method == 'POST':
            data = json.loads(request.body)
            action = data.get('action')

            if action == 'UPDATE':
                vehicle.plate_number = data.get('plate_number', vehicle.plate_number)
                vehicle.model = data.get('model', vehicle.model)
                vehicle.capacity = data.get('capacity', vehicle.capacity)
                vehicle.status = data.get('status', vehicle.status)
                if 'route_id' in data:
                    vehicle.route_id = data['route_id'] or None
                vehicle.save()
                return JsonResponse({'success': True})
            
            elif action == 'DELETE':
                vehicle.delete()
                return JsonResponse({'success': True})

        return JsonResponse({'error': 'Invalid method'}, status=405)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@login_required
def api_transport_drivers(request):
    try:
        if request.method == 'GET':
            drivers = TransportDriver.objects.all().select_related('vehicle')
            data = [{
                'id': d.id,
                'name': d.get_full_name(),
                'first_name': d.first_name,
                'last_name': d.last_name,
                'license': d.license_number,
                'phone': d.phone_number,
                'status': d.status,
                'vehicle_plate': d.vehicle.plate_number if d.vehicle else 'Unassigned',
                'vehicle_id': d.vehicle.id if d.vehicle else None,
            } for d in drivers]
            return JsonResponse({'drivers': data})

        elif request.method == 'POST':
            data = json.loads(request.body)
            action = data.get('action')

            if action == 'CREATE':
                driver = TransportDriver.objects.create(
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    phone_number=data['phone_number'],
                    license_number=data['license_number'],
                    status=data.get('status', 'ACTIVE'),
                    vehicle_id=data.get('vehicle_id') or None
                )
                return JsonResponse({'success': True, 'id': driver.id})

            return JsonResponse({'error': 'Invalid action'}, status=400)

    except Exception as e:
         return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET", "POST", "DELETE"])
@login_required
def api_transport_driver_detail(request, driver_id):
    try:
        driver = get_object_or_404(TransportDriver, pk=driver_id)

        if request.method == 'GET':
            return JsonResponse({
                'id': driver.id,
                'first_name': driver.first_name,
                'last_name': driver.last_name,
                'phone': driver.phone_number,
                'license': driver.license_number,
                'status': driver.status,
                'vehicle': {
                    'id': driver.vehicle.id,
                    'plate': driver.vehicle.plate_number,
                    'model': driver.vehicle.model
                } if hasattr(driver, 'vehicle') and driver.vehicle else None
            })
            
        if request.method == 'DELETE':
            # Also delete associated user if it exists
            if driver.user:
                driver.user.delete()
            driver.delete()
            return JsonResponse({'success': True})

        elif request.method == 'POST':
            data = json.loads(request.body)
            action = data.get('action')

            if action == 'UPDATE':
                driver.first_name = data.get('first_name', driver.first_name)
                driver.last_name = data.get('last_name', driver.last_name)
                driver.phone_number = data.get('phone_number', driver.phone_number)
                driver.license_number = data.get('license_number', driver.license_number)
                driver.status = data.get('status', driver.status)
                
                if 'vehicle_id' in data:
                    v_id = data.get('vehicle_id')
                    driver.vehicle_id = v_id if v_id else None
                
                driver.save()
                return JsonResponse({'success': True})
            
            elif action == 'DELETE':
                # Also delete associated user if it exists
                if driver.user:
                    driver.user.delete()
                driver.delete()
                return JsonResponse({'success': True})

        return JsonResponse({'error': 'Invalid method'}, status=405)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
def api_driver_dashboard(request):
    try:
        user = request.user
        if not hasattr(user, 'transport_driver_profile'):
            return JsonResponse({'error': 'Not authorized as a driver'}, status=403)
        
        driver = user.transport_driver_profile
        vehicle = getattr(driver, 'vehicle', None)
        
        if not vehicle:
             return JsonResponse({'error': 'No vehicle assigned'}, status=400)
             
        route = vehicle.route
        
        if not route:
            return JsonResponse({'error': 'Vehicle not assigned to a route'}, status=400)

        assignments = TransportAssignment.objects.filter(
            route=route, 
            active=True
        ).select_related('account__student')
        
        students_data = []
        for a in assignments:
            student = a.account.student
            phone = student.parent_phone or student.guardian_phone or 'N/A'
            photo_url = student.photo.url if student.photo else None
            
            students_data.append({
                'id': student.id,
                'name': student.get_full_name(),
                'phone': phone,
                'pickup_point': a.pickup_point,
                'lat': a.latitude,
                'lng': a.longitude,
                'photo_url': photo_url
            })

        return JsonResponse({
            'driver_name': driver.get_full_name(),
            'vehicle': {
                'plate': vehicle.plate_number,
                'model': vehicle.model,
                'capacity': vehicle.capacity
            },
            'route': {
                'id': route.id,
                'name': route.name,
            },
            'students': students_data
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
def api_update_student_transport_location(request, student_id):
    if request.method != 'POST':
         return JsonResponse({'error': 'POST required'}, status=405)
    
    try:
        user = request.user
        if not hasattr(user, 'transport_driver_profile'):
             return JsonResponse({'error': 'Unauthorized'}, status=403)
             
        data = json.loads(request.body)
        lat = data.get('lat')
        lng = data.get('lng')
        
        if lat is None or lng is None:
            return JsonResponse({'error': 'Coordinates required'}, status=400)
            
        driver = user.transport_driver_profile
        vehicle = getattr(driver, 'vehicle', None)
        
        if not vehicle or not vehicle.route:
             return JsonResponse({'error': 'No active route for driver'}, status=400)
             
        assignment = get_object_or_404(TransportAssignment, 
            account__student_id=student_id, 
            route=vehicle.route,
            active=True
        )
        
        assignment.latitude = float(lat)
        assignment.longitude = float(lng)
        if not assignment.pickup_point:
             assignment.pickup_point = "GPS Location Set"
        assignment.save()
        
        return JsonResponse({'success': True})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
def api_driver_expenses(request):
    try:
        user = request.user
        if not hasattr(user, 'transport_driver_profile'):
             return JsonResponse({'error': 'Unauthorized'}, status=403)
        driver = user.transport_driver_profile
        
        if request.method == 'GET':
            expenses = driver.expenses.all().order_by('-date')
            data = [{
                'id': e.id,
                'type': e.expense_type,
                'amount': float(e.amount),
                'description': e.description,
                'date': e.date,
                'status': e.status,
                'receipt_url': e.receipt_image.url if e.receipt_image else None
            } for e in expenses]
            return JsonResponse({'expenses': data})
            
        elif request.method == 'POST':
            data = request.POST 
            amount = data.get('amount')
            desc = data.get('description')
            etype = data.get('type')
            receipt = request.FILES.get('receipt')
            
            TransportExpense.objects.create(
                driver=driver,
                vehicle=driver.vehicle,
                expense_type=etype,
                amount=amount,
                description=desc,
                receipt_image=receipt,
                date=timezone.now().date()
            )
            return JsonResponse({'success': True})
            
    except Exception as e:
         return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
def api_driver_leaves(request):
    try:
        user = request.user
        if not hasattr(user, 'transport_driver_profile'):
             return JsonResponse({'error': 'Unauthorized'}, status=403)
        driver = user.transport_driver_profile
        
        if request.method == 'GET':
            leaves = driver.leave_requests.all().order_by('-created_at')
            return JsonResponse({'leaves': list(leaves.values())})
        
        elif request.method == 'POST':
            data = json.loads(request.body)
            TransportLeaveRequest.objects.create(
                driver=driver,
                start_date=data['start_date'],
                end_date=data['end_date'],
                reason=data['reason']
            )
            return JsonResponse({'success': True})
    except Exception as e:
         return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
def api_driver_advances(request):
    try:
        user = request.user
        if not hasattr(user, 'transport_driver_profile'):
             return JsonResponse({'error': 'Unauthorized'}, status=403)
        driver = user.transport_driver_profile
        
        if request.method == 'GET':
            advances = driver.advance_requests.all().order_by('-created_at')
            return JsonResponse({'advances': list(advances.values())})
            
        elif request.method == 'POST':
            data = json.loads(request.body)
            TransportAdvanceRequest.objects.create(
                driver=driver,
                amount=data['amount'],
                reason=data['reason']
            )
            return JsonResponse({'success': True})
    except Exception as e:
         return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
def api_transport_finance_expenses(request):
    try:
        if request.method == 'GET':
            expenses = TransportExpense.objects.select_related('driver').order_by('-date')
            data = [{
                'id': e.id,
                'driver': e.driver.get_full_name(),
                'type': e.expense_type,
                'amount': float(e.amount),
                'description': e.description,
                'date': e.date,
                'status': e.status,
                'receipt_url': e.receipt_image.url if e.receipt_image else None
            } for e in expenses]
            return JsonResponse({'expenses': data})
        
        elif request.method == 'POST':
            data = json.loads(request.body)
            expense_id = data.get('id')
            action = data.get('action') # APPROVED or REJECTED
            
            expense = get_object_or_404(TransportExpense, pk=expense_id)
            expense.status = action
            expense.action_by = request.user
            expense.action_date = timezone.now()
            expense.save()
            
            return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
def api_transport_finance_advances(request):
    try:
        if request.method == 'GET':
            advances = TransportAdvanceRequest.objects.select_related('driver').order_by('-created_at')
            data = [{
                'id': a.id,
                'driver': a.driver.get_full_name(),
                'amount': float(a.amount),
                'reason': a.reason,
                'date': a.created_at.strftime('%Y-%m-%d'),
                'status': a.status
            } for a in advances]
            return JsonResponse({'advances': data})
        elif request.method == 'POST':
            data = json.loads(request.body)
            adv_id = data.get('id')
            action = data.get('action') 
            adv = get_object_or_404(TransportAdvanceRequest, pk=adv_id)
            adv.status = action
            adv.action_by = request.user
            adv.action_date = timezone.now()
            adv.save()
            
            if action == 'APPROVED':
                from schools.models import Expense
                Expense.objects.get_or_create(
                    title=f"Driver Advance: {adv.driver.get_full_name()}",
                    category='transport', # or 'salaries', user said expenses, transport makes sense for drivers
                    date=timezone.now().date(),
                    amount=adv.amount,
                    defaults={
                        'description': f"Approved transport advance for driver {adv.driver.get_full_name()}. Reason: {adv.reason}",
                        'payment_method': 'mobile_money',
                        'created_by': request.user
                    }
                )
            return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
