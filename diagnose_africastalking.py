"""
Diagnose Africa's Talking authentication issue
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school.settings')
django.setup()

from django.conf import settings
import africastalking

def diagnose():
    print("=" * 70)
    print("AFRICA'S TALKING AUTHENTICATION DIAGNOSTIC")
    print("=" * 70)
    
    # Get credentials
    username = getattr(settings, 'AFRICASTALKING_USERNAME', None)
    api_key = getattr(settings, 'AFRICASTALKING_API_KEY', None)
    
    print("\n1. CREDENTIALS CHECK")
    print("-" * 70)
    print(f"Username: {username}")
    print(f"API Key Length: {len(api_key) if api_key else 0} characters")
    print(f"API Key Prefix: {api_key[:10] if api_key else 'None'}...")
    print(f"API Key Suffix: ...{api_key[-10:] if api_key else 'None'}")
    
    # Check if it's a sandbox key
    if api_key and api_key.startswith('atsk_'):
        print("✓ API Key format looks correct (starts with 'atsk_')")
    else:
        print("⚠️ API Key format might be incorrect (should start with 'atsk_')")
    
    print("\n2. INITIALIZATION TEST")
    print("-" * 70)
    
    try:
        # Try to initialize
        africastalking.initialize(username, api_key)
        print("✓ Initialization successful")
        
        # Get SMS service
        sms = africastalking.SMS
        print("✓ SMS service obtained")
        
        print("\n3. ATTEMPTING TO SEND TEST SMS")
        print("-" * 70)
        
        # Try sending to a test number
        try:
            response = sms.send(
                message="Test from Africa's Talking",
                recipients=['+254720990929']
            )
            print("✅ SUCCESS! SMS API call worked!")
            print(f"\nResponse: {response}")
            
        except africastalking.AfricasTalkingException as e:
            error_msg = str(e)
            print(f"❌ API Error: {error_msg}")
            
            if "authentication is invalid" in error_msg.lower():
                print("\n" + "=" * 70)
                print("AUTHENTICATION ISSUE DETECTED")
                print("=" * 70)
                print("\nPossible causes:")
                print("1. API Key is incorrect or expired")
                print("2. Username doesn't match the API key")
                print("3. API key is for a different environment (sandbox vs production)")
                print("\nPlease verify:")
                print("• Log in to: https://account.africastalking.com/")
                print("• Go to: Settings → API Key")
                print("• Check if the username is correct")
                print("• Generate a new API key if needed")
                print("• Make sure you're using the correct environment")
                
            elif "blacklist" in error_msg.lower():
                print("\n" + "=" * 70)
                print("PHONE NUMBER NOT WHITELISTED")
                print("=" * 70)
                print("\nIn sandbox mode, add test numbers:")
                print("1. Go to: https://account.africastalking.com/")
                print("2. Navigate to: SMS → Test Numbers")
                print("3. Add: +254720990929")
                
            elif "balance" in error_msg.lower():
                print("\n" + "=" * 70)
                print("INSUFFICIENT BALANCE")
                print("=" * 70)
                print("\nTop up your account:")
                print("• Go to: Wallet → Top Up")
                
    except Exception as e:
        print(f"❌ Initialization failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 70)
    print("DIAGNOSTIC COMPLETE")
    print("=" * 70)

if __name__ == '__main__':
    diagnose()
