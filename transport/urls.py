from django.urls import path
from . import views

urlpatterns = [
    path('api/transport/dashboard/', views.api_transport_dashboard, name='api_transport_dashboard'),
    path('api/transport/students/', views.api_transport_students, name='api_transport_students'),
    path('api/transport/students/<int:student_id>/', views.api_transport_student_detail, name='api_transport_student_detail'),
    path('api/transport/routes/<int:route_id>/', views.api_transport_route_detail, name='api_transport_route_detail'),
    path('api/transport/routes/', views.api_transport_routes, name='api_transport_routes'),
    path('api/transport/vehicles/', views.api_transport_vehicles, name='api_transport_vehicles'),
    path('api/transport/vehicles/<int:vehicle_id>/', views.api_transport_vehicle_detail, name='api_transport_vehicle_detail'),
    path('api/transport/drivers/', views.api_transport_drivers, name='api_transport_drivers'),
    path('api/transport/drivers/<int:driver_id>/', views.api_transport_driver_detail, name='api_transport_driver_detail'),
    path('api/transport/driver/dashboard/', views.api_driver_dashboard, name='api_driver_dashboard'),
    path('api/transport/student/<int:student_id>/location/update/', views.api_update_student_transport_location, name='api_update_student_transport_location'),
    path('api/driver/expenses/', views.api_driver_expenses, name='api_driver_expenses'),
    path('api/driver/leaves/', views.api_driver_leaves, name='api_driver_leaves'),
    path('api/driver/advances/', views.api_driver_advances, name='api_driver_advances'),
    path('api/transport/finance/expenses/', views.api_transport_finance_expenses, name='api_transport_finance_expenses'),
    path('api/transport/finance/advances/', views.api_transport_finance_advances, name='api_transport_finance_advances'),
]
