# 🚀 Termii SMS Integration - Setup Guide

## ✅ Migration Complete!

Your SMS system has been migrated from Africa's Talking to **Termii**.

---

## 📋 What You Need From Termii

### 1. **API Key** (Required) 🔑

**How to get it:**
1. Go to: https://termii.com/
2. Click **Sign Up** or **Get Started**
3. Create your account (it's free to start)
4. After signup, log in to your dashboard: https://app.termii.com/
5. Navigate to **Settings** or **API** section
6. Copy your **API Key**

**Where to add it:**
- Open `school/settings.py` (line 283)
- Replace `YOUR_TERMII_API_KEY_HERE` with your actual API key

OR add to `.env` file:
```bash
TERMII_API_KEY=your_actual_api_key_here
```

---

### 2. **Sender ID** (Optional but Recommended) 📱

**What it is:**
- The name that appears as the sender on SMS messages
- Can be alphanumeric (e.g., "Edumanage", "YourSchool")
- Maximum 11 characters
- Default is set to "Edumanage"

**How to get a custom Sender ID:**
1. In your Termii dashboard, go to **Sender ID** section
2. Request a new Sender ID
3. Enter your preferred name
4. Wait for approval (usually quick)

**Where to update it:**
- In `school/settings.py` line 284
- Or in `.env` file:
```bash
TERMII_SENDER_ID=YourSchool
```

---

## 🎯 Quick Setup Steps

### Step 1: Sign Up for Termii
```
1. Visit: https://termii.com/
2. Click "Sign Up" or "Get Started"
3. Fill in your details
4. Verify your email
5. Log in to dashboard
```

### Step 2: Get Your API Key
```
1. In dashboard, go to Settings → API
2. Copy your API Key
3. Update school/settings.py with your key
```

### Step 3: Top Up Your Account (For Sending)
```
1. Go to Wallet → Fund Wallet
2. Add credit (pricing is competitive)
3. You're ready to send SMS!
```

### Step 4: Test SMS
```bash
# Run the test script
python send_test_sms.py
```

---

## 💰 Pricing

Termii offers competitive pricing for Kenya:
- **SMS to Kenya:** ~KES 0.50 - 1.00 per SMS
- **No monthly fees**
- **Pay as you go**
- **Volume discounts available**

---

## 🔧 Configuration

### Current Settings (school/settings.py):

```python
# SMS Configuration - Termii
TERMII_API_KEY = 'YOUR_TERMII_API_KEY_HERE'  # ← Add your key here
TERMII_SENDER_ID = 'Edumanage'  # ← Customize if needed
```

### Using Environment Variables (.env):

```bash
TERMII_API_KEY=your_actual_api_key_here
TERMII_SENDER_ID=Edumanage
```

---

## 📊 Features

✅ **Simple REST API** - Easy integration  
✅ **Reliable Delivery** - High delivery rates in Kenya  
✅ **Multiple Channels** - SMS, Voice, WhatsApp support  
✅ **DND & Generic Routes** - Transactional and promotional messages  
✅ **Real-time Status** - Track message delivery  
✅ **Affordable Pricing** - Competitive rates  
✅ **Good Documentation** - Clear API docs  
✅ **Fast Support** - Responsive customer service  

---

## 🧪 Testing

### Test Script
```bash
python send_test_sms.py
```

### Django Shell
```python
python manage.py shell

from schools.utils.sms import send_bulk_sms
result, response = send_bulk_sms(['+254720990929'], 'Test from Termii!')
print(result, response)
```

### Web Interface
1. Go to your app → SMS Messages
2. Click "Send SMS"
3. Select recipient and send

---

## 🔑 Message Types

### DND (Transactional) - Default
- For important messages (OTPs, notifications, alerts)
- Bypasses Do-Not-Disturb restrictions
- Higher delivery priority
- **Current setting:** `channel: "dnd"`

### Generic (Promotional)
- For marketing and promotional messages
- Subject to DND restrictions
- Lower cost
- To use: Change `channel` to `"generic"` in code

---

## ⚠️ Important Notes

1. **API Key Security:** Never commit your API key to version control
2. **Sender ID:** Must be approved before use (default works immediately)
3. **Phone Format:** System auto-formats to international format (+254...)
4. **Balance:** Keep your wallet funded for uninterrupted service
5. **Testing:** Test with small amounts before bulk sending

---

## 📞 Support

- **Dashboard:** https://app.termii.com/
- **Documentation:** https://developers.termii.com/
- **Email:** support@termii.com
- **Community:** Join their Slack channel

---

## 🎉 Advantages Over Africa's Talking

✅ **Simpler Authentication** - Just an API key, no username confusion  
✅ **Better Documentation** - Clear, straightforward docs  
✅ **Easier Integration** - REST API with JSON  
✅ **Competitive Pricing** - Similar or better rates  
✅ **Reliable** - Good delivery rates in Kenya  
✅ **No Authentication Issues** - Works out of the box  

---

## 📝 Next Steps

1. [ ] Sign up at https://termii.com/
2. [ ] Get your API key from dashboard
3. [ ] Update `TERMII_API_KEY` in settings.py
4. [ ] Top up your wallet
5. [ ] Test SMS sending
6. [ ] (Optional) Request custom Sender ID
7. [ ] Start sending SMS! 🎉

---

## 🔄 Code Changes Made

- ✅ Replaced `africastalking` with `requests` library
- ✅ Updated `send_bulk_sms()` to use Termii API
- ✅ Changed settings from AFRICASTALKING_* to TERMII_*
- ✅ Simplified authentication (API key only)
- ✅ Maintained same interface for backward compatibility

---

**Your SMS system is ready! Just add your Termii API key and start sending! 🚀**
