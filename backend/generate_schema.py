#!/usr/bin/env python
"""
Django Model Schema Generator
Generates a PDF schema diagram of all Django models in the project.
"""

import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.apps import apps
from django.db import models
from graphviz import Digraph


def get_model_fields(model):
    """Get all fields of a model with their types."""
    fields = []
    for field in model._meta.get_fields():
        if isinstance(field, models.ForeignKey):
            field_type = f"FK → {field.related_model.__name__}"
        elif isinstance(field, models.ManyToManyField):
            field_type = f"M2M → {field.related_model.__name__}"
        elif isinstance(field, models.OneToOneField):
            field_type = f"OneToOne → {field.related_model.__name__}"
        else:
            field_type = field.__class__.__name__
        
        null_info = " (nullable)" if field.null else ""
        blank_info = " (blank)" if field.blank else ""
        fields.append(f"{field.name}: {field_type}{null_info}{blank_info}")
    return fields


def generate_schema():
    """Generate a schema diagram of all Django models."""
    # Create a directed graph
    dot = Digraph(comment='Django Model Schema', format='pdf')
    dot.attr(rankdir='LR', size='16,10')
    dot.attr('node', shape='record', fontsize='10', fontname='Arial')
    
    # Get all installed apps and their models
    all_models = []
    for app in apps.get_app_configs():
        for model in app.get_models():
            all_models.append((app.label, model))
    
    # Group models by app
    apps_dict = {}
    for app_label, model in all_models:
        if app_label not in apps_dict:
            apps_dict[app_label] = []
        apps_dict[app_label].append(model)
    
    # Create subgraphs for each app
    for app_label, models_list in apps_dict.items():
        with dot.subgraph(name=f'cluster_{app_label}') as sub:
            sub.attr(label=app_label.upper(), style='rounded,filled', color='lightgrey')
            
            for model in models_list:
                # Create node for model
                fields = get_model_fields(model)
                
                # Build the record label
                field_labels = [f"<{field.split(':')[0]}> {field}" for field in fields]
                label = f"{{ {model.__name__}|{'|'.join(field_labels)} }}"
                
                # Add node
                node_name = f"{app_label}_{model.__name__}"
                sub.node(node_name, label=label)
    
    # Add edges for relationships
    for app_label, model in all_models:
        for field in model._meta.get_fields():
            if isinstance(field, (models.ForeignKey, models.OneToOneField)):
                from_node = f"{app_label}_{model.__name__}"
                to_node = f"{field.related_model._meta.app_label}_{field.related_model.__name__}"
                dot.edge(from_node, to_node, label=field.name)
            elif isinstance(field, models.ManyToManyField):
                from_node = f"{app_label}_{model.__name__}"
                to_node = f"{field.related_model._meta.app_label}_{field.related_model.__name__}"
                dot.edge(from_node, to_node, label=field.name, style='dashed')
    
    # Save the graph
    output_file = 'schema'
    dot.render(output_file, cleanup=True, format='pdf')
    print(f"Schema diagram generated: {output_file}.pdf")
    return f"{output_file}.pdf"


def generate_text_schema():
    """Generate a text-based schema documentation."""
    schema_text = []
    schema_text.append("=" * 80)
    schema_text.append("DJANGO MODEL SCHEMA")
    schema_text.append("=" * 80)
    schema_text.append("")
    
    # Get all installed apps and their models
    all_models = []
    for app in apps.get_app_configs():
        for model in app.get_models():
            all_models.append((app.label, model))
    
    # Group models by app
    apps_dict = {}
    for app_label, model in all_models:
        if app_label not in apps_dict:
            apps_dict[app_label] = []
        apps_dict[app_label].append(model)
    
    # Generate text documentation
    for app_label, models_list in apps_dict.items():
        schema_text.append("-" * 80)
        schema_text.append(f"APP: {app_label.upper()}")
        schema_text.append("-" * 80)
        schema_text.append("")
        
        for model in models_list:
            schema_text.append(f"Model: {model.__name__}")
            schema_text.append(f"  Table: {model._meta.db_table}")
            schema_text.append("")
            schema_text.append("  Fields:")
            
            for field in model._meta.get_fields():
                if isinstance(field, models.ForeignKey):
                    field_type = f"ForeignKey → {field.related_model.__name__}"
                elif isinstance(field, models.ManyToManyField):
                    field_type = f"ManyToManyField → {field.related_model.__name__}"
                elif isinstance(field, models.OneToOneField):
                    field_type = f"OneToOneField → {field.related_model.__name__}"
                else:
                    field_type = field.__class__.__name__
                
                null_info = ", nullable" if field.null else ""
                blank_info = ", blank" if field.blank else ""
                default_info = f", default={field.default}" if field.default != models.NOT_PROVIDED else ""
                
                schema_text.append(f"    - {field.name}: {field_type}{null_info}{blank_info}{default_info}")
            
            schema_text.append("")
            schema_text.append("  Relationships:")
            
            for field in model._meta.get_fields():
                if isinstance(field, (models.ForeignKey, models.OneToOneField)):
                    schema_text.append(f"    - {field.name} → {field.related_model._meta.app_label}.{field.related_model.__name__}")
                elif isinstance(field, models.ManyToManyField):
                    schema_text.append(f"    - {field.name} ↔ {field.related_model._meta.app_label}.{field.related_model.__name__}")
            
            schema_text.append("")
            schema_text.append("")
    
    # Save to file
    with open('schema.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(schema_text))
    
    print("Text schema documentation generated: schema.txt")
    return 'schema.txt'


if __name__ == '__main__':
    print("Generating Django model schema...")
    print()
    
    # Generate text schema
    generate_text_schema()
    print()
    
    # Generate PDF schema
    try:
        generate_schema()
    except ImportError:
        print("Note: graphviz package not installed. PDF generation skipped.")
        print("To install graphviz, run: pip install graphviz")
        print("You also need to install Graphviz on your system:")
        print("  - macOS: brew install graphviz")
        print("  - Ubuntu: sudo apt-get install graphviz")
        print("  - Windows: Download from https://graphviz.org/download/")
