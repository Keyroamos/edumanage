import requests
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def is_paystack_test_mode():
    return settings.PAYSTACK_SECRET_KEY.startswith('sk_test')

def initiate_paystack_stk(phone, amount, email, reference, school_name):
    """
    Initiate an M-Pesa STK Push via Paystack (Charge API)
    """
    url = "https://api.paystack.co/charge"
    
    # For Kenya M-Pesa, Paystack Charge API expects +254... format (13 characters)
    clean_phone = phone.strip().replace(' ', '').replace('-', '')
    if clean_phone.startswith('+'):
        clean_phone = clean_phone[1:]
    if clean_phone.startswith('254'):
        pass
    elif clean_phone.startswith('0'):
        clean_phone = '254' + clean_phone[1:]
    else:
        clean_phone = '254' + clean_phone
    
    clean_phone = '+' + clean_phone
    
    # Paystack amount is in kobo/cents
    paystack_amount = int(float(amount) * 100)
    
    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "email": email,
        "amount": paystack_amount,
        "reference": reference,
        "currency": "KES",
        "country_code": "KE",
        "mobile_money": {
            "phone": clean_phone,
            "provider": "mpesa"
        },
        "metadata": {
            "school_name": school_name,
            "custom_fields": [
                {
                    "display_name": "School Name",
                    "variable_name": "school_name",
                    "value": school_name
                }
            ]
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        response_data = response.json()
        print(f"DEBUG: Paystack response for {clean_phone}: {response_data}")
        
        if response.status_code == 200 and response_data.get('status'):
            data = response_data.get('data', {})
            return data.get('reference'), None
        else:
            # Try to get a more specific error message from paystack
            error_msg = response_data.get('message', 'Unknown error')
            if 'errors' in response_data:
                error_msg += f": {json.dumps(response_data['errors'])}"
            elif not response_data.get('status') and 'data' in response_data:
                error_msg += f": {response_data.get('data', {}).get('message', '')}"
                
            logger.error(f"Paystack Error: {error_msg} (Status: {response.status_code})")
            return None, error_msg
            
    except Exception as e:
        logger.error(f"Paystack Exception: {str(e)}")
        return None, str(e)

def verify_paystack_payment(reference):
    """
    Verify a payment reference with Paystack
    """
    url = f"https://api.paystack.co/transaction/verify/{reference}"
    
    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()
        
        if data.get('status') and data.get('data', {}).get('status') == 'success':
            return True, data['data']
        return False, data.get('message', 'Verification failed')
    except Exception as e:
        return False, str(e)
