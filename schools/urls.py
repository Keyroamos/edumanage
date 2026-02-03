from django.urls import path, include
from . import views
from . import hr_views
from . import views_finance
from . import views_super

urlpatterns = [
    # Landing Page
    #path('', views.index, name='index'),
    
    # CSRF Token Endpoint
    path('api/csrf/', views.get_csrf_token, name='get_csrf_token'),
    
    # Authentication
    path('api/dashboard/', views.api_dashboard, name='api_dashboard'),
    path('api/students/', views.api_student_list, name='api_student_list'),
    path('api/students/create/', views.api_student_create, name='api_student_create'),
    path('api/students/bulk-import/', views.api_students_bulk_import, name='api_students_bulk_import'),
    path('api/students/template/', views.download_student_template, name='api_students_template'),
    path('api/students/<int:pk>/', views.api_student_detail, name='api_student_detail'),
    path('api/students/bulk-delete/', views.api_student_bulk_delete, name='api_student_bulk_delete'),
    path('api/students/<int:student_id>/academics/', views.api_student_academic_records, name='api_student_academic_records'),
    path('api/students/<int:student_id>/attendance/', views.api_student_attendance, name='api_student_attendance'),
    path('api/students/<int:student_id>/attendance/mark/', views.api_student_attendance_mark_single, name='api_student_attendance_mark_single'),
    path('api/students/<int:student_id>/payment/add/', views.api_student_payment_add, name='api_student_payment_add'),
    path('api/grades/', views.api_grades, name='api_grades'),
    path('api/grades/<int:pk>/fees/', views.api_grade_update_fees, name='api_grade_update_fees'),
    path('api/students/promote/', views.api_promote_students, name='api_promote_students'),
    path('api/students/update-term/', views.api_update_term, name='api_update_term'),
    path('api/teachers/', views.api_teacher_list, name='api_teacher_list'),
    path('api/teachers/create/', views.api_teacher_create, name='api_teacher_create'),
    path('api/teachers/<int:pk>/', views.api_teacher_detail, name='api_teacher_detail'),
    path('api/teachers/<int:pk>/request-leave/', views.api_teacher_request_leave, name='api_teacher_request_leave'),
    path('api/teachers/<int:pk>/request-advance/', views.api_teacher_request_advance, name='api_teacher_request_advance'),
    path('api/subjects/', views.api_subjects, name='api_subjects'),
    # path('api/finance/', views.api_finance_stats, name='api_finance_stats'),
    # path('api/finance/payment/', views.api_payment_create, name='api_payment_create'),
    # path('api/finance/transactions/', views.api_transactions_list, name='api_transactions_list'),
    path('api/schedule/', views.api_schedule, name='api_schedule'),
    path('api/schedule/delete/<int:pk>/', views.api_schedule_delete, name='api_schedule_delete'),
    path('api/config/', views.api_school_config, name='api_school_config'),
    path('api/config/update/', views.api_school_config_update, name='api_school_config_update'),
    path('api/config/regenerate-portal/', views.api_regenerate_portal_slug, name='api_regenerate_portal_slug'),
    path('api/branches/', views.api_branches, name='api_branches'),
    path('api/departments/', views.api_departments, name='api_departments'),
    path('api/branches/<int:pk>/', views.api_branch_delete, name='api_branch_delete'),
    path('api/search/', views.api_search, name='api_search'),
    path('api/assessments/batch-save/', views.api_assessment_batch_save, name='api_assessment_batch_save'),
    path('api/assessments/analytics/', views.api_academic_analytics, name='api_academic_analytics'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/auth/login/', views.api_login, name='api_auth_login'),
    path('api/school-signup/', views.api_school_signup, name='api_school_signup'),
    # path('', views.login_view, name='login'),
    path('api/auth/profile/update/', views.api_user_profile_update, name='api_user_profile_update'),
    path('api/auth/password/change/', views.api_change_password, name='api_change_password'),
    path('logout/', views.logout_view, name='logout'),
    
    # M-Pesa / Paystack Integration
    path('api/mpesa/stk-push/', views.stk_push, name='api_mpesa_stk_push'),
    path('api/mpesa/callback/', views.mpesa_callback, name='api_mpesa_callback'),
    path('api/paystack/webhook/', views.paystack_webhook, name='api_paystack_webhook'),
    path('api/paystack/verify-subscription/', views.verify_subscription_payment, name='api_verify_subscription_payment'),
    
    # Super Admin Portal API
    path('api/super-portal/schools/', views_super.api_super_schools_list, name='api_super_schools_list'),
    path('api/super-portal/schools/<int:pk>/', views_super.api_super_school_detail, name='api_super_school_detail'),
    path('api/super-portal/schools/<int:pk>/toggle-active/', views_super.api_super_school_toggle_active, name='api_super_school_toggle_active'),
    path('api/app-status/', views_super.api_app_status, name='api_app_status'),
    path('api/super-portal/stats/', views_super.api_super_stats, name='api_super_stats'),
    path('api/super-portal/subscriptions/', views_super.api_super_subscriptions, name='api_super_subscriptions'),
    path('api/super-portal/settings/', views_super.api_system_settings, name='api_system_settings'),
    
    # Dashboard
    # path('dashboard/', views.dashboard, name='dashboard'),
    
    # Student Management
    path('students/', views.student_list, name='student_list'),
    path('students/create/', views.student_create, name='student_create'),
    path('students/export/', views.export_students, name='export_students'),
    path('students/import/', views.import_students, name='import_students'),
    path('students/download-template/', views.download_student_template, name='download_student_template'),
    path('students/<int:pk>/', views.student_detail, name='student_detail'),
    path('students/<int:pk>/academic/', views.student_academic, name='student_academic'),
    path('students/<int:pk>/finance/', views.student_finance, name='student_finance'),
    path('students/<int:pk>/attendance/', views.student_attendance, name='student_attendance'),
    path('students/<int:pk>/transport/', views.student_transport, name='student_transport'),
    path('students/<int:pk>/meals/', views.student_meals, name='student_meals'),
    path('students/<int:pk>/edit/', views.student_edit, name='student_edit'),
    path('students/<int:pk>/delete/', views.student_delete, name='student_delete'),
    path('students/<int:student_id>/payment/', views.record_payment, name='record_payment'),
    path('student/<int:student_id>/update-term/', views.update_student_term, name='update_student_term'),
    
    # Teacher Management
    path('teachers/', views.teacher_list, name='teacher_list'),
    path('teachers/create/', views.teacher_create, name='teacher_create'),
    path('teachers/<int:pk>/', views.teacher_detail, name='teacher_detail'),
    path('teachers/<int:pk>/edit/', views.teacher_edit, name='teacher_edit'),
    path('teachers/<int:pk>/delete/', views.teacher_delete, name='teacher_delete'),
    path('teachers/<int:pk>/leave/', views.teacher_leave, name='teacher_leave'),
    path('teachers/<int:teacher_id>/schedule/', views.manage_schedule, name='manage_schedule'),
    path('teachers/export/', views.export_teachers, name='export_teachers'),
    path('teachers/import/', views.import_teachers, name='import_teachers'),
    path('teachers/template/', views.download_teacher_template, name='download_teacher_template'),
    path('teachers/<int:teacher_id>/request-leave/', views.request_leave, name='request_leave'),
    path('teachers/<int:teacher_id>/leave/request/', views.leave_request, name='leave_request'),
    path('teachers/<int:teacher_id>/schedule/create/', views.schedule_create, name='schedule_create'),
    
    # Assessment URLs
    path('assessments/', views.assessment_list, name='assessment_list'),
    path('assessments/<int:pk>/', views.assessment_detail, name='assessment_detail'),
    path('assessments/<int:pk>/edit/', views.assessment_edit, name='assessment_edit'),
    path('assessments/<int:pk>/delete/', views.assessment_delete, name='assessment_delete'),
    path('fees/', views.fees_dashboard, name='fees_dashboard'),
    
    # Assessment URLs
    path('assessments/create/', views.assessment_create, name='assessment_create'),
    path('assessments/form/', views.assessment_form, name='assessment_form'),
    path('payments/add/<int:student_id>/', views.payment_add, name='payment_add'),
    path('assessments/record/', views.assessment_record, name='assessment_record'),
    path('assessments/record/<int:student_id>/', views.assessment_record, name='assessment_record_student'),
    path('assessments/weekly/<int:student_id>/', views.weekly_assessment_record, name='weekly_assessment_record'),
    path('assessments/weekly/<int:student_id>/<int:pk>/', views.weekly_assessment_detail, name='weekly_assessment_detail'),
    
    # Attendance URLs
    path('attendance/mark/', views.mark_attendance, name='mark_attendance'),
    path('attendance/mark/<int:student_id>/', views.mark_attendance, name='mark_attendance_student'),
    path('attendance/mark/grade/<int:grade_id>/', views.mark_attendance, name='mark_attendance_grade'),
    path('api/attendance/mark/batch/', views.api_attendance_mark_batch, name='api_attendance_mark_batch'),
    path('api/grades/<int:grade_id>/attendance/', views.api_grade_attendance, name='api_grade_attendance'),
    path('api/grades/<int:grade_id>/subjects/', views.grade_subjects_api, name='grade_subjects_api'),
    path('verify-payment/<str:reference>/', views.verify_payment, name='verify_payment'),
    
    # Payment URLs
    path('payments/', views.all_payments_list, name='payment_list'),  # All payments
    path('payments/student/<int:student_id>/', views.payment_list, name='student_payment_list'),  # Student-specific payments
    path('payments/create/', views.payment_create, name='payment_create'),
    path('payments/<int:pk>/', views.payment_detail, name='payment_detail'),
    path('payments/<int:pk>/edit/', views.payment_edit, name='payment_edit'),
    path('payments/<int:pk>/delete/', views.payment_delete, name='payment_delete'),
    path('payments/<int:pk>/download-pdf/', views.download_payment_pdf, name='download_payment_pdf'),
    
    # Fee Reports
    path('fees/export/', views.export_fee_report, name='export_fee_report'),
    
    # Add this to your existing URL patterns
    path('assessments/<int:pk>/detail/', views.student_assessment_detail, name='student_assessment_detail'),
    path('schedule/<int:pk>/edit/', views.schedule_edit, name='schedule_edit'),
    path('schedule/<int:pk>/delete/', views.schedule_delete, name='schedule_delete'),
    path('schedule/create/<int:teacher_pk>/', views.schedule_create, name='schedule_create'),
    path('class/<int:grade_id>/students/', views.class_students, name='class_students'),
    
    # SMS URLs
    path('sms/', views.sms_list, name='sms_list'),
    path('sms/send/', views.send_sms, name='send_sms'),
    path('api/sms/', views.api_sms_list, name='api_sms_list'),
    path('api/sms/send/bulk/', views.api_sms_send_bulk, name='api_sms_send_bulk'),
    path('api/communication/templates/', views.api_communication_template_list, name='api_communication_template_list'),
    path('api/communication/templates/create/', views.api_communication_template_create, name='api_communication_template_create'),
    
    # New URL for updating all fees
    path('fees/update-all/', views.update_all_fees, name='update_all_fees'),
    
    # Payment Receipt URL
    path('payment/<int:payment_id>/receipt/', views.payment_receipt, name='payment_receipt'),
    
    # Attendance URLs
    path('record-attendance/', views.record_attendance, name='record_attendance'),
    path('student/<int:student_id>/attendance-events/', views.attendance_events, name='attendance_events'),
    
    # Academic Progression
    path('academic/progression/', views.auto_advance_academic, name='academic_progression'),
    
    # Transport URLs
    path('transport/', views.transport_dashboard, name='transport_dashboard'),
    path('transport/vehicles/', views.vehicle_list, name='vehicle_list'),
    path('transport/vehicles/create/', views.vehicle_create, name='vehicle_create'),
    path('transport/vehicles/<int:pk>/', views.vehicle_detail, name='vehicle_detail'),
    path('transport/vehicles/<int:pk>/edit/', views.vehicle_edit, name='vehicle_edit'),
    path('transport/routes/', views.route_list, name='route_list'),
    path('transport/routes/create/', views.route_create, name='route_create'),
    path('transport/routes/<int:pk>/', views.route_detail, name='route_detail'),
    path('transport/routes/<int:pk>/edit/', views.route_edit, name='route_edit'),
    path('transport/assignments/', views.transport_assignment_list, name='transport_assignment_list'),
    path('transport/assignments/create/', views.transport_assignment_create, name='transport_assignment_create'),
    path('transport/assignments/<int:pk>/', views.transport_assignment_detail, name='transport_assignment_detail'),
    path('transport/assignments/<int:pk>/edit/', views.transport_assignment_edit, name='transport_assignment_edit'),
    path('transport/fees/', views.transport_fee_list, name='transport_fee_list'),
    path('transport/fees/create/', views.transport_fee_create, name='transport_fee_create'),
    path('transport/fees/<int:pk>/', views.transport_fee_detail, name='transport_fee_detail'),
    path('transport/fees/student-info/<int:student_id>/', views.get_student_transport_info, name='get_student_transport_info'),
    
    # Meal Payment URLs
    path('meal/', views.meal_dashboard, name='meal_dashboard'),
    path('meal/pricing/', views.meal_pricing_list, name='meal_pricing_list'),
    path('meal/payments/', views.meal_payment_list, name='meal_payment_list'),
    path('api/student/<int:student_id>/location/', views.get_student_location, name='get_student_location'),
    path('meal/payments/create/', views.meal_payment_create, name='meal_payment_create'),
    path('meal/payments/<int:pk>/', views.meal_payment_detail, name='meal_payment_detail'),
    path('meal/payments/<int:pk>/edit/', views.meal_payment_edit, name='meal_payment_edit'),
    path('meal/reports/', views.meal_payment_report, name='meal_payment_report'),
    path('meal/mark-served/', views.mark_meal_served, name='mark_meal_served'),
    
    # Sync URLs
    path('sync/status/', views.sync_status_view, name='sync_status'),
    path('sync/status/api/', views.sync_status_api, name='sync_status_api'),
    path('sync/manual/', views.manual_sync, name='manual_sync'),
    
    # ============================================
    # HR MODULE URLS
    # ============================================
    
    # Staff Management
    path('api/hr/staff/bulk-delete/', views.api_staff_bulk_delete, name='api_staff_bulk_delete'),
    path('api/hr/staff/', hr_views.api_hr_staff_list, name='api_hr_staff_list'),
    path('api/hr/staff/create/', hr_views.api_hr_staff_create, name='api_hr_staff_create'),
    path('api/hr/staff/<int:pk>/', hr_views.api_hr_staff_detail, name='api_hr_staff_detail'),
    path('api/hr/staff/<int:pk>/update/', hr_views.api_hr_staff_update, name='api_hr_staff_update'),
    path('api/hr/staff/<int:pk>/delete/', hr_views.api_hr_staff_delete, name='api_hr_staff_delete'),
    
    # Leave Requests
    path('api/hr/leave-requests/', hr_views.api_hr_leave_requests, name='api_hr_leave_requests'),
    path('api/hr/leave-requests/<int:pk>/approve/', hr_views.api_hr_leave_approve, name='api_hr_leave_approve'),
    path('api/hr/leave-requests/<int:pk>/reject/', hr_views.api_hr_leave_reject, name='api_hr_leave_reject'),
    
    # Salary Advance Requests
    path('api/hr/advance-requests/', hr_views.api_hr_advance_requests, name='api_hr_advance_requests'),
    path('api/hr/advance-requests/<int:pk>/approve/', hr_views.api_hr_advance_approve, name='api_hr_advance_approve'),
    path('api/hr/advance-requests/<int:pk>/reject/', hr_views.api_hr_advance_reject, name='api_hr_advance_reject'),
    
    # Supervisors
    path('api/hr/supervisors/', hr_views.api_supervisors_list, name='api_supervisors_list'),
    path('api/hr/supervisors/<int:pk>/team/', hr_views.api_supervisor_team, name='api_supervisor_team'),
    path('api/hr/supervisors/<int:pk>/pending-requests/', hr_views.api_supervisor_pending_requests, name='api_supervisor_pending_requests'),
    
    # Supervisor Approvals
    path('api/hr/supervisors/leave-requests/<int:pk>/approve/', hr_views.api_supervisor_leave_approve, name='api_supervisor_leave_approve'),
    path('api/hr/supervisors/leave-requests/<int:pk>/reject/', hr_views.api_supervisor_leave_reject, name='api_supervisor_leave_reject'),
    path('api/hr/supervisors/advance-requests/<int:pk>/approve/', hr_views.api_supervisor_advance_approve, name='api_supervisor_advance_approve'),
    path('api/hr/supervisors/advance-requests/<int:pk>/reject/', hr_views.api_supervisor_advance_reject, name='api_supervisor_advance_reject'),
    
    # Simple Finance Expenses
    path('api/finance/expenses/', views_finance.api_expenses, name='api_expenses'),
    path('api/finance/expenses/<int:expense_id>/', views_finance.api_expense_detail, name='api_expense_detail'),
]