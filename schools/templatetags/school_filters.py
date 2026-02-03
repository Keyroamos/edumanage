from django import template
from decimal import Decimal
from django.db.models import Sum
from django.contrib.auth.models import Group
from django.template.defaultfilters import floatformat, stringfilter
from ..models import Assessment  # Add this import
from django.contrib.auth.models import User
from schools.models import Teacher  # Add this import
from django.utils import timezone
from django.utils.safestring import mark_safe
import re
from collections import defaultdict

register = template.Library()

@register.filter
def is_staff_or_admin(user):
    """Check if user is staff or admin"""
    if not user.is_authenticated:
        return False
    return (user.is_staff or 
            user.is_superuser or 
            user.groups.filter(name__in=['Admin', 'Teacher', 'Accountant']).exists())

@register.filter
def is_class_teacher(user):
    """Check if user is a class teacher"""
    if not user.is_authenticated:
        return False
    try:
        return user.teacher.is_class_teacher if hasattr(user, 'teacher') else False
    except (AttributeError, Teacher.DoesNotExist):
        return False

@register.filter
def div(value, arg):
    """
    Divides the value by the argument
    """
    try:
        value = float(value)
        arg = float(arg)
        if arg == 0:
            return 0
        return value / arg
    except (ValueError, TypeError, ZeroDivisionError):
        return 0

@register.filter
def mul(value, arg):
    """
    Multiplies the value by the argument
    """
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return 0

@register.filter(name='percentage')
def percentage(value, total):
    """Calculate percentage"""
    try:
        if total == 0:
            return 0
        return floatformat((float(value) / float(total)) * 100, 1)
    except (ValueError, ZeroDivisionError, TypeError):
        return 0

@register.filter
def sum_amount(queryset):
    """Sum the amount field of a queryset"""
    if not queryset:
        return 0
    return queryset.aggregate(Sum('amount'))['amount__sum'] or 0

@register.filter
def call_method(obj, arg):
    """Call a method on an object with arguments"""
    try:
        # Convert string to int if it's numeric
        if isinstance(arg, str) and arg.isdigit():
            arg = int(arg)
        
        # If obj is a method, call it with arg
        if callable(obj):
            return obj(arg)
        
        # If obj has a method named arg, call it
        method = getattr(obj, str(arg))
        if callable(method):
            return method()
            
        return method
    except (AttributeError, TypeError, ValueError):
        return 0

@register.filter
def call_filter(queryset, term):
    """Filter a queryset by term"""
    return queryset.filter(term=term)

@register.filter
def get_term_fees(obj, term_number):
    """Get term fees for a student or grade and term number"""
    try:
        # Convert term_number to int if it's a string
        if isinstance(term_number, str):
            term_number = int(term_number)
            
        # If obj has get_term_fees method (Student), use it
        if hasattr(obj, 'get_term_fees'):
            return obj.get_term_fees(term_number)
            
        # If obj is a Grade, get the term fees directly
        if hasattr(obj, f'term{term_number}_fees'):
            return getattr(obj, f'term{term_number}_fees')
            
        return 0
    except (AttributeError, ValueError, TypeError):
        return 0

@register.filter
def filter_payments_by_term(payments, term):
    """Filter payments by term"""
    try:
        return payments.filter(term=int(term))
    except (AttributeError, ValueError):
        return []

@register.filter
def subtract(value, arg):
    """Subtract the arg from the value."""
    try:
        return float(value or 0) - float(arg or 0)
    except (ValueError, TypeError):
        return 0

@register.filter
def is_accountant(user):
    """Check if user is an accountant"""
    if user.is_superuser:
        return True
    return user.groups.filter(name='Accountant').exists()

@register.filter
def payment_status_color(status):
    """Return Bootstrap color class based on payment status"""
    colors = {
        'COMPLETED': 'success',
        'PENDING': 'warning',
        'FAILED': 'danger',
        'CANCELLED': 'secondary',
        'REFUNDED': 'info',
        'PAID': 'success',
        'PARTIAL': 'warning',
        'UNPAID': 'danger',
        'NO_FEES': 'secondary'
    }
    return colors.get(status, 'secondary')

