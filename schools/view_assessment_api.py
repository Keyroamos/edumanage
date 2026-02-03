from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from .models import Subject, Student, Assessment, AssessmentResult

@csrf_exempt
@require_http_methods(["POST"])
@login_required
@csrf_exempt
@require_http_methods(["POST"])
@login_required
def api_assessment_batch_save(request):
    """API endpoint for batch saving assessment results"""
    try:
        from config.models import SchoolConfig
        school = SchoolConfig.get_config(user=request.user, request=request)
        import json
        data = json.loads(request.body)
        
        # New Flow: Student-Centric (Single Student, Multiple Subjects)
        if 'student_id' in data and isinstance(data.get('results'), list):
            student_id = data.get('student_id')
            assessment_type = data.get('assessment_type')
            term = data.get('term')
            date_str = data.get('date')
            results = data.get('results') # List of {subject_id, marks}

            if not all([student_id, assessment_type, term, date_str]):
                return JsonResponse({'error': 'Missing required fields'}, status=400)
                
            student = Student.objects.get(pk=student_id, school=school)
            
            # Create/Get Assessment Container
            assessment, created = Assessment.objects.get_or_create(
                student=student,
                assessment_type=assessment_type,
                term=term,
                school=school,
                defaults={
                    'date': date_str,
                    'recorded_by': request.user
                }
            )
            
            saved_count = 0
            for item in results:
                subject_id = item.get('subject_id')
                marks = item.get('marks')
                
                if not subject_id or marks is None or marks == '':
                    continue
                    
                subject = Subject.objects.get(pk=subject_id)
                
                try:
                    marks_float = float(marks)
                except ValueError:
                    continue
                    
                performance_level = '1'
                if marks_float >= 80: performance_level = '4'
                elif marks_float >= 60: performance_level = '3'
                elif marks_float >= 40: performance_level = '2'
                
                AssessmentResult.objects.update_or_create(
                    assessment=assessment,
                    subject=subject,
                    defaults={
                        'marks': marks_float,
                        'performance_level': performance_level,
                        'weekly_score': marks_float if assessment_type == 'weekly' else None,
                        'opener_score': marks_float if assessment_type == 'opener' else None,
                        'midpoint_score': marks_float if assessment_type == 'mid-term' else None,
                        'endpoint_score': marks_float if assessment_type == 'end-term' else None,
                    }
                )
                saved_count += 1
                
            return JsonResponse({'success': True, 'saved_count': saved_count})
        
        # Old Flow: Subject-Centric (Single Subject, Multiple Students) - Keeping for potential fallback
        else:
            grade_id = data.get('grade_id')
            subject_id = data.get('subject_id')
            assessment_type = data.get('assessment_type')
            term = data.get('term')
            date_str = data.get('date')
            results = data.get('results', []) # List of {student_id, marks}
            
            # Validation
            if not all([grade_id, subject_id, assessment_type, term, date_str]):
                return JsonResponse({'error': 'Missing required fields'}, status=400)
                
            subject = Subject.objects.get(pk=subject_id)
            
            saved_count = 0
            
            for item in results:
                student_id = item.get('student_id')
                marks = item.get('marks')
                
                if not student_id or marks is None or marks == '':
                    continue
                    
                student = Student.objects.get(pk=student_id, school=school)
                
                assessment, created = Assessment.objects.get_or_create(
                    student=student,
                    assessment_type=assessment_type,
                    term=term,
                    school=school,
                    defaults={
                        'date': date_str,
                        'recorded_by': request.user
                    }
                )
                
                try:
                    marks_float = float(marks)
                except ValueError:
                    continue
                    
                performance_level = '1'
                if marks_float >= 80: performance_level = '4'
                elif marks_float >= 60: performance_level = '3'
                elif marks_float >= 40: performance_level = '2'
                
                result, result_created = AssessmentResult.objects.update_or_create(
                    assessment=assessment,
                    subject=subject,
                    defaults={
                        'marks': marks_float,
                        'performance_level': performance_level,
                        # Populate specific score fields based on type for legacy support
                        'weekly_score': marks_float if assessment_type == 'weekly' else None,
                        'opener_score': marks_float if assessment_type == 'opener' else None,
                        'midpoint_score': marks_float if assessment_type == 'mid-term' else None,
                        'endpoint_score': marks_float if assessment_type == 'end-term' else None,
                    }
                )
                saved_count += 1
                
            return JsonResponse({'success': True, 'saved_count': saved_count})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
