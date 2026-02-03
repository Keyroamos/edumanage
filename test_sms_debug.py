import os
import django
from django.conf import settings
from twilio.rest import Client

# Configure Django settings (simplified for testing)
if not settings.configured:
    settings.configure(
        TWILIO_ACCOUNT_SID='ACbf8f63ebaaedc816f480f1ff1cbc2149',
        TWILIO_AUTH_TOKEN='d24d9b522cb48ef2c77b49fe631d38a6',
        TWILIO_PHONE_NUMBER='+15188392817',
    )
    django.setup()

def test_send():
    print("Initializing Twilio client...")
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    
    # Target number from user logs
    to_number = '+254720990929'
    from_number = settings.TWILIO_PHONE_NUMBER
    
    print(f"Attempting to send from {from_number} to {to_number}")
    
    try:
        message = client.messages.create(
            body="Test message from EduManage system debug.",
            from_=from_number,
            to=to_number
        )
        print(f"SUCCESS! SID: {message.sid}")
    except Exception as e:
        print("\n!!! ERROR DETAILS !!!")
        print(f"Error Code: {getattr(e, 'code', 'Unknown')}")
        print(f"Error Message: {str(e)}")
        print(f"More Info: {getattr(e, 'more_info', 'N/A')}")
        print("!!!!!!!!!!!!!!!!!!!!!")

if __name__ == "__main__":
    test_send()
