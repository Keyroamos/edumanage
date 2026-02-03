import os
import django
from django.conf import settings
from twilio.rest import Client
import time

# Configure settings
if not settings.configured:
    settings.configure(
        TWILIO_ACCOUNT_SID='ACbf8f63ebaaedc816f480f1ff1cbc2149',
        TWILIO_AUTH_TOKEN='d24d9b522cb48ef2c77b49fe631d38a6',
        TWILIO_PHONE_NUMBER='+15188392817',
    )
    django.setup()

def deep_diagnose_sms():
    print("="*50)
    print("TWILIO SMS DIAGNOSTIC TOOL")
    print("="*50)
    
    sid = settings.TWILIO_ACCOUNT_SID
    print(f"1. USING ACCOUNT SID: {sid}")
    print("   (Please verify this MATCHES the account you edited in Twilio Console)")
    print(f"2. SENDING FROM:      {settings.TWILIO_PHONE_NUMBER}")
    
    client = Client(sid, settings.TWILIO_AUTH_TOKEN)
    
    # Try fetching account details to verify credentials and status
    try:
        account = client.api.accounts(sid).fetch()
        print(f"3. ACCOUNT STATUS:    {account.status.upper()}")
        print(f"   ACCOUNT TYPE:      {account.type.upper()}")
        print(f"   FRIENDLY NAME:     {account.friendly_name}")
    except Exception as e:
        print(f"   [!] Could not fetch account details: {e}")

    # Target: The number that failed
    to_number = '+254720990929'
    
    print("-" * 50)
    print(f"Attempting to send test SMS to {to_number}...")
    
    try:
        msg = client.messages.create(
            body="Test from EduManage Debugger - Verifying Kenya Connectivity",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to_number
        )
        print(f"\nSUCCESS! Message sent.")
        print(f"SID: {msg.sid}")
        print(f"Status: {msg.status}")
    except Exception as e:
        print(f"\n[FAILED] Message rejected by Twilio.")
        print(f"Error Code: {getattr(e, 'code', 'Unknown')}")
        print(f"Message: {str(e)}")
        
        if getattr(e, 'code', 0) == 21612:
            print("\nAnalysis: ERROR 21612")
            print("1. This CONFIRMS 'Geo Permissions' or 'Route' issue.")
            print("2. If you enabled Kenya, wait 5-10 mins for it to propagate.")
            print("3. Verify you are in the CORRECT account: " + sid)
            print("4. Some US numbers cannot send to international routes without upgrading.")
            
    print("="*50)

if __name__ == "__main__":
    deep_diagnose_sms()
