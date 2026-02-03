"""
Management command to clear all data from the system
WARNING: This will delete all students, staff, and records!
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from schools.models import (
    # Student related
    Student, Assessment, AssessmentResult, Payment, Attendance,
    StudentTransportAssignment, TransportFee, StudentFoodAssignment,
    FoodFee, StudentMealPayment, MealConsumption,
    # Staff related
    Teacher, Employee, Salary, Allowance, Deduction, Leave, EmployeeAttendance,
    # Other records
    SMSMessage, Schedule, Term,
    # Sync related
    SyncQueue, SyncStatus,
    # Reference data (optional to keep)
    Grade, Subject, Department, School, Route, Vehicle, FoodPlan, MealPricing
)
import os
from django.conf import settings


class Command(BaseCommand):
    help = 'Clear all data from the system (students, staff, and all records)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep-reference-data',
            action='store_true',
            help='Keep reference data like Grades, Subjects, Departments, etc.',
        )
        parser.add_argument(
            '--keep-users',
            action='store_true',
            help='Keep user accounts (only delete student/teacher linked users)',
        )
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Skip confirmation prompt (use with caution!)',
        )

    def handle(self, *args, **options):
        keep_reference = options.get('keep_reference_data', False)
        keep_users = options.get('keep_users', False)
        confirmed = options.get('confirm', False)

        if not confirmed:
            self.stdout.write(self.style.WARNING(
                '\n' + '='*70 + '\n'
                'WARNING: This will DELETE ALL DATA from the system!\n'
                'This includes:\n'
                '  - All students and their records\n'
                '  - All staff/employees and their records\n'
                '  - All payments, assessments, attendance records\n'
                '  - All transport, food, and meal records\n'
                '  - All SMS messages and schedules\n'
            ))
            if not keep_reference:
                self.stdout.write(self.style.WARNING(
                '  - All grades, subjects, departments\n'
                ))
            self.stdout.write(self.style.WARNING('='*70 + '\n'))
            
            response = input('Type "YES" to confirm deletion: ')
            if response != 'YES':
                self.stdout.write(self.style.ERROR('Operation cancelled.'))
                return

        self.stdout.write(self.style.WARNING('Starting data deletion...\n'))

        # Track counts
        counts = {}

        try:
            # 1. Delete child records first (to avoid foreign key constraints)
            
            # Meal related
            counts['MealConsumption'] = MealConsumption.objects.count()
            MealConsumption.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["MealConsumption"]} meal consumption records')
            
            counts['StudentMealPayment'] = StudentMealPayment.objects.count()
            StudentMealPayment.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["StudentMealPayment"]} meal payment records')
            
            counts['FoodFee'] = FoodFee.objects.count()
            FoodFee.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["FoodFee"]} food fee records')
            
            counts['StudentFoodAssignment'] = StudentFoodAssignment.objects.count()
            StudentFoodAssignment.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["StudentFoodAssignment"]} food assignment records')
            
            # Transport related
            counts['TransportFee'] = TransportFee.objects.count()
            TransportFee.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["TransportFee"]} transport fee records')
            
            counts['StudentTransportAssignment'] = StudentTransportAssignment.objects.count()
            StudentTransportAssignment.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["StudentTransportAssignment"]} transport assignment records')
            
            # Assessment related
            counts['AssessmentResult'] = AssessmentResult.objects.count()
            AssessmentResult.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["AssessmentResult"]} assessment result records')
            
            counts['Assessment'] = Assessment.objects.count()
            Assessment.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["Assessment"]} assessment records')
            
            # Payment and attendance
            counts['Payment'] = Payment.objects.count()
            Payment.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["Payment"]} payment records')
            
            counts['Attendance'] = Attendance.objects.count()
            Attendance.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["Attendance"]} attendance records')
            
            # Staff related records
            counts['Allowance'] = Allowance.objects.count()
            Allowance.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["Allowance"]} allowance records')
            
            counts['Deduction'] = Deduction.objects.count()
            Deduction.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["Deduction"]} deduction records')
            
            counts['Salary'] = Salary.objects.count()
            Salary.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["Salary"]} salary records')
            
            counts['Leave'] = Leave.objects.count()
            Leave.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["Leave"]} leave records')
            
            counts['EmployeeAttendance'] = EmployeeAttendance.objects.count()
            EmployeeAttendance.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["EmployeeAttendance"]} employee attendance records')
            
            # Other records
            counts['SMSMessage'] = SMSMessage.objects.count()
            SMSMessage.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["SMSMessage"]} SMS message records')
            
            counts['Schedule'] = Schedule.objects.count()
            Schedule.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["Schedule"]} schedule records')
            
            # Sync records
            counts['SyncQueue'] = SyncQueue.objects.count()
            SyncQueue.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["SyncQueue"]} sync queue records')
            
            # 2. Delete main records (Students and Staff)
            
            # Get teacher user IDs before deletion (Student users will be auto-deleted due to CASCADE)
            teacher_user_ids = list(Teacher.objects.filter(user__isnull=False).values_list('user_id', flat=True))
            
            counts['Student'] = Student.objects.count()
            # Note: Deleting Student will automatically delete linked Users due to CASCADE
            Student.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["Student"]} student records (and their linked user accounts)')
            
            counts['Teacher'] = Teacher.objects.count()
            Teacher.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["Teacher"]} teacher records')
            
            counts['Employee'] = Employee.objects.count()
            Employee.objects.all().delete()
            self.stdout.write(f'  ✓ Deleted {counts["Employee"]} employee records')
            
            # 3. Delete teacher-linked user accounts (Teacher.user has SET_NULL, so we need to delete manually)
            if not keep_users:
                counts['User'] = len(teacher_user_ids)
                if teacher_user_ids:
                    User.objects.filter(id__in=teacher_user_ids).delete()
                    self.stdout.write(f'  ✓ Deleted {counts["User"]} teacher-linked user accounts')
                else:
                    self.stdout.write('  ✓ No additional user accounts to delete')
            else:
                self.stdout.write('  ✓ Kept user accounts (as requested)')
            
            # 4. Delete reference data (if not keeping)
            if not keep_reference:
                counts['Term'] = Term.objects.count()
                Term.objects.all().delete()
                self.stdout.write(f'  ✓ Deleted {counts["Term"]} term records')
                
                counts['Vehicle'] = Vehicle.objects.count()
                Vehicle.objects.all().delete()
                self.stdout.write(f'  ✓ Deleted {counts["Vehicle"]} vehicle records')
                
                counts['Route'] = Route.objects.count()
                Route.objects.all().delete()
                self.stdout.write(f'  ✓ Deleted {counts["Route"]} route records')
                
                counts['FoodPlan'] = FoodPlan.objects.count()
                FoodPlan.objects.all().delete()
                self.stdout.write(f'  ✓ Deleted {counts["FoodPlan"]} food plan records')
                
                counts['MealPricing'] = MealPricing.objects.count()
                MealPricing.objects.all().delete()
                self.stdout.write(f'  ✓ Deleted {counts["MealPricing"]} meal pricing records')
                
                counts['Grade'] = Grade.objects.count()
                Grade.objects.all().delete()
                self.stdout.write(f'  ✓ Deleted {counts["Grade"]} grade records')
                
                counts['Subject'] = Subject.objects.count()
                Subject.objects.all().delete()
                self.stdout.write(f'  ✓ Deleted {counts["Subject"]} subject records')
                
                counts['Department'] = Department.objects.count()
                Department.objects.all().delete()
                self.stdout.write(f'  ✓ Deleted {counts["Department"]} department records')
                
                counts['School'] = School.objects.count()
                School.objects.all().delete()
                self.stdout.write(f'  ✓ Deleted {counts["School"]} school records')
            else:
                self.stdout.write('  ✓ Kept reference data (Grades, Subjects, Departments, etc.)')
            
            # 5. Reset SyncStatus (keep the record but reset it)
            sync_status = SyncStatus.objects.first()
            if sync_status:
                sync_status.pending_count = 0
                sync_status.failed_count = 0
                sync_status.save()
                self.stdout.write('  ✓ Reset sync status')
            
            # Summary
            total_deleted = sum(counts.values())
            self.stdout.write(self.style.SUCCESS(
                f'\n{"="*70}\n'
                f'Successfully cleared all data!\n'
                f'Total records deleted: {total_deleted}\n'
                f'{"="*70}\n'
            ))
            
            # Note about media files
            self.stdout.write(self.style.WARNING(
                '\nNote: Media files (photos, certificates, etc.) in the media/ directory\n'
                'have NOT been deleted. You may want to manually clean them up if needed.\n'
            ))

        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f'\nError occurred during deletion: {str(e)}\n'
                'Some data may have been partially deleted. Please check the database.\n'
            ))
            raise

