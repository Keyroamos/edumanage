"""
Test with new API key
"""

import requests

username = "eduma"
api_key = "atsk_568869fd2e4d09a22025c321f49eb7249ce2532c44bfded6e04d00fd6c3bd5f59eca4df4"
recipients = "+254720990929"
message = "Hello! This is a test from Africa's Talking. Your SMS system is now working! 🎉"

print("=" * 70)
print("TESTING WITH NEW API KEY")
print("=" * 70)

print(f"\nUsername: {username}")
print(f"API Key: {api_key[:20]}...{api_key[-10:]}")
print(f"Recipient: {recipients}")
print(f"Message: {message}")

# API endpoint
url = "https://api.africastalking.com/version1/messaging"

# Headers - API key goes in header
headers = {
    "apiKey": api_key,
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept": "application/json"
}

# Form data - username goes in form
data = {
    "username": username,
    "to": recipients,
    "message": message
}

print("\nSending SMS...")
print("-" * 70)

try:
    response = requests.post(url, headers=headers, data=data, timeout=30)
    
    print(f"\nHTTP Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    print("\n" + "=" * 70)
    if response.status_code in [200, 201]:
        print("✅ SUCCESS! SMS SENT!")
        print("=" * 70)
        try:
            result = response.json()
            print(f"\nParsed response: {result}")
            
            if 'SMSMessageData' in result and 'Recipients' in result['SMSMessageData']:
                for recipient in result['SMSMessageData']['Recipients']:
                    print(f"\n📱 Number: {recipient.get('number')}")
                    print(f"✓ Status: {recipient.get('status')}")
                    print(f"💰 Cost: {recipient.get('cost')}")
                    print(f"🆔 Message ID: {recipient.get('messageId')}")
        except:
            pass
    else:
        print("❌ FAILED!")
        print("=" * 70)
        print(f"\nError: {response.text}")
    
except Exception as e:
    print("\n" + "=" * 70)
    print("❌ ERROR!")
    print("=" * 70)
    print(f"\n{str(e)}")

print("\n" + "=" * 70)