@login_required
def api_academic_analytics(request):
    """API endpoint for fetching academic reports and analytics"""
    try:
        from config.models import SchoolConfig
        school = SchoolConfig.get_config(user=request.user, request=request)
        from django.db.models import Avg, Count, Sum, F
        
        grade_id = request.GET.get('grade_id')
        term = request.GET.get('term')
        assessment_type = request.GET.get('type')
        
        if not grade_id:
            return JsonResponse({'error': 'Grade ID is required'}, status=400)
            
        # Base Query: Assessments for the grade, term and type
        assessments = Assessment.objects.filter(
            student__grade_id=grade_id,
            school=school
        )
        
        if term:
            assessments = assessments.filter(term=term)
        if assessment_type:
            assessments = assessments.filter(assessment_type=assessment_type)
            
        # 1. Subject Performance (Average Score per Subject)
        subject_performance = AssessmentResult.objects.filter(
            assessment__in=assessments
        ).values('subject__name', 'subject__code').annotate(
            avg_score=Avg('marks')
        ).order_by('-avg_score')
        
        # 2. Performance Distribution (Count of 4s, 3s, 2s, 1s)
        distribution = AssessmentResult.objects.filter(
            assessment__in=assessments
        ).values('performance_level').annotate(
            count=Count('id')
        ).order_by('performance_level')
        
        # 3. Student Merit List
        # We need to sum marks for each student across all subjects in this assessment scope
        # This is complex in Django ORM without subqueries, so we iterate for simplicity or use efficient aggregation
        
        students = Student.objects.filter(grade_id=grade_id, school=school)
        merit_list = []
        
        for student in students:
            student_assessments = assessments.filter(student=student)
            results = AssessmentResult.objects.filter(assessment__in=student_assessments)
            
            total_marks = results.aggregate(Sum('marks'))['marks__sum'] or 0
            avg_score = results.aggregate(Avg('marks'))['marks__avg'] or 0
            subjects_count = results.count()
            
            # Determine overall grade based on avg
            overall_grade = 'Below'
            if avg_score >= 80: overall_grade = 'Exceeding'
            elif avg_score >= 60: overall_grade = 'Meeting'
            elif avg_score >= 40: overall_grade = 'Approaching'
            
            merit_list.append({
                'id': student.id,
                'admission_number': student.admission_number,
                'full_name': student.get_full_name(),
                'photo': student.get_photo_url(),
                'total_marks': float(total_marks),
                'average': round(float(avg_score), 1),
                'subjects_sat': subjects_count,
                'grade': overall_grade
            })
            
        # Sort merit list by total marks
        merit_list.sort(key=lambda x: x['total_marks'], reverse=True)
        
        # Assign ranks
        for i, item in enumerate(merit_list):
            item['rank'] = i + 1
            
        data = {
            'subject_performance': list(subject_performance),
            'distribution': {
                'exceeding': next((d['count'] for d in distribution if d['performance_level'] == '4'), 0),
                'meeting': next((d['count'] for d in distribution if d['performance_level'] == '3'), 0),
                'approaching': next((d['count'] for d in distribution if d['performance_level'] == '2'), 0),
                'below': next((d['count'] for d in distribution if d['performance_level'] == '1'), 0),
            },
            'merit_list': merit_list
        }
        
        return JsonResponse({'analytics': data})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