@register.filter
def grade_color(grade):
    """Returns Bootstrap color class based on grade/performance"""
    if not grade:
        return 'secondary'
        
    colors = {
        'A': 'success',
        'B': 'primary',
        'C': 'info',
        'D': 'warning',
        'E': 'danger',
        '4': 'success',    # Exceeding Expectations
        '3': 'primary',    # Meeting Expectations
        '2': 'warning',    # Approaching Expectations
        '1': 'danger',     # Below Expectations
    }
    
    # Try to get first character if it's a string
    grade_key = str(grade)[0].upper() if isinstance(grade, str) else str(grade)
    return colors.get(grade_key, 'secondary')

@register.filter
def payment_icon(method):
    """Return the appropriate Bootstrap icon class for payment methods"""
    icons = {
        'cash': 'bi-cash',
        'bank_transfer': 'bi-bank',
        'mpesa': 'bi-phone',
        'card': 'bi-credit-card',
        'cheque': 'bi-file-text',
        'other': 'bi-wallet2'
    }
    return icons.get(method.lower(), 'bi-wallet2')

@register.filter
def performance_color(score):
    """Returns a color class based on the performance score"""
    try:
        score = float(score)  # Convert score to float
        if score >= 80:
            return 'success'
        elif score >= 60:
            return 'info'
        elif score >= 40:
            return 'warning'
        else:
            return 'danger'
    except (ValueError, TypeError):
        return 'secondary'  # Default color if score is invalid

@register.filter
def performance_label(level):
    """Returns human-readable label for performance level"""
    labels = {
        '4': 'Exceeding',
        '3': 'Meeting',
        '2': 'Approaching',
        '1': 'Below'
    }
    return labels.get(str(level), 'N/A')

@register.filter
def performance_percentage(level):
    """Converts performance level to percentage for progress bars"""
    try:
        return int(level) * 25  # Convert level to percentage (1=25%, 2=50%, etc.)
    except (ValueError, TypeError):
        return 0

@register.filter
def ordinal(number):
    """
    Convert a number to its ordinal representation.
    1 -> 1st, 2 -> 2nd, 3 -> 3rd, etc.
    """
    try:
        number = int(number)
    except (ValueError, TypeError):
        return number
    
    if 10 <= number % 100 <= 20:
        suffix = 'th'
    else:
        suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(number % 10, 'th')
    return f"{number}{suffix}"

@register.filter
def can_mark_attendance(user, grade):
    """Check if user can mark attendance for a grade"""
    try:
        # Check if user is admin or a teacher assigned to this grade
        if user.is_superuser:
            return True
        return user.teacher.grade == grade if hasattr(user, 'teacher') else False
    except (AttributeError, Teacher.DoesNotExist):
        # Return False if user is not a teacher
        return False

@register.filter
def get_item(dictionary, key):
    """Get an item from a dictionary using a template filter"""
    try:
        return dictionary.get(str(key))
    except (KeyError, AttributeError, TypeError):
        return None

@register.filter
def status_color(status):
    """Get the appropriate color class for an attendance status"""
    colors = {
        'PRESENT': 'success',
        'ABSENT': 'danger',
        'LATE': 'warning',
        'EXCUSED': 'info'
    }
    return colors.get(status, 'secondary')

@register.filter
def payment_method_color(method):
    """Convert payment method to appropriate badge color"""
    colors = {
        'CASH': 'success',
        'MPESA': 'primary', 
        'BANK': 'info',
        'CHEQUE': 'warning'
    }
    return colors.get(method, 'secondary')

@register.filter
def modulo(value, arg):
    return value % arg

@register.filter
def split(value, delimiter=','):
    return value.split(delimiter)

@register.filter(name='index')
def index(lst, i):
    try:
        return lst[i]
    except:
        return None

@register.filter
def filter_by_level(results, level):
    """Filter assessment results by performance level"""
    return [result for result in results if result.performance_level == level]

@register.filter
def get_assessment_type_display(value):
    """Convert assessment type code to display name"""
    assessment_types = dict(Assessment.ASSESSMENT_TYPES)
    return assessment_types.get(value, value)

@register.filter
def assessment_type_color(assessment_type):
    colors = {
        'weekly': 'warning',
        'opener': 'info',
        'mid-term': 'primary',
        'end-term': 'success'
    }
    return colors.get(assessment_type, 'secondary')

