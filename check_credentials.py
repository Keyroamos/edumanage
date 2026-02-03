"""
Check for hidden characters in API credentials
"""

# The credentials we're using
username = 'eduma'
api_key = 'atsk_f9e923cd29897da8390b31aa82ee148c70714533c5d5c6d17cd9d42c0227a282607ca72a'

print("=" * 70)
print("CREDENTIAL ANALYSIS")
print("=" * 70)

print(f"\nUsername:")
print(f"  Value: '{username}'")
print(f"  Length: {len(username)}")
print(f"  Repr: {repr(username)}")
print(f"  Bytes: {username.encode('utf-8')}")

print(f"\nAPI Key:")
print(f"  Value: '{api_key}'")
print(f"  Length: {len(api_key)}")
print(f"  First 20: '{api_key[:20]}'")
print(f"  Last 20: '{api_key[-20:]}'")
print(f"  Has whitespace: {any(c.isspace() for c in api_key)}")
print(f"  Has newline: {'\\n' in api_key or '\\r' in api_key}")
print(f"  Repr: {repr(api_key)}")

# Try with stripped versions
username_clean = username.strip()
api_key_clean = api_key.strip()

print(f"\nAfter strip():")
print(f"  Username changed: {username != username_clean}")
print(f"  API Key changed: {api_key != api_key_clean}")

print("\n" + "=" * 70)

# Now test with Africa's Talking
import africastalking

print("\nTesting with Africa's Talking...")
try:
    africastalking.initialize(username_clean, api_key_clean)
    sms = africastalking.SMS
    print("✓ Initialization successful")
    
    # Try a simple send
    response = sms.send("Test", ["+254720990929"])
    print(f"✅ SUCCESS! Response: {response}")
    
except Exception as e:
    print(f"❌ FAILED: {str(e)}")
    
    # Check if it's a specific error
    if "authentication" in str(e).lower():
        print("\n⚠️ The credentials are still invalid.")
        print("Please verify in your dashboard:")
        print("1. Go to https://account.africastalking.com/apps/zdwrynsnvaj")
        print("2. Check the exact username (case-sensitive)")
        print("3. Regenerate the API key if needed")

print("\n" + "=" * 70)
