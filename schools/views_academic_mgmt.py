from django.http import JsonResponse
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import transaction
from .models import Student, Grade, Term
from config.models import SchoolConfig
import json

@csrf_exempt
@login_required
@require_http_methods(["POST"])
def api_promote_students(request):
    """
    Promotes students to the next grade based on a defined sequence.
    Resets current_term to 1.
    """
    try:
        # Define the grade order logic
        grade_map = {
            'PG': 'PP1',
            'PP1': 'PP2',
            'PP2': 'G1',
            'G1': 'G2',
            'G2': 'G3',
            'G3': 'G4',
            'G4': 'G5',
            'G5': 'G6',
            'G6': 'G7',
            'G7': 'G8',
            'G8': 'G9',
            'G9': 'G10',
            'G10': 'G11',
            'G11': 'G12',
            'G12': None
        }
        
        # Processing order: Highest to Lowest to prevent overlap during updates
        processing_order = ['G12', 'G11', 'G10', 'G9', 'G8', 'G7', 'G6', 'G5', 'G4', 'G3', 'G2', 'G1', 'PP2', 'PP1', 'PG']
        
        with transaction.atomic():
            # Get current school context
            school = SchoolConfig.get_config(user=request.user, request=request)
            
            # Increment Academic Year
            old_year = school.current_year
            new_school_year = old_year + 1
            school.current_year = new_school_year
            school.current_term = "TERM_1"
            school.save(update_fields=['current_year', 'current_term'])
            
            new_academic_year_str = f"{new_school_year}-{new_school_year + 1}"
            
            # Get all Grade objects for THIS school indexed by name for quick lookup
            all_grades = {g.name: g for g in Grade.objects.filter(school=school)}
            
            total_promoted = 0
            
            for current_name in processing_order:
                current_grade = all_grades.get(current_name)
                if not current_grade:
                    continue
                    
                target_name = grade_map.get(current_name)
                
                # Get students in this specific grade for this school
                students_qs = Student.objects.filter(grade=current_grade, school=school)
                count = students_qs.count()
                
                if count > 0:
                    if target_name is None:
                        # Graduation: Remove grade, reset term, but update academic year for record
                        students_qs.update(
                            grade=None, 
                            current_term=1, 
                            academic_year=new_academic_year_str
                        )
                    else:
                        target_grade = all_grades.get(target_name)
                        if target_grade:
                            # Move to next grade and ADAPT changes (Fees from new grade)
                            students_qs.update(
                                grade=target_grade, 
                                current_term=1,
                                academic_year=new_academic_year_str,
                                term1_fees=target_grade.term1_fees,
                                term2_fees=target_grade.term2_fees,
                                term3_fees=target_grade.term3_fees
                            )
                    
                    total_promoted += count
            
            # Update Term model if it exists for the new year
            # First, unset existing current terms for this school
            Term.objects.filter(school=school, is_current=True).update(is_current=False)
            
            # Create or update Term 1 for the new year
            term_obj, created = Term.objects.get_or_create(
                school=school, 
                number=1, 
                year=new_school_year,
                defaults={
                    'start_date': timezone.now(),
                    'end_date': timezone.now() + timezone.timedelta(days=90),
                    'is_current': True
                }
            )
            if not created:
                term_obj.is_current = True
                term_obj.save()
            
            return JsonResponse({
                'success': True, 
                'message': f'Successfully advanced to Academic Year {new_school_year}. {total_promoted} students promoted to their next class with updated fee structures.'
            })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
@require_http_methods(["POST"])
def api_update_term(request):
    """Updates the current term for all active student accounts."""
    try:
        data = json.loads(request.body)
        new_term = data.get('term')
        
        if not new_term:
             return JsonResponse({'error': 'Term is required'}, status=400)
             
        new_term = int(new_term)
        
        if new_term not in [1, 2, 3]:
            return JsonResponse({'error': 'Invalid term. Must be 1, 2, or 3.'}, status=400)
            
        with transaction.atomic():
            # Get current school context
            school = SchoolConfig.get_config(user=request.user, request=request)
            
            # 1. Update students for THIS school who are assigned to a grade (active students)
            updated_count = Student.objects.filter(school=school, grade__isnull=False).update(current_term=new_term)
            
            # 2. Update SchoolConfig
            school.current_term = f"TERM_{new_term}"
            school.save(update_fields=['current_term'])
            
            # 3. Update Term model if it exists
            term_obj = Term.objects.filter(school=school, number=new_term, year=school.current_year).first()
            if term_obj:
                term_obj.is_current = True
                term_obj.save() # save() handles resetting others for this school
        
        return JsonResponse({
            'success': True, 
            'message': f'Successfully moved {updated_count} students to Term {new_term}.'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
