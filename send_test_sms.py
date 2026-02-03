"""
Send a test SMS to verify Africa's Talking integration
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from schools.utils.sms import send_bulk_sms, format_phone_number

def send_test():
    print("=" * 70)
    print("SENDING TEST SMS VIA AFRICA'S TALKING")
    print("=" * 70)
    
    # Phone number to test
    phone = '0720990929'
    formatted_phone = format_phone_number(phone)
    
    print(f"\nPhone number: {phone}")
    print(f"Formatted: {formatted_phone}")
    
    # Test message
    message = "Hello! This is a test message from your EduManage system using Africa's Talking. Your SMS integration is working! 🎉"
    
    print(f"\nMessage: {message}")
    print(f"\nSending SMS...")
    print("-" * 70)
    
    # Send the SMS
    success, response = send_bulk_sms([formatted_phone], message)
    
    print("\n" + "=" * 70)
    if success:
        print("✅ SUCCESS! SMS SENT SUCCESSFULLY!")
        print("=" * 70)
        print("\nResponse details:")
        print(f"  • Success count: {response.get('success_count', 0)}")
        print(f"  • Total count: {response.get('total_count', 0)}")
        
        if 'results' in response:
            for result in response['results']:
                print(f"\n  📱 Number: {result.get('number')}")
                print(f"  ✓ Status: {result.get('status')}")
                print(f"  🆔 Message ID: {result.get('message_id')}")
                print(f"  💰 Cost: {result.get('cost', 'N/A')}")
                print(f"  📊 Status Code: {result.get('status_code')}")
    else:
        print("❌ FAILED! SMS COULD NOT BE SENT")
        print("=" * 70)
        print(f"\n⚠️ Error: {response}")
        
        if "UserInBlacklist" in str(response):
            print("\n" + "=" * 70)
            print("💡 SOLUTION: Add this number to your sandbox test numbers")
            print("=" * 70)
            print("\nSteps to fix:")
            print("1. Go to: https://account.africastalking.com/")
            print("2. Navigate to: SMS → Test Numbers")
            print("3. Click 'Add Test Number'")
            print(f"4. Add: {formatted_phone}")
            print("5. Try sending again")
            print("\nOR move to production mode by topping up your account.")
        elif "InsufficientBalance" in str(response):
            print("\n" + "=" * 70)
            print("💡 SOLUTION: Top up your Africa's Talking account")
            print("=" * 70)
            print("\nGo to: https://account.africastalking.com/")
            print("Navigate to: Wallet → Top Up")
    
    print("\n" + "=" * 70)

if __name__ == '__main__':
    try:
        send_test()
    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
