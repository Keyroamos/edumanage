from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from .models import Student, Assessment, AssessmentResult
from django.db.models import Avg, Count

@csrf_exempt
@require_http_methods(["GET"])
@login_required
def api_student_academic_records(request, student_id):
    """API endpoint for fetching a student's academic records"""
    try:
        from config.models import SchoolConfig
        school = SchoolConfig.get_config(user=request.user, request=request)
        student = Student.objects.get(pk=student_id, school=school)
        
        # Get all assessments for this student
        assessments = Assessment.objects.filter(student=student).order_by('-date')
        
        # Group by term and assessment type
        records_by_term = {}
        
        for assessment in assessments:
            term_key = f"Term {assessment.term}"
            if term_key not in records_by_term:
                records_by_term[term_key] = {}
            
            type_key = assessment.assessment_type
            if type_key not in records_by_term[term_key]:
                records_by_term[term_key][type_key] = {
                    'date': str(assessment.date),
                    'subjects': []
                }
            
            # Get all subject results for this assessment
            results = AssessmentResult.objects.filter(assessment=assessment).select_related('subject')
            
            for result in results:
                records_by_term[term_key][type_key]['subjects'].append({
                    'subject_name': result.subject.name,
                    'subject_code': result.subject.code,
                    'marks': float(result.marks),
                    'performance_level': result.performance_level,
                    'performance_label': get_performance_label(result.performance_level)
                })
        
        # Calculate overall statistics
        all_results = AssessmentResult.objects.filter(assessment__student=student)
        
        stats = {
            'total_assessments': assessments.count(),
            'average_score': round(all_results.aggregate(Avg('marks'))['marks__avg'] or 0, 1),
            'subjects_count': all_results.values('subject').distinct().count(),
            'latest_term': f"Term {assessments.first().term}" if assessments.exists() else "N/A"
        }
        
        # Get performance distribution
        distribution = all_results.values('performance_level').annotate(count=Count('id'))
        performance_dist = {
            'exceeding': next((d['count'] for d in distribution if d['performance_level'] == '4'), 0),
            'meeting': next((d['count'] for d in distribution if d['performance_level'] == '3'), 0),
            'approaching': next((d['count'] for d in distribution if d['performance_level'] == '2'), 0),
            'below': next((d['count'] for d in distribution if d['performance_level'] == '1'), 0),
        }
        
        return JsonResponse({
            'success': True,
            'student': {
                'id': student.id,
                'name': student.get_full_name(),
                'admission_number': student.admission_number,
                'grade': student.grade.name if student.grade else 'N/A'
            },
            'stats': stats,
            'performance_distribution': performance_dist,
            'records': records_by_term
        })
        
    except Student.DoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_performance_label(level):
    """Convert performance level to label"""
    labels = {
        '4': 'Exceeding Expectations',
        '3': 'Meeting Expectations',
        '2': 'Approaching Expectations',
        '1': 'Below Expectations'
    }
    return labels.get(level, 'Unknown')
