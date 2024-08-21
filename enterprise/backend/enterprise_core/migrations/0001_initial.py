# Generated by Django 5.1 on 2024-08-20 13:06

import django.db.models.deletion
import iam.models
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('iam', '0005_alter_user_managers'),
    ]

    operations = [
        migrations.CreateModel(
            name='ClientSettings',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated at')),
                ('is_published', models.BooleanField(default=False, verbose_name='published')),
                ('name', models.CharField(blank=True, max_length=255)),
                ('logo', models.ImageField(blank=True, null=True, upload_to='client_logos')),
                ('favicon', models.ImageField(blank=True, null=True, upload_to='client_favicons')),
                ('folder', models.ForeignKey(default=iam.models.Folder.get_root_folder, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_folder', to='iam.folder')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
