from django.db import migrations, models
import django.db.models.expressions


class Migration(migrations.Migration):

    dependencies = [
        ('schools', '0011_assessmentresult_marks_assessmentresult_weekly_score_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='assessment',
            name='week_number',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterUniqueTogether(
            name='assessment',
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name='assessment',
            constraint=models.UniqueConstraint(
                fields=('student', 'assessment_type', 'term'),
                condition=django.db.models.expressions.Q(('assessment_type', 'weekly'), _negated=True),
                name='unique_non_weekly_assessment_per_term',
            ),
        ),
        migrations.AddConstraint(
            model_name='assessment',
            constraint=models.UniqueConstraint(
                fields=('student', 'assessment_type', 'term', 'week_number'),
                condition=django.db.models.expressions.Q(('assessment_type', 'weekly')),
                name='unique_weekly_assessment_per_week',
            ),
        ),
    ]


