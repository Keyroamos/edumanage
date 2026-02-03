from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_finance_dashboard, name='api_finance_dashboard_root'),
    path('dashboard/', views.api_finance_dashboard, name='api_finance_dashboard'),
    path('students/', views.api_finance_students, name='api_finance_students'),
    path('students/<int:student_id>/', views.api_finance_student_detail, name='api_finance_student_detail'),
    path('transactions/<int:transaction_id>/', views.api_finance_transaction_detail, name='api_finance_transaction_detail'),
    path('transactions/<int:transaction_id>/pdf/', views.api_download_transaction_pdf, name='api_download_transaction_pdf'),
    path('transactions/', views.api_finance_transactions, name='api_finance_transactions'),
    path('transactions/all/', views.api_finance_all_transactions, name='api_finance_all_transactions'),
    path('reports/', views.api_finance_reports, name='api_finance_reports'),
    # Add simpler path for API consistency if needed
    path('salaries/', views.api_finance_salaries, name='api_finance_salaries'),
    path('salaries/process/', views.api_finance_payroll_process, name='api_finance_payroll_process'),
    path('salaries/<int:user_id>/update/', views.api_finance_salary_update, name='api_finance_salary_update'),
    path('fee-structures/', views.api_fee_structures, name='api_fee_structures'),
    path('fee-structures/create/', views.api_create_fee_structure, name='api_create_fee_structure'),
    path('fee-structures/<int:fee_id>/', views.api_delete_fee_structure, name='api_delete_fee_structure'),
    path('fee-structures/update/', views.api_update_fee_structure, name='api_update_fee_structure'),
    path('fee-structures/bulk-create/', views.api_bulk_create_fee_structure, name='api_bulk_create_fee_structure'),
    path('fee-structures/clone/', views.api_clone_fee_structure, name='api_clone_fee_structure'),
    path('fee-categories/', views.api_fee_categories, name='api_fee_categories'),
    path('student-fee-summary/', views.api_student_fee_summary, name='api_student_fee_summary'),
    path('transport-summary/', views.api_transport_finance_summary, name='api_transport_finance_summary'),
    path('catering-summary/', views.api_food_finance_summary, name='api_food_finance_summary'),
    path('arrears/', views.api_finance_arrears, name='api_finance_arrears'),
]
