"""
Test Termii SMS with different sender IDs
"""

import requests

api_key = "TLpGzVEJOSPadznWDVIYIozvYSbaoFYqeDyhmsFLFZoZAsZDCPMlfskkUIXkII"
recipient = "+254720990929"
message = "Hello! Your Termii SMS is working! 🎉"

# Try different sender IDs
sender_ids_to_try = [
    "N-Alert",  # Common default
    "NOTIFY",   # Another common default
    "INFO",     # Generic
    "SMS",      # Simple
]

print("=" * 70)
print("TESTING TERMII WITH DIFFERENT SENDER IDs")
print("=" * 70)

url = "https://api.ng.termii.com/api/sms/send"
headers = {'Content-Type': 'application/json'}

for sender_id in sender_ids_to_try:
    print(f"\n{'='*70}")
    print(f"Trying Sender ID: {sender_id}")
    print(f"{'='*70}")
    
    payload = {
        "to": recipient,
        "from": sender_id,
        "sms": message,
        "type": "plain",
        "channel": "dnd",
        "api_key": api_key
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code in [200, 201]:
            try:
                result = response.json()
                if result.get('code') == 'ok':
                    print(f"\n✅ SUCCESS with Sender ID: {sender_id}")
                    print(f"Message ID: {result.get('message_id')}")
                    print(f"Balance: {result.get('balance')}")
                    print(f"\n🎉 THIS SENDER ID WORKS! Use: {sender_id}")
                    break
            except:
                pass
        else:
            print(f"❌ Failed with {sender_id}")
            
    except Exception as e:
        print(f"❌ Error with {sender_id}: {str(e)}")

print("\n" + "=" * 70)
print("If none worked, you need to:")
print("1. Go to Termii dashboard: https://app.termii.com/")
print("2. Navigate to Sender ID section")
print("3. Request a sender ID (e.g., 'Edumanage' or your school name)")
print("4. Wait for approval (usually quick)")
print("=" * 70)
