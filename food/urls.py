from django.urls import path
from . import views

urlpatterns = [
    path('api/food/dashboard/', views.api_food_dashboard, name='api_food_dashboard'),
    path('api/food/students/', views.api_food_students, name='api_food_students'),
    path('api/food/students/<int:student_id>/', views.api_food_student_detail, name='api_food_student_detail'),
    path('api/food/items/', views.api_food_items, name='api_food_items'),
    path('api/food/serving-list/', views.api_food_serving_list, name='api_food_serving_list'),
    path('api/food/mark-served/', views.api_food_mark_served, name='api_food_mark_served'),
]
