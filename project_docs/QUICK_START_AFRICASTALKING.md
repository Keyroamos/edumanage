# 🚀 Quick Start: Africa's Talking SMS

## What I Need From You

### 1️⃣ API Key (REQUIRED)
**Where to get it:**
1. Go to: https://account.africastalking.com/
2. Log in with your account
3. Navigate to: **Settings** → **API Key**
4. Copy the API key

**Where to put it:**
Open `school/settings.py` (line 284) and replace:
```python
AFRICASTALKING_API_KEY = os.environ.get('AFRICASTALKING_API_KEY', 'YOUR_API_KEY_HERE')
```

With your actual key:
```python
AFRICASTALKING_API_KEY = os.environ.get('AFRICASTALKING_API_KEY', 'paste_your_key_here')
```

### 2️⃣ Sender ID (OPTIONAL)
**What it is:** The name that appears as the sender (e.g., "BishopDMIS")

**How to register:**
1. In your dashboard: **SMS** → **Sender IDs**
2. Click **Register Sender ID**
3. Enter your preferred name (e.g., "BishopDMIS" or your school name)
4. Wait for approval (usually 1-2 business days)

**Where to put it (after approval):**
```python
AFRICASTALKING_SENDER_ID = os.environ.get('AFRICASTALKING_SENDER_ID', 'BishopDMIS')
```

## Already Configured ✅
- ✅ Username: **BDMIS**
- ✅ Code updated to use Africa's Talking
- ✅ Package installed (africastalking v2.0.1)

## Testing

### Sandbox Mode (Free Testing)
Before sending, add test numbers to your whitelist:
1. Dashboard → **SMS** → **Test Numbers**
2. Click **Add Test Number**
3. Enter: `+254748403481` (or any number you want to test)

### Send Test SMS
**Option 1: Web Interface**
- Go to your app → SMS Messages → Send SMS

**Option 2: Django Shell**
```bash
python manage.py shell
```
```python
from schools.utils.sms import send_bulk_sms
result, response = send_bulk_sms(['+254748403481'], 'Hello from Africa\'s Talking!')
print(result, response)
```

## Production Mode
When ready for production:
1. Top up your account: **Wallet** → **Top Up**
2. No need to whitelist numbers
3. SMS will be sent to any valid phone number

## Support
- 📧 Email: support@africastalking.com
- 📚 Docs: https://developers.africastalking.com/
- 🌐 Dashboard: https://account.africastalking.com/

---

**That's it! Just provide your API key and you're ready to send SMS! 🎉**
