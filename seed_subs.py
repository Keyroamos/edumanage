from config.models import SchoolConfig, SubscriptionPayment
from decimal import Decimal
import uuid

def seed_revenue():
    schools = SchoolConfig.objects.filter(subscription_status='Active')
    for s in schools:
        amount = 3499 if s.subscription_plan == 'Enterprise' else (2499 if s.subscription_plan == 'Standard' else 1499)
        SubscriptionPayment.objects.get_or_create(
            school=s, 
            plan=s.subscription_plan, 
            defaults={
                'amount': Decimal(str(amount)), 
                'reference': f'INITIAL_ACTIVATE_{uuid.uuid4().hex[:8]}', 
                'status': 'COMPLETED'
            }
        )
        print(f"Seeded payment for {s.school_name}")

if __name__ == "__main__":
    seed_revenue()
