#!/usr/bin/env python
"""
Convert Markdown Schema Documentation to PDF
"""

import os
import sys
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


def parse_markdown_to_pdf(md_file, pdf_file):
    """Parse markdown file and convert to PDF."""
    
    # Create PDF document
    doc = SimpleDocTemplate(
        pdf_file,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18
    )
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a5490'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading1_style = ParagraphStyle(
        'CustomHeading1',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1a5490'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    
    heading2_style = ParagraphStyle(
        'CustomHeading2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=10,
        spaceBefore=15,
        fontName='Helvetica-Bold'
    )
    
    heading3_style = ParagraphStyle(
        'CustomHeading3',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.HexColor('#34495e'),
        spaceAfter=8,
        spaceBefore=10,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=6,
        fontName='Helvetica'
    )
    
    code_style = ParagraphStyle(
        'CustomCode',
        parent=styles['Code'],
        fontSize=9,
        fontName='Courier',
        leftIndent=20,
        spaceAfter=6,
        spaceBefore=6,
        backColor=colors.HexColor('#f5f5f5'),
        borderPadding=5
    )
    
    # Read markdown file
    with open(md_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Parse markdown
    in_code_block = False
    in_table = False
    table_data = []
    
    for line in lines:
        line = line.rstrip('\n')
        
        # Code block handling
        if line.startswith('```'):
            in_code_block = not in_code_block
            continue
        
        if in_code_block:
            elements.append(Paragraph(f'<font name="Courier">{line}</font>', code_style))
            continue
        
        # Empty line
        if not line.strip():
            elements.append(Spacer(1, 0.1 * inch))
            continue
        
        # Horizontal rule
        if line.startswith('---'):
            elements.append(Spacer(1, 0.2 * inch))
            continue
        
        # Headings
        if line.startswith('# '):
            elements.append(Paragraph(line[2:], title_style))
            continue
        elif line.startswith('## '):
            elements.append(Paragraph(line[3:], heading1_style))
            continue
        elif line.startswith('### '):
            elements.append(Paragraph(line[4:], heading2_style))
            continue
        elif line.startswith('#### '):
            elements.append(Paragraph(line[5:], heading3_style))
            continue
        
        # Table handling
        if line.startswith('|'):
            if not in_table:
                in_table = True
                table_data = []
            
            # Parse table row
            cells = [cell.strip() for cell in line.split('|')[1:-1]]
            table_data.append(cells)
            
            # Check for separator row
            if all(cell.startswith('-') or cell == '' for cell in cells):
                continue
        else:
            # End of table
            if in_table and table_data:
                # Create table
                t = Table(table_data)
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a5490')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('FONTSIZE', (0, 1), (-1, -1), 9),
                ]))
                elements.append(t)
                elements.append(Spacer(1, 0.2 * inch))
                in_table = False
                table_data = []
            
            # Regular paragraph
            # Handle bold and inline code
            formatted_line = line
            formatted_line = formatted_line.replace('**', '<b>').replace('**', '</b>')
            formatted_line = formatted_line.replace('`', '<font name="Courier">').replace('`', '</font>')
            formatted_line = formatted_line.replace('→', '→')
            formatted_line = formatted_line.replace('┌', '+').replace('┐', '+')
            formatted_line = formatted_line.replace('├', '+').replace('┤', '+')
            formatted_line = formatted_line.replace('└', '+').replace('┘', '+')
            formatted_line = formatted_line.replace('│', '|')
            formatted_line = formatted_line.replace('─', '-')
            formatted_line = formatted_line.replace('┼', '+')
            formatted_line = formatted_line.replace('─', '-')
            
            elements.append(Paragraph(formatted_line, normal_style))
    
    # Build PDF
    doc.build(elements)
    print(f"PDF generated: {pdf_file}")
    return pdf_file


def create_schema_pdf():
    """Create PDF schema from markdown documentation."""
    
    md_file = 'schema.md'
    pdf_file = 'schema.pdf'
    
    if not os.path.exists(md_file):
        print(f"Error: {md_file} not found!")
        return None
    
    return parse_markdown_to_pdf(md_file, pdf_file)


if __name__ == '__main__':
    print("Converting schema documentation to PDF...")
    result = create_schema_pdf()
    if result:
        print(f"Successfully created: {result}")
    else:
        print("Failed to create PDF")
