# Academic Progression - Automatic Term and Grade Advancement

This system **automatically** advances students through terms and promotes them to the next grade level based on **Kenyan Government School Calendar dates**. Once set up, it runs automatically - no manual intervention needed!

## 🎯 Automatic System (Recommended)

The system uses **Kenyan Government School Calendar** dates:
- **Term 1**: January 8 - April 30
- **Term 2**: May 6 - August 30
- **Term 3**: September 2 - December 20

### Quick Setup (One-Time)

1. **Initialize the academic year** (run once):
   ```bash
   python manage.py initialize_academic_year
   ```

2. **Set up automatic daily checks** (Windows):
   - Double-click `setup_auto_academic.bat` (run as Administrator)
   - This creates a Windows Task Scheduler job that runs daily at 6:00 AM

That's it! The system will now automatically:
- ✅ Check dates daily
- ✅ Advance terms when term end dates are reached
- ✅ Promote students at the end of academic year (Term 3 → Term 1)
- ✅ Update all student records automatically

### How It Works

The `check_and_advance_academic` command runs daily and:
1. Checks if current term's end date has passed
2. If yes, automatically advances to next term
3. If advancing from Term 3 → Term 1, promotes all students to next grade
4. Updates term dates based on Kenyan calendar
5. Updates all student records

**No manual intervention required!**

## Management Commands

### 1. `initialize_academic_year`
**Run this ONCE to set up the academic year with Kenyan dates.**

```bash
python manage.py initialize_academic_year
python manage.py initialize_academic_year --year 2025  # For specific year
python manage.py initialize_academic_year --force      # Re-initialize existing year
```

**What it does:**
- Creates all three terms for the year with Kenyan government dates
- Sets the current term based on today's date
- Updates students to current term

### 2. `check_and_advance_academic` ⭐ (Automatic)
**This runs automatically via Task Scheduler. You can also run it manually:**

```bash
python manage.py check_and_advance_academic
```

**What it does:**
- Checks if term end date has passed
- Automatically advances terms if needed
- Promotes students at end of year
- Uses Kenyan government calendar dates

### 3. `advance_term` (Manual)
Manually advance all students to next term.

```bash
python manage.py advance_term
python manage.py advance_term --dry-run
python manage.py advance_term --force-term 2
```

### 4. `promote_students` (Manual)
Manually promote all students to next grade.

```bash
python manage.py promote_students
python manage.py promote_students --dry-run
python manage.py promote_students --grade G1
```

### 5. `auto_advance_academic` (Manual)
Combines term advancement and promotion (manual trigger).

```bash
python manage.py auto_advance_academic
python manage.py auto_advance_academic --dry-run
```

## Web Interface

Access the web interface at: `/academic/progression/`

This page allows you to:
- View current academic status
- Manually trigger term advancement
- Manually promote students
- Preview changes with dry-run mode

## Setting Up Automatic Scheduling

### Windows (Recommended)

**Option 1: Use the provided script (Easiest)**
1. Right-click `setup_auto_academic.bat`
2. Select "Run as administrator"
3. Done! Task scheduled for daily 6:00 AM

**Option 2: Manual Setup**
1. Open Task Scheduler
2. Create Basic Task
3. Name: "School Academic Progression"
4. Trigger: Daily at 6:00 AM
5. Action: Start a program
6. Program: `C:\path\to\your\project\run_academic_check.bat`

### Linux/Mac (Cron)

Add to crontab (`crontab -e`):

```bash
# Run daily at 6:00 AM
0 6 * * * cd /path/to/your/project && python manage.py check_and_advance_academic >> academic_progression.log 2>&1
```

### Using Django-Q or Celery

```python
from django_q.tasks import schedule
from django.utils import timezone

# Schedule daily check
schedule(
    'django.core.management.call_command',
    'check_and_advance_academic',
    schedule_type='D',  # Daily
    repeats=-1,  # Repeat indefinitely
    next_run=timezone.now()
)
```

## Kenyan Government School Calendar

The system uses these standard dates:

| Term | Start Date | End Date |
|------|------------|----------|
| Term 1 | January 8 | April 30 |
| Term 2 | May 6 | August 30 |
| Term 3 | September 2 | December 20 |

**Note:** These dates are based on standard Kenyan school calendar. Adjust in the code if your school uses different dates.

## Grade Sequence

Promotion follows this sequence:
- PG (Playgroup) → PP1 → PP2 → G1 → G2 → G3 → G4 → G5 → G6 → G7 → G8 → G9 → G10 → G11 → G12

Students in G12 (final grade) will not be promoted automatically.

## Automatic Initialization

The system automatically initializes terms on startup if none exist. This happens when Django starts, so you don't need to manually create terms.

## Important Notes

1. **Set it once, forget it!** The automatic system handles everything
2. **Always backup your database** before major changes
3. **Term advancement** happens automatically when term end dates pass
4. **Student promotion** only happens when advancing from Term 3 to Term 1 (end of academic year)
5. The system automatically updates:
   - Student `current_term` field
   - Student `grade` field (at end of year)
   - Student `academic_year` field
   - Student `term_fees` based on new grade
   - `Term` model's `is_current` flag
   - Term dates based on Kenyan calendar

## Troubleshooting

- **Terms not advancing?** Check that `check_and_advance_academic` is running daily
- **Wrong dates?** Verify Task Scheduler is running the task
- **Students not promoting?** Ensure they have a `grade` assigned
- **Manual check:** Run `python manage.py check_and_advance_academic` to see what would happen
- **View logs:** Check `academic_progression.log` for execution history

## First-Time Setup Checklist

1. ✅ Run `python manage.py initialize_academic_year`
2. ✅ Run `setup_auto_academic.bat` as Administrator (Windows)
3. ✅ Verify task in Task Scheduler
4. ✅ Test manually: `python manage.py check_and_advance_academic`
5. ✅ Done! System will run automatically
