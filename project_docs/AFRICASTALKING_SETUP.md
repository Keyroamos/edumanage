# Africa's Talking SMS Setup Guide

## Migration Complete! ✅

Your SMS system has been migrated from Twilio to Africa's Talking.

## What You Need to Provide

### 1. **API Key** (Required)
- Log in to https://account.africastalking.com/
- Go to **Settings** → **API Key**
- Copy your API key
- Update it in `school/settings.py` or set as environment variable

### 2. **Username** (Already Set)
- Your username is: **BDMIS**
- This is already configured in settings.py

### 3. **Sender ID** (Optional but Recommended)
- Go to **SMS** → **Sender IDs** in your dashboard
- Register a custom sender ID (e.g., "BishopDMIS" or your school name)
- This will appear as the sender name on SMS messages
- Update in settings.py once approved

## Installation Steps

### Step 1: Install Africa's Talking SDK
```bash
pip install africastalking
```

### Step 2: Update Settings
Edit `school/settings.py` and replace `YOUR_API_KEY_HERE` with your actual API key:

```python
AFRICASTALKING_API_KEY = 'your_actual_api_key_here'
```

Or set it as an environment variable:
```bash
# In .env file
AFRICASTALKING_USERNAME=BDMIS
AFRICASTALKING_API_KEY=your_actual_api_key_here
AFRICASTALKING_SENDER_ID=BishopDMIS  # Optional
```

### Step 3: Test the SMS System

#### Option A: Via Web Interface
1. Go to your Django app
2. Click "SMS Messages" in the sidebar
3. Click "Send SMS"
4. Select a recipient and send a test message

#### Option B: Via Python Script
Create a test script:
```python
python manage.py shell
```

Then run:
```python
from schools.utils.sms import send_bulk_sms

# Test with a single number
result, response = send_bulk_sms(['+254748403481'], 'Test message from Africa\'s Talking!')
print(f"Success: {result}")
print(f"Response: {response}")
```

## Important Notes

### Sandbox Mode vs Production Mode

**Sandbox Mode (Testing):**
- Free for testing
- Can only send to whitelisted phone numbers
- Add test numbers in dashboard: **SMS** → **Test Numbers**
- Error "UserInBlacklist" means number not whitelisted

**Production Mode:**
- Requires account top-up
- Can send to any phone number
- No whitelisting required
- Pay per SMS sent

### Common Errors

1. **"UserInBlacklist"**
   - **Sandbox:** Add the phone number to your test numbers
   - **Production:** Recipient has opted out or number is blocked

2. **"InsufficientBalance"**
   - Top up your Africa's Talking account
   - Go to **Wallet** → **Top Up**

3. **"Invalid Credentials"**
   - Double-check your API key and username
   - Make sure there are no extra spaces

## Phone Number Format

The system automatically formats phone numbers to international format:
- `0748403481` → `+254748403481`
- `748403481` → `+254748403481`
- `+254748403481` → `+254748403481` (no change)

## Features

✅ Bulk SMS sending
✅ Automatic phone number formatting
✅ Detailed error handling
✅ Cost tracking per message
✅ Message status tracking
✅ Support for custom sender IDs

## Next Steps

1. ✅ Code updated to use Africa's Talking
2. ⏳ Install africastalking package: `pip install africastalking`
3. ⏳ Add your API key to settings.py
4. ⏳ Test sending SMS
5. ⏳ (Optional) Register and configure a custom sender ID

## Support

- Africa's Talking Documentation: https://developers.africastalking.com/docs/sms/overview
- Dashboard: https://account.africastalking.com/
- Support: support@africastalking.com
