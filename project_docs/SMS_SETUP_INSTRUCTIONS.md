# SMS Setup Instructions

## Current Status: ✅ Credentials Valid

Your Africa's Talking credentials are configured correctly:
- **App Name:** BishopDMIS
- **Username:** BDMIS
- **API Key:** Configured ✓

## Current Issue: Phone Number Not Whitelisted

The error "UserInBlacklist" means the phone number needs to be added to your sandbox test numbers.

### How to Fix (Sandbox Mode)

1. **Log in to Africa's Talking Dashboard:**
   - Go to: https://account.africastalking.com/
   - Log in with your account

2. **Add Test Phone Numbers:**
   - Navigate to **SMS** → **Test Numbers** (or **Sandbox** → **Test Numbers`)
   - Click **Add Test Number**
   - Enter the phone number: `0748403481` (or `+254748403481`)
   - Save

3. **Alternative - Use Already Verified Numbers:**
   - Check your dashboard for numbers that are already whitelisted
   - You can send to any of those numbers immediately

### For Production Mode

Once you move to production:
- You can send to any phone number
- No need to whitelist numbers
- Use your production API key (not sandbox)

## Testing the SMS System

After adding the phone number to your sandbox:

1. **Test via Script:**
   ```bash
   python test_send_sms.py
   ```

2. **Test via Web Interface:**
   - Go to your Django app
   - Click "SMS Messages" in the sidebar
   - Click "Send SMS"
   - Select "Individual Student"
   - Choose a student or enter a phone number
   - Send your message

## Common Sandbox Numbers

If you want to test quickly, you can use these default sandbox test numbers:
- `+254700000000` (if available in your account)

Or check your dashboard for your verified test numbers.

## Next Steps

1. ✅ Credentials are correct
2. ⏳ Add phone number to sandbox whitelist
3. ⏳ Test sending SMS
4. ⏳ Move to production when ready

