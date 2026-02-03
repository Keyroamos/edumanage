"""
Direct test of Africa's Talking credentials without Django
"""

import africastalking

# Use the credentials directly
username = 'eduma'
api_key = 'atsk_f9e923cd29897da8390b31aa82ee148c70714533c5d5c6d17cd9d42c0227a282607ca72a'

print("=" * 70)
print("DIRECT AFRICA'S TALKING TEST (NO DJANGO)")
print("=" * 70)

print(f"\nUsername: {username}")
print(f"API Key: {api_key[:20]}...{api_key[-10:]}")

try:
    # Initialize
    africastalking.initialize(username, api_key)
    print("\n✓ Initialization successful")
    
    # Get SMS service
    sms = africastalking.SMS
    print("✓ SMS service obtained")
    
    # Try to send
    print("\nAttempting to send SMS to +254720990929...")
    
    response = sms.send(
        message="Test from Africa's Talking - Direct API call",
        recipients=['+254720990929']
    )
    
    print("\n" + "=" * 70)
    print("✅ SUCCESS!")
    print("=" * 70)
    print(f"\nResponse: {response}")
    
except Exception as e:
    print("\n" + "=" * 70)
    print("❌ FAILED")
    print("=" * 70)
    print(f"\nError: {str(e)}")
    
    error_msg = str(e).lower()
    
    if "authentication" in error_msg or "invalid" in error_msg:
        print("\n💡 The API key or username is incorrect.")
        print("Please double-check:")
        print("1. Username is exactly: 'eduma'")
        print("2. API key is copied correctly from dashboard")
        print("3. You're logged into the correct Africa's Talking account")
        
    elif "blacklist" in error_msg:
        print("\n💡 Phone number needs to be whitelisted in sandbox mode")
        print("Go to: SMS → Test Numbers and add +254720990929")
        
    elif "balance" in error_msg:
        print("\n💡 Insufficient balance - top up your account")

print("\n" + "=" * 70)