@register.filter
def level_badge_class(level):
    """Convert performance level to appropriate badge class"""
    level_classes = {
        '1': 'danger',    # Below Expectations
        '2': 'warning',   # Approaching Expectations
        '3': 'info',      # Meets Expectations
        '4': 'success'    # Exceeds Expectations
    }
    return level_classes.get(str(level), 'secondary')

@register.filter
def progress_badge_class(progress):
    """Convert progress percentage to appropriate badge class"""
    try:
        progress = int(progress)
        if progress >= 100:
            return 'success'
        elif progress >= 70:
            return 'info'
        elif progress >= 40:
            return 'warning'
        else:
            return 'danger'
    except (ValueError, TypeError):
        return 'secondary'  # Default color if progress is not a valid number

@register.filter
def is_student(user):
    """Check if user is a student"""
    return user.groups.filter(name='Students').exists()

@register.filter
def multiply(value, arg):
    """Multiply the value by the argument"""
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return value

@register.filter
def filter_by_gender(students, gender):
    """Filter students by gender"""
    return [student for student in students if student.gender == gender]

@register.filter
def average_age(students):
    """Calculate average age of students"""
    if not students:
        return 0
    total_age = sum((timezone.now().date() - student.date_of_birth).days / 365.25 
                    for student in students)
    return total_age / len(students)

@register.filter
def get_term_paid_amount(student, term_number):
    """Get the total amount paid for a specific term"""
    try:
        term_payments = student.payments.filter(term=int(term_number))
        return term_payments.aggregate(Sum('amount'))['amount__sum'] or 0
    except (ValueError, AttributeError):
        return 0

@register.filter
def get_term_balance(student, term_number):
    """Get the remaining balance for a specific term"""
    try:
        term_fees = student.get_term_fees(term_number)
        term_paid = student.get_term_paid_amount(term_number)
        return term_fees - term_paid
    except (ValueError, AttributeError):
        return 0

@register.filter
def get_term_payment_status(student, term_number):
    """Get the payment status for a specific term"""
    try:
        term_fees = student.get_term_fees(term_number)
        if term_fees == 0:
            return 'NO_FEES'
        
        term_paid = student.get_term_paid_amount(term_number)
        if term_paid >= term_fees:
            return 'PAID'
        elif term_paid > 0:
            return 'PARTIAL'
        return 'UNPAID'
    except (ValueError, AttributeError):
        return 'NO_FEES'

@register.filter
def get_term_paid_percentage(student, term_number):
    """Get the percentage of fees paid for a specific term"""
    try:
        term_fees = student.get_term_fees(term_number)
        if term_fees == 0:
            return 0
        
        term_paid = student.get_term_paid_amount(term_number)
        return (term_paid / term_fees) * 100
    except (ValueError, AttributeError, ZeroDivisionError):
        return 0


@register.filter
def average(queryset, method_name):
    """Calculate the average of a method or attribute for all items in a queryset/list."""
    if not queryset:
        return 0
    values = []
    for obj in queryset:
        # Try to call method if it exists, else get attribute
        value = None
        if hasattr(obj, method_name):
            attr = getattr(obj, method_name)
            value = attr() if callable(attr) else attr
        if value is not None:
            values.append(float(value))
    if not values:
        return 0
    return sum(values) / len(values)

@register.filter
def subject_performance_breakdown(assessments):
    """Return a dict of subject name -> {'avg': average level, 'trend': trend value} for subject mini-cards."""
    subject_levels = defaultdict(list)
    for assessment in assessments:
        for result in assessment.results.all():
            try:
                level = int(result.performance_level)
            except (ValueError, TypeError):
                continue
            subject_levels[result.subject.name].append(level)
    breakdown = {}
    for subject, levels in subject_levels.items():
        if not levels:
            continue
        avg = sum(levels) / len(levels)
        trend = 0
        if len(levels) > 1:
            trend = levels[-1] - levels[0]
        breakdown[subject] = {'avg': avg, 'trend': trend}
    return breakdown.items()

@register.filter
def is_teacher(user):
    """Check if user is a teacher"""
    if not user.is_authenticated:
        return False
    return user.groups.filter(name='Teacher').exists()