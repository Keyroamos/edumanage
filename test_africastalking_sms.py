"""
Quick test script for Africa's Talking SMS integration
Run this to verify your SMS setup is working correctly
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from schools.utils.sms import send_bulk_sms, format_phone_number

def test_sms_setup():
    print("=" * 60)
    print("AFRICA'S TALKING SMS TEST")
    print("=" * 60)
    
    # Test phone number formatting
    print("\n1. Testing phone number formatting...")
    test_numbers = [
        '0748403481',
        '748403481',
        '+254748403481',
        '254748403481'
    ]
    
    for num in test_numbers:
        formatted = format_phone_number(num)
        print(f"   {num:20} → {formatted}")
    
    # Test SMS sending
    print("\n2. Testing SMS sending...")
    print("   Enter a phone number to send a test SMS to:")
    print("   (Press Enter to skip)")
    
    phone = input("   Phone number: ").strip()
    
    if phone:
        formatted_phone = format_phone_number(phone)
        print(f"\n   Sending test SMS to: {formatted_phone}")
        
        message = "Hello! This is a test message from your EduManage system using Africa's Talking. 🎉"
        
        success, response = send_bulk_sms([formatted_phone], message)
        
        print("\n" + "=" * 60)
        if success:
            print("✅ SUCCESS! SMS sent successfully!")
            print("\nResponse details:")
            print(f"   Success count: {response.get('success_count', 0)}")
            print(f"   Total count: {response.get('total_count', 0)}")
            
            if 'results' in response:
                for result in response['results']:
                    print(f"\n   Number: {result.get('number')}")
                    print(f"   Status: {result.get('status')}")
                    print(f"   Message ID: {result.get('message_id')}")
                    print(f"   Cost: {result.get('cost', 'N/A')}")
        else:
            print("❌ FAILED! SMS could not be sent.")
            print(f"\nError: {response}")
            
            if "UserInBlacklist" in str(response):
                print("\n💡 TIP: Add this number to your sandbox test numbers:")
                print("   1. Go to: https://account.africastalking.com/")
                print("   2. Navigate to: SMS → Test Numbers")
                print("   3. Add the phone number to your whitelist")
        print("=" * 60)
    else:
        print("   Skipped SMS sending test.")
    
    print("\n3. Configuration check...")
    from django.conf import settings
    
    username = getattr(settings, 'AFRICASTALKING_USERNAME', None)
    api_key = getattr(settings, 'AFRICASTALKING_API_KEY', None)
    sender_id = getattr(settings, 'AFRICASTALKING_SENDER_ID', None)
    
    print(f"   Username: {username}")
    print(f"   API Key: {'*' * 20}{api_key[-10:] if api_key else 'NOT SET'}")
    print(f"   Sender ID: {sender_id if sender_id else 'Not configured (using default)'}")
    
    print("\n" + "=" * 60)
    print("Test complete!")
    print("=" * 60)

if __name__ == '__main__':
    try:
        test_sms_setup()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
