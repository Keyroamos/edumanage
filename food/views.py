from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Count, Q
from .models import FoodStudentAccount, FoodTransaction, MealItem, FoodSubscription
from schools.models import Student
import json

@login_required
def api_food_dashboard(request):
    try:
        from config.models import SchoolConfig
        school = SchoolConfig.get_config(user=request.user, request=request)
        from django.db.models.functions import TruncDate
        from django.utils import timezone
        import datetime

        # 1. Targets (Full Year Expected)
        target_revenue = FoodSubscription.objects.filter(account__school=school, active=True).aggregate(
            total=Sum(F('meal_item__cost') * 3)
        )['total'] or 0

        # 2. Collected
        total_collected = FoodTransaction.objects.filter(school=school, type='PAYMENT').aggregate(sum=Sum('amount'))['sum'] or 0
        
        # 3. Outstanding (Target - Collected)
        outstanding = max(0, float(target_revenue) - float(total_collected))
        
        # New Stats
        active_subscribers = FoodSubscription.objects.filter(account__school=school, active=True).count()
        
        today = timezone.now().date()
        todays_revenue = FoodTransaction.objects.filter(
            school=school, type='PAYMENT', date__date=today
        ).aggregate(sum=Sum('amount'))['sum'] or 0

        # Recent Transactions
        recent_tx = FoodTransaction.objects.filter(school=school).select_related('account__student').order_by('-date')[:5]
        
        tx_data = [{
            'id': t.id,
            'student': t.account.student.get_full_name(),
            'amount': float(t.amount),
            'type': t.type,
            'date': t.date.strftime('%Y-%m-%d'),
            'description': t.description
        } for t in recent_tx]

        # Revenue Breakdown by Meal Item (Approximation via subscriptions count)
        # This is a bit tricky since subscriptions don't map 1:1 to payments, 
        # but let's show "Popular Plans" instead.
        # Popular Plans
        popular_plans_qs = FoodSubscription.objects.filter(account__school=school).values('meal_item__name').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        popular_plans = [{'name': p['meal_item__name'], 'value': p['count']} for p in popular_plans_qs]

        return JsonResponse({
            'stats': {
                'billed': float(target_revenue),
                'collected': float(total_collected),
                'outstanding': float(outstanding),
                'active_subscribers': active_subscribers,
                'todays_revenue': float(todays_revenue)
            },
            'recent_transactions': tx_data,
            'popular_plans': popular_plans
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def api_food_students(request):
    """
    List all students with their food account status.
    """
    try:
        from config.models import SchoolConfig
        school = SchoolConfig.get_config(user=request.user, request=request)
        # Get all students, and if they have a food account, get that info
        students = Student.objects.filter(school=school).select_related('grade', 'food_account').order_by('first_name')
        
        data = []
        for s in students:
            has_account = hasattr(s, 'food_account')
            balance = float(s.food_account.balance) if has_account else 0
            status = 'ACTIVE' if has_account and s.food_account.active else 'INACTIVE'
            
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
def api_food_student_detail(request, student_id):
    try:
        student = get_object_or_404(Student, pk=student_id)
        
        # Ensure account exists or handle "not found" carefully?
        # User wants to manage payment, so created if not exists?
        # Let's auto-create if an accountant accesses the details specifically.
        account, created = FoodStudentAccount.objects.get_or_create(student=student)
        
        if request.method == 'POST':
            data = json.loads(request.body)
            action = data.get('action')
            
            if action == 'TRANSACTION':
                tx_type = data.get('type')
                amount = data.get('amount')
                desc = data.get('description')
                method = data.get('method', 'CASH')
                
                FoodTransaction.objects.create(
                    account=account,
                    type=tx_type,
                    amount=amount,
                    description=desc,
                    payment_method=method,
                    recorded_by=request.user
                )
                return JsonResponse({'success': True})
            
            elif action == 'SUBSCRIBE':
                item_id = data.get('meal_item_id')
                item = get_object_or_404(MealItem, pk=item_id)
                FoodSubscription.objects.create(
                    account=account,
                    meal_item=item
                )
                
                # Auto-charge for the subscription (simplified logic: charge immediately on sub)
                # In a real app, you might want to check billing cycles (e.g. daily/monthly jobs)
                # But for immediate "Billing Accuracy", let's charge now.
                FoodTransaction.objects.create(
                    account=account,
                    type='CHARGE',
                    amount=item.cost,
                    description=f"Subscription Charge: {item.name}",
                    recorded_by=request.user
                )

                return JsonResponse({'success': True})

            elif action == 'UNSUBSCRIBE':
                sub_id = data.get('subscription_id')
                sub = get_object_or_404(FoodSubscription, pk=sub_id, account=account)
                sub.active = False
                sub.save()
                return JsonResponse({'success': True})

        # GET Data
        transactions = account.food_transactions.order_by('-date')
        subscriptions = account.subscriptions.filter(active=True).select_related('meal_item')
        
        tx_list = [{
            'id': t.id,
            'date': t.date.strftime('%Y-%m-%d'),
            'type': t.type,
            'amount': float(t.amount),
            'description': t.description,
            'method': t.payment_method
        } for t in transactions]
        
        sub_list = [{
            'id': s.id,
            'item_name': s.meal_item.name,
            'cost': float(s.meal_item.cost),
            'cycle': s.meal_item.billing_cycle
        } for s in subscriptions]

        available_items = MealItem.objects.filter(active=True).values('id', 'name', 'cost', 'billing_cycle')

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
            'subscriptions': sub_list,
            'available_items': list(available_items)
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
def api_food_items(request):
    try:
        if request.method == 'GET':
            items = MealItem.objects.filter(active=True).annotate(
                subscriber_count=Count('foodsubscription', filter=Q(foodsubscription__active=True))
            )
            data = [{
                'id': i.id,
                'name': i.name,
                'cost': float(i.cost),
                'per_serving_cost': float(i.per_serving_cost),
                'cycle': i.billing_cycle,
                'description': i.description,
                'active_subscribers': i.subscriber_count
            } for i in items]
            return JsonResponse({'items': data})

        elif request.method == 'POST':
            data = json.loads(request.body)
            action = data.get('action')

            if action == 'CREATE':
                MealItem.objects.create(
                    name=data['name'],
                    cost=data['cost'],
                    billing_cycle=data['billing_cycle'],
                    description=data.get('description', '')
                )
                return JsonResponse({'success': True})
            
            elif action == 'UPDATE':
                item = get_object_or_404(MealItem, pk=data['id'])
                item.name = data.get('name', item.name)
                item.cost = data.get('cost', item.cost)
                item.billing_cycle = data.get('billing_cycle', item.billing_cycle)
                item.description = data.get('description', item.description)
                item.save()
                return JsonResponse({'success': True})
            
            elif action == 'DELETE':
                item = get_object_or_404(MealItem, pk=data['id'])
                # Soft delete
                item.active = False
                item.save()
                return JsonResponse({'success': True})

        return JsonResponse({'error': 'Invalid method'}, status=405)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def api_food_serving_list(request):
    try:
        item_id = request.GET.get('item_id')
        
        # Get all active items for the dropdown selector
        items = MealItem.objects.filter(active=True).values('id', 'name', 'billing_cycle')
        
        students_list = []
        selected_item_name = ""

        if item_id:
            # Get the meal item to check cost
            meal_item = get_object_or_404(MealItem, pk=item_id)
            charge_amount = meal_item.per_serving_cost if meal_item.per_serving_cost > 0 else meal_item.cost
            
            # Get today's date for checking served status
            from django.utils import timezone
            today = timezone.now().date()
            
            # Get subscriptions for this item
            subs = FoodSubscription.objects.filter(
                meal_item_id=item_id, 
                active=True,
                account__active=True
            ).select_related('account__student', 'account__student__grade', 'meal_item')
            
            if subs.exists():
                selected_item_name = subs.first().meal_item.name

            for sub in subs:
                s = sub.account.student
                current_balance = sub.account.balance
                
                # Check if already served today
                served_today = FoodTransaction.objects.filter(
                    account=sub.account,
                    type='CHARGE',
                    description__icontains=f"Served: {meal_item.name}",
                    date__date=today
                ).exists()
                
                # Only include student if they have sufficient funds OR already served
                can_afford = (-current_balance) >= charge_amount
                
                if can_afford or served_today:
                    students_list.append({
                        'id': s.id,
                        'name': s.get_full_name(),
                        'adm': s.admission_number,
                        'grade': s.grade.name if s.grade else 'N/A',
                        'photo': s.photo.url if s.photo else None,
                        'balance': float(current_balance),
                        'status': 'SERVED' if served_today else 'ALLOWED',
                        'served_today': served_today
                    })
        
        return JsonResponse({
            'items': list(items),
            'students': students_list,
            'selected_item_name': selected_item_name
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
def api_food_mark_served(request):
    """
    Mark a student as served for a specific meal item.
    This will automatically charge their account with the per-serving cost.
    """
    try:
        if request.method != 'POST':
            return JsonResponse({'error': 'POST required'}, status=405)
        
        data = json.loads(request.body)
        student_id = data.get('student_id')
        item_id = data.get('item_id')
        
        if not student_id or not item_id:
            return JsonResponse({'error': 'student_id and item_id required'}, status=400)
        
        # Get the student and meal item
        student = get_object_or_404(Student, pk=student_id)
        meal_item = get_object_or_404(MealItem, pk=item_id)
        
        # Get or create food account
        account, created = FoodStudentAccount.objects.get_or_create(student=student)
        
        # Check if student is subscribed to this item
        subscription = FoodSubscription.objects.filter(
            account=account,
            meal_item=meal_item,
            active=True
        ).first()
        
        if not subscription:
            return JsonResponse({'error': 'Student not subscribed to this meal'}, status=400)
        
        # Check if already served today for this meal
        from django.utils import timezone
        today = timezone.now().date()
        
        already_served = FoodTransaction.objects.filter(
            account=account,
            type='CHARGE',
            description__icontains=f"Served: {meal_item.name}",
            date__date=today
        ).exists()
        
        if already_served:
            return JsonResponse({
                'error': f'Student already served {meal_item.name} today',
                'already_served': True
            }, status=400)
        
        # Use per_serving_cost if available, otherwise use the full cost
        charge_amount = meal_item.per_serving_cost if meal_item.per_serving_cost > 0 else meal_item.cost
        
        # Create a charge transaction
        FoodTransaction.objects.create(
            account=account,
            type='CHARGE',
            amount=charge_amount,
            description=f"Served: {meal_item.name}",
            payment_method='SYSTEM',
            recorded_by=request.user
        )
        
        return JsonResponse({
            'success': True,
            'charged': float(charge_amount),
            'new_balance': float(account.balance)
        })
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
