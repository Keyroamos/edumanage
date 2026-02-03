# 🎓 Automatic Academic Progression Setup

## ✅ What's Been Done

Your system now **automatically** handles term advancement and student promotion using **Kenyan Government School Calendar dates**!

### Features:
- ✅ Uses Kenyan government school dates (Term 1: Jan-Apr, Term 2: May-Aug, Term 3: Sep-Dec)
- ✅ Automatically checks dates daily
- ✅ Automatically advances terms when dates are reached
- ✅ Automatically promotes students at end of academic year
- ✅ **Set it once, forget it!**

## 🚀 Quick Setup (2 Steps)

### Step 1: Initialize Academic Year (Run Once)

Open PowerShell or Command Prompt in your project folder and run:

```bash
python manage.py initialize_academic_year
```

This creates all three terms for the current year with Kenyan government dates.

### Step 2: Set Up Automatic Daily Checks (Windows)

1. **Right-click** on `setup_auto_academic.bat`
2. Select **"Run as administrator"**
3. Done! The system will now check and advance automatically every day at 6:00 AM

## 📅 Kenyan Government School Calendar

The system uses these dates:

| Term | Start | End |
|------|-------|-----|
| **Term 1** | January 8 | April 30 |
| **Term 2** | May 6 | August 30 |
| **Term 3** | September 2 | December 20 |

## 🔄 How It Works

1. **Daily Check**: Every day at 6:00 AM, the system checks if the current term's end date has passed
2. **Auto Advance**: If yes, it automatically:
   - Advances all students to the next term
   - Updates term records
   - If it's Term 3 → Term 1 (end of year), promotes all students to next grade
3. **No Manual Work**: You don't need to do anything!

## 📋 Manual Commands (Optional)

If you need to manually trigger or check:

```bash
# Check what would happen (dry run)
python manage.py check_and_advance_academic

# Initialize a specific year
python manage.py initialize_academic_year --year 2025

# Force re-initialize
python manage.py initialize_academic_year --force
```

## 🔍 Verify It's Working

1. **Check Task Scheduler**:
   - Open Windows Task Scheduler
   - Look for "School Academic Progression"
   - It should run daily at 6:00 AM

2. **Check Logs**:
   - Look for `academic_progression.log` in your project folder
   - This shows when the system ran and what it did

3. **Test Manually**:
   ```bash
   python manage.py check_and_advance_academic
   ```
   This shows what the system would do

## 🎯 What Gets Updated Automatically

When terms advance:
- ✅ All students' `current_term` field
- ✅ Term records (`Term` model)
- ✅ Academic year (when moving to new year)

When promoting (end of year):
- ✅ All students' `grade` field
- ✅ Students' `term_fees` based on new grade
- ✅ Previous grade stored in `previous_grade`

## ⚠️ Important Notes

1. **Backup First**: Always backup your database before major changes
2. **First Time**: Run `initialize_academic_year` once to set up terms
3. **Task Scheduler**: Make sure Windows Task Scheduler service is running
4. **Dates**: If your school uses different dates, you can adjust them in the code

## 🛠️ Troubleshooting

**Terms not advancing?**
- Check Task Scheduler is running
- Verify the task exists: `schtasks /query /tn "School Academic Progression"`
- Run manually: `python manage.py check_and_advance_academic`

**Want to change the schedule?**
- Open Task Scheduler
- Find "School Academic Progression"
- Right-click → Properties → Triggers → Edit

**Need to remove the automatic task?**
```bash
schtasks /delete /tn "School Academic Progression" /f
```

## 📚 More Information

See `schools/management/commands/README_ACADEMIC_PROGRESSION.md` for detailed documentation.

---

**That's it! Your system is now fully automatic. Set it once and it will handle everything for you! 🎉**

