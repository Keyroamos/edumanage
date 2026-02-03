from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from .models import Expense
import json
from datetime import datetime

@csrf_exempt
@login_required
@require_http_methods(["GET", "POST"])
def api_expenses(request):
    """
    API endpoint to list all expenses or create a new expense
    """
    if request.method == "GET":
        try:
            # Check if user has permission (is_staff or is_superuser)
            if not (request.user.is_staff or request.user.is_superuser):
                return JsonResponse({'error': 'Permission denied'}, status=403)
                
            expenses = Expense.objects.all().order_by('-date', '-created_at')
            expenses_list = []
            
            for expense in expenses:
                expenses_list.append({
                    'id': expense.id,
                    'title': expense.title,
                    'amount': float(expense.amount),
                    'category': expense.category,
                    'category_display': expense.get_category_display(),
                    'description': expense.description,
                    'date': expense.date.strftime('%Y-%m-%d'),
                    'vendor': expense.vendor,
                    'payment_method': expense.payment_method,
                    'payment_method_display': expense.get_payment_method_display(),
                    'receipt_number': expense.receipt_number,
                    'created_by': expense.created_by.get_full_name() if expense.created_by else 'Unknown'
                })
            
            # Calculate totals
            total_expenses = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
            
            # Calculate this month's expenses
            current_month = datetime.now().month
            current_year = datetime.now().year
            month_expenses = expenses.filter(
                date__month=current_month, 
                date__year=current_year
            ).aggregate(Sum('amount'))['amount__sum'] or 0
            
            return JsonResponse({
                'success': True,
                'expenses': expenses_list,
                'stats': {
                    'total_expenses': float(total_expenses),
                    'month_expenses': float(month_expenses),
                    'total_records': expenses.count(),
                    'categories_count': expenses.values('category').distinct().count()
                }
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    elif request.method == "POST":
        try:
            # Check if user has permission
            if not (request.user.is_staff or request.user.is_superuser):
                return JsonResponse({'error': 'Permission denied'}, status=403)
                
            data = json.loads(request.body)
            
            expense = Expense.objects.create(
                title=data.get('title'),
                amount=data.get('amount'),
                category=data.get('category'),
                description=data.get('description', ''),
                date=data.get('date'),
                vendor=data.get('vendor', ''),
                payment_method=data.get('payment_method'),
                receipt_number=data.get('receipt_number', ''),
                created_by=request.user
            )
            
            return JsonResponse({
                'success': True,
                'expense': {
                    'id': expense.id,
                    'title': expense.title,
                    'amount': float(expense.amount),
                    'category': expense.category,
                    'date': expense.date.strftime('%Y-%m-%d'),
                },
                'message': 'Expense added successfully'
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
@login_required
@require_http_methods(["DELETE", "PUT"])
def api_expense_detail(request, expense_id):
    """
    API endpoint to delete or update a specific expense
    """
    try:
        if not (request.user.is_staff or request.user.is_superuser):
            return JsonResponse({'error': 'Permission denied'}, status=403)
            
        try:
            expense = Expense.objects.get(id=expense_id)
        except Expense.DoesNotExist:
            return JsonResponse({'error': 'Expense not found'}, status=404)
            
        if request.method == "DELETE":
            expense.delete()
            return JsonResponse({'success': True, 'message': 'Expense deleted successfully'})
            
        elif request.method == "PUT":
            data = json.loads(request.body)
            
            expense.title = data.get('title', expense.title)
            expense.amount = data.get('amount', expense.amount)
            expense.category = data.get('category', expense.category)
            expense.description = data.get('description', expense.description)
            expense.date = data.get('date', expense.date)
            expense.vendor = data.get('vendor', expense.vendor)
            expense.payment_method = data.get('payment_method', expense.payment_method)
            expense.receipt_number = data.get('receipt_number', expense.receipt_number)
            expense.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Expense updated successfully',
                'expense': {
                    'id': expense.id,
                    'title': expense.title,
                    'amount': float(expense.amount),
                }
            })
            
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
