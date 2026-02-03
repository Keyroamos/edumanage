"""
Test Termii SMS Integration
"""

import requests

api_key = "TLpGzVEJOSPadznWDVIYIozvYSbaoFYqeDyhmsFLFZoZAsZDCPMlfskkUIXkII"
sender_id = "Edumanage"
recipient = "+254720990929"
message = "Hello! Your Termii SMS integration is working perfectly! 🎉 - EduManage System"

print("=" * 70)
print("TESTING TERMII SMS INTEGRATION")
print("=" * 70)

print(f"\nAPI Key: {api_key[:20]}...{api_key[-10:]}")
print(f"Sender ID: {sender_id}")
print(f"Recipient: {recipient}")
print(f"Message: {message}")

# Termii API endpoint
url = "https://api.ng.termii.com/api/sms/send"

# Prepare payload
payload = {
    "to": recipient,
    "from": sender_id,
    "sms": message,
    "type": "plain",
    "channel": "dnd",  # transactional
    "api_key": api_key
}

headers = {
    'Content-Type': 'application/json'
}

print("\nSending SMS via Termii...")
print("-" * 70)

try:
    response = requests.post(url, headers=headers, json=payload, timeout=30)
    
    print(f"\nHTTP Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    print("\n" + "=" * 70)
    if response.status_code in [200, 201]:
        print("✅ SUCCESS! SMS SENT VIA TERMII!")
        print("=" * 70)
        try:
            result = response.json()
            print(f"\n📊 Response Details:")
            print(f"  • Code: {result.get('code')}")
            print(f"  • Message: {result.get('message')}")
            print(f"  • Message ID: {result.get('message_id')}")
            print(f"  • Balance: {result.get('balance')}")
            print(f"  • User: {result.get('user')}")
            
            if result.get('code') == 'ok':
                print("\n🎉 SMS DELIVERED SUCCESSFULLY!")
                print("Check your phone for the message!")
        except:
            print("\nResponse received (non-JSON)")
    else:
        print("❌ FAILED!")
        print("=" * 70)
        print(f"\nError: {response.text}")
        
        # Check for common errors
        if "balance" in response.text.lower():
            print("\n💡 TIP: Top up your Termii wallet to send SMS")
            print("   Go to: https://app.termii.com/ → Wallet → Fund Wallet")
        elif "invalid" in response.text.lower():
            print("\n💡 TIP: Check if your API key is correct")
        elif "sender" in response.text.lower():
            print("\n💡 TIP: Your sender ID might need approval")
            print("   Try using a default sender ID or request approval")
    
except Exception as e:
    print("\n" + "=" * 70)
    print("❌ ERROR!")
    print("=" * 70)
    print(f"\n{str(e)}")

print("\n" + "=" * 70)
