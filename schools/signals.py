from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Grade, Student, Teacher, NonTeachingStaff
from .user_utils import create_staff_user

@receiver(post_save, sender=Grade)
def update_student_fees(sender, instance, **kwargs):
    """Update fees for all students in the grade when grade fees change"""
    # Get all students in this grade (removed is_active filter)
    students = Student.objects.filter(grade=instance)
    
    # Update each student's fees
    students.update(
        term1_fees=instance.term1_fees,
        term2_fees=instance.term2_fees,
        term3_fees=instance.term3_fees
    )

@receiver(post_save, sender=Teacher)
def auto_create_teacher_user(sender, instance, created, **kwargs):
    """Automatically create a user account for a new teacher"""
    if created or not instance.user:
        create_staff_user(instance, instance.school)

@receiver(post_save, sender=NonTeachingStaff)
def auto_create_staff_user(sender, instance, created, **kwargs):
    """Automatically create a user account for a new non-teaching staff member"""
    if created or not instance.user:
        create_staff_user(instance, instance.school)