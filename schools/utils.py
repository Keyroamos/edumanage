from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A5, letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch, cm, mm
from reportlab.platypus import Table, TableStyle, SimpleDocTemplate, Paragraph, Spacer, Image, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from django.conf import settings
from django.core.mail import EmailMessage
import os
import qrcode
import json
import base64
import tempfile
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from django.utils import timezone
import logging
import datetime

logger = logging.getLogger(__name__)

def generate_receipt_qr(data):
    """Helper function to generate QR codes for receipts with consistent settings"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=4
    )
    qr.add_data(json.dumps(data))
    qr.make(fit=True)
    qr_image = qr.make_image(fill_color="black", back_color="white")
    
    buffer = BytesIO()
    qr_image.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode()

def number_to_words(num):
    """Convert number to words for Kenyan Shillings"""
    ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 
             'Seventeen', 'Eighteen', 'Nineteen']
    tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    
    def convert_hundreds(n):
        if n == 0:
            return ''
        result = ''
        if n >= 100:
            result += ones[n // 100] + ' Hundred '
            n %= 100
        if n >= 20:
            result += tens[n // 10] + ' '
            n %= 10
        elif n >= 10:
            result += teens[n - 10] + ' '
            return result
        if n > 0:
            result += ones[n] + ' '
        return result
    
    if num == 0:
        return 'Zero'
    
    # Split into shillings and cents
    shillings = int(num)
    cents = round((num - shillings) * 100)
    
    result = ''
    
    # Convert millions
    if shillings >= 1000000:
        millions = shillings // 1000000
        result += convert_hundreds(millions) + 'Million '
        shillings %= 1000000
    
    # Convert thousands
    if shillings >= 1000:
        thousands = shillings // 1000
        result += convert_hundreds(thousands) + 'Thousand '
        shillings %= 1000
    
    # Convert hundreds
    if shillings > 0:
        result += convert_hundreds(shillings)
    
    result = result.strip() + ' Shillings'
    
    if cents > 0:
        result += ' and ' + convert_hundreds(cents).strip() + ' Cents'
    
    return result.title()

def generate_payment_receipt(payment, qr_code=None):
    """Generate PDF receipt matching the official school receipt design exactly
    Supports both Payment and StudentMealPayment objects
    """
    buffer = BytesIO()
    
    # Detect payment type and normalize attributes
    from schools.models import StudentMealPayment
    is_meal_payment = isinstance(payment, StudentMealPayment)
    
    # Normalize date attribute
    payment_date = payment.payment_date if is_meal_payment else payment.date
    
    # Get term - use student's current term for meal payments
    if is_meal_payment:
        payment_term = payment.student.current_term if hasattr(payment.student, 'current_term') else 1
    else:
        payment_term = payment.term if hasattr(payment, 'term') else 1
    
    # Page Settings (A4)
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=12*mm,
        leftMargin=12*mm,
        topMargin=0*mm, # We handle top border manually
        bottomMargin=10*mm
    )
    
    # Design Tokens
    indigo_600 = colors.HexColor('#4f46e5')
    indigo_700 = colors.HexColor('#4338ca')
    indigo_50 = colors.HexColor('#eef2ff')
    indigo_100 = colors.HexColor('#e0e7ff')
    indigo_950 = colors.HexColor('#1e1b4b')
    slate_50 = colors.HexColor('#f8fafc')
    slate_100 = colors.HexColor('#f1f5f9')
    slate_200 = colors.HexColor('#e2e8f0')
    slate_400 = colors.HexColor('#a0aec0')
    slate_500 = colors.HexColor('#64748b')
    slate_900 = colors.HexColor('#0f172a')
    emerald_50 = colors.HexColor('#ecfdf5')
    emerald_700 = colors.HexColor('#047857')

    styles = getSampleStyleSheet()
    
    # Custom Styled Components
    def get_styles_map():
        return {
            'header_name': ParagraphStyle('HeadName', fontSize=18, fontName='Helvetica-Bold', textColor=indigo_950, leading=20),
            'sub_header': ParagraphStyle('SubHead', fontSize=7, fontName='Helvetica-Bold', textColor=indigo_600, leading=9, tracking=1.5),
            'contact_text': ParagraphStyle('ContactText', fontSize=7, textColor=slate_500, leading=8),
            'badge_style': ParagraphStyle('Badge', fontSize=18, fontName='Helvetica-Bold', textColor=indigo_700, alignment=1),
            'meta_label': ParagraphStyle('MetaLabel', fontSize=7, fontName='Helvetica-Bold', textColor=slate_400, alignment=2, tracking=1),
            'meta_id': ParagraphStyle('MetaID', fontSize=11, fontName='Courier-Bold', textColor=slate_900, alignment=2),
            'card_title': ParagraphStyle('CardTitle', fontSize=7, fontName='Helvetica-Bold', textColor=slate_400, leading=9, tracking=1),
            'card_label': ParagraphStyle('CardLabel', fontSize=8, textColor=slate_500, leading=10),
            'card_value': ParagraphStyle('CardValue', fontSize=9, fontName='Helvetica-Bold', textColor=slate_900, leading=11),
            'th_style': ParagraphStyle('TH', fontSize=8, fontName='Helvetica-Bold', textColor=colors.white, tracking=0.5, alignment=1),
            'td_desc': ParagraphStyle('TDDesc', fontSize=10, fontName='Helvetica-Bold', textColor=slate_900),
            'td_cat': ParagraphStyle('TDCat', fontSize=6, fontName='Helvetica-Bold', textColor=colors.white, backColor=indigo_600, alignment=1),
            'total_label': ParagraphStyle('TotalLabel', fontSize=10, fontName='Helvetica-Bold', textColor=slate_400, tracking=0.5, alignment=2),
            'total_val': ParagraphStyle('TotalVal', fontSize=16, fontName='Helvetica-Bold', textColor=indigo_700, alignment=2),
            'p_std': ParagraphStyle('PStd', fontSize=9, textColor=slate_500, fontName='Helvetica'),
            'p_bold': ParagraphStyle('PBold', fontSize=9, fontName='Helvetica-Bold', textColor=slate_900),
        }

    st = get_styles_map()
    from config.models import SchoolConfig
    sc = SchoolConfig.get_config()
    elements = []

    # 1. TOP BORDER
    line_table = Table([['']], colWidths=[186*mm], rowHeights=[1.5*mm])
    line_table.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), indigo_600)]))
    elements.append(line_table)
    elements.append(Spacer(1, 4*mm))

    # 2. HEADER SECTION
    logo_file = None
    if sc.school_logo:
        try: logo_file = sc.school_logo.path
        except: pass
    
    if logo_file and os.path.exists(logo_file):
        logo_img = Image(logo_file, width=12*mm, height=12*mm)
    else:
        logo_img = Paragraph("LOGO", st['card_title'])

    logo_box = Table([[logo_img]], colWidths=[15*mm], rowHeights=[15*mm])
    logo_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), indigo_600),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROUNDEDCORNERS', [10, 10, 10, 10]),
    ]))

    header_left = Table([
        [logo_box, Table([
            [Paragraph(sc.school_name.upper(), st['header_name'])],
            [Paragraph("OFFICIAL FINANCIAL DOCUMENT", st['sub_header'])],
            [Paragraph(f"{sc.school_address}", st['contact_text'])],
            [Paragraph(f"T: {sc.school_phone}  |  E: {sc.school_email}", st['contact_text'])]
        ], colWidths=[90*mm], style=[('VALIGN', (0,0), (-1,-1), 'TOP')])]
    ], colWidths=[25*mm, 90*mm])
    header_left.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('LEFTPADDING', (0,0), (-1,-1), 0)]))

    receipt_badge = Table([[Paragraph("RECEIPT", st['badge_style'])]], colWidths=[50*mm], rowHeights=[10*mm])
    receipt_badge.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), indigo_50),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEABOVE', (0,0), (-1,-1), 1, indigo_100),
        ('LINEBELOW', (0,0), (-1,-1), 1, indigo_100),
        ('LINELEFT', (0,0), (-1,-1), 1, indigo_100),
        ('LINERIGHT', (0,0), (-1,-1), 1, indigo_100),
    ]))

    status_badge = Table([[Paragraph("PAYMENT CAPTURED", ParagraphStyle('PBadge', fontSize=7, fontName='Helvetica-Bold', textColor=emerald_700, alignment=1))]], colWidths=[40*mm], rowHeights=[6*mm])
    status_badge.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), emerald_50),
        ('ROUNDEDCORNERS', [10, 10, 10, 10]),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))

    header_right = Table([
        [receipt_badge],
        [Spacer(1, 2*mm)],
        [Paragraph("RECEIPT NUMBER", st['meta_label'])],
        [Paragraph(f"#{str(payment.pk).zfill(8)}", st['meta_id'])],
        [Spacer(1, 2*mm)],
        [status_badge]
    ], colWidths=[60*mm])
    header_right.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'RIGHT'), ('RIGHTPADDING', (0,0), (-1,-1), 0)]))

    main_header = Table([[header_left, header_right]], colWidths=[118*mm, 68*mm])
    main_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6*mm),
        ('LINEBELOW', (0,0), (-1,-1), 1, slate_100),
    ]))
    elements.append(main_header)
    elements.append(Spacer(1, 4*mm))

    # 3. INFORMATION CARDS
    def make_card(title, fields):
        rows = [[Paragraph(title.upper(), st['card_title'])]]
        rows.append([Spacer(1, 2*mm)])
        for label, val in fields:
            rows.append([Table([[Paragraph(label, st['card_label']), Paragraph(str(val), st['card_value'])]], colWidths=[30*mm, 45*mm])])
        t = Table(rows, colWidths=[80*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), slate_50),
            ('BOX', (0,0), (-1,-1), 1, slate_100),
            ('TOPPADDING', (0,0), (-1,-1), 4*mm),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4*mm),
            ('LEFTPADDING', (0,0), (-1,-1), 4*mm),
            ('RIGHTPADDING', (0,0), (-1,-1), 4*mm),
            ('ROUNDEDCORNERS', [15, 15, 15, 15]),
        ]))
        return t

    fields_student = [
        ("Full Name", payment.student.get_full_name().upper()),
        ("Admission No.", payment.student.admission_number),
        ("Current Grade", str(payment.student.grade or "N/A")),
    ]
    fields_tx = [
        ("Date & Time", payment_date.strftime('%Y-%m-%d %H:%M')),
        ("Method", getattr(payment, 'payment_method', 'CASH').upper()),
        ("Ref Code", getattr(payment, 'reference_number', 'N/A')),
    ]

    cards_table = Table([[make_card("Student Information", fields_student), make_card("Transaction Details", fields_tx)]], colWidths=[93*mm, 93*mm])
    elements.append(cards_table)
    elements.append(Spacer(1, 4*mm))
    # 4. FINANCIAL TABLE
    table_data = [
        [Paragraph("DESCRIPTION OF SERVICE/FEE", st['th_style']), 
         Paragraph("UNIT PRICE", st['th_style']), 
         Paragraph("AMOUNT PAID (KES)", st['th_style'])]
    ]
    
    desc_cell = [
        Paragraph(getattr(payment, 'description', 'Fees Payment'), st['td_desc']),
        Spacer(1, 1*mm),
        Table([[Paragraph("CATEGORY", ParagraphStyle('CatL', fontSize=6, fontName='Helvetica-Bold', textColor=colors.white, alignment=1)), Paragraph("GENERAL FEES", ParagraphStyle('CatV', fontSize=7, fontName='Helvetica-Bold', textColor=slate_500))]], colWidths=[15*mm, 30*mm], style=[('BACKGROUND', (0,0), (0,0), indigo_600), ('VALIGN',(0,0),(-1,-1),'MIDDLE')])
    ]
    
    table_data.append([
        desc_cell,
        Paragraph(f"{payment.amount:,.2f}", ParagraphStyle('P', fontSize=10, textColor=slate_500, fontName='Courier')),
        Paragraph(f"{payment.amount:,.2f}", ParagraphStyle('P', fontSize=14, fontName='Helvetica-Bold', textColor=slate_900, alignment=2))
    ])

    tx_table = Table(table_data, colWidths=[110*mm, 35*mm, 41*mm])
    tx_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), slate_900),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,0), 4*mm),
        ('BOTTOMPADDING', (0,0), (-1,0), 4*mm),
        ('TOPPADDING', (0,1), (-1,-1), 8*mm),
        ('BOTTOMPADDING', (0,1), (-1,-1), 8*mm),
        ('LINEBELOW', (0,1), (-1,1), 2, slate_100),
        ('LEFTPADDING', (0,0), (-1,-1), 6*mm),
        ('RIGHTPADDING', (0,0), (-1,-1), 6*mm),
    ]))
    elements.append(tx_table)

    # 5. TOTAL SECTION
    total_table = Table([
        ['', Paragraph("TOTAL NET PAYMENT", st['total_label']), Table([[Paragraph("KES", ParagraphStyle('TC', fontSize=10, fontName='Helvetica-Bold', textColor=indigo_700)), Paragraph(f"{payment.amount:,.2f}", st['total_val'])]], colWidths=[12*mm, 29*mm])],
        ['', Paragraph("OUTSTANDING BALANCE", ParagraphStyle('BL', fontSize=9, fontName='Helvetica-Bold', textColor=colors.HexColor('#f87171'), alignment=2)), Paragraph(f"KES {getattr(payment.student, 'balance', 0):,.2f}", ParagraphStyle('BV', fontSize=12, fontName='Helvetica-Bold', textColor=colors.HexColor('#ef4444'), alignment=2))] if getattr(payment.student, 'balance', 0) > 0 else ['', '', '']
    ], colWidths=[110*mm, 45*mm, 31*mm])
    total_table.setStyle(TableStyle([
        ('BACKGROUND', (2,0), (2,0), indigo_50),
        ('BACKGROUND', (2,1), (2,1), colors.HexColor('#fef2f2')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4*mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4*mm),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
    ]))
    elements.append(total_table)
    elements.append(Spacer(1, 4*mm))

    # 6. FOOTER (QR, Disclaimer, Signatures)
    qr_box = Spacer(20*mm, 20*mm)
    if qr_code:
        try:
            qr_data = base64.b64decode(qr_code)
            qr_img = Image(BytesIO(qr_data), width=18*mm, height=18*mm)
            qr_box = Table([[qr_img]], colWidths=[20*mm], rowHeights=[20*mm])
            qr_box.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), slate_50),
                ('BOX', (0,0), (-1,-1), 0.5, slate_100),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
        except: pass

    footer_left = Table([
        [qr_box],
        [Paragraph("SCAN TO VERIFY", ParagraphStyle('PV', fontSize=6, fontName='Courier', textColor=slate_400, alignment=1))],
        [Spacer(1, 1*mm)],
        [Paragraph("<b>Disclaimers & Conditions:</b><br/>1. Computer-generated official receipt.<br/>2. Fees non-refundable/transferable.<br/>3. Retain for future queries.", ParagraphStyle('PD', fontSize=7, textColor=slate_400, leading=9))]
    ], colWidths=[45*mm])

    sig_line = Table([['']], colWidths=[55*mm], rowHeights=[0.2*mm])
    sig_line.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), slate_200)]))
    
    stamp_box = Table([['']], colWidths=[20*mm], rowHeights=[20*mm])
    stamp_box.setStyle(TableStyle([('BOX',(0,0),(-1,-1),1,slate_100), ('DASH',(0,0),(-1,-1),(2,2))]))

    footer_right = Table([
        [Paragraph("SERVED BY:", st['meta_label']), ''],
        [Paragraph(f"<i>{getattr(payment, 'recorded_by', 'Finance Dept')}</i>", ParagraphStyle('PS', fontSize=10, fontName='Helvetica-Bold', textColor=slate_900, alignment=2)), ''],
        [Paragraph("AUTHORIZED FINANCE OFFICER", ParagraphStyle('PO', fontSize=6, fontName='Courier', textColor=slate_400, alignment=2)), ''],
        [Spacer(1, 4*mm), ''],
        [Paragraph("OFFICIAL SEAL / STAMP", st['meta_label']), stamp_box],
        [Spacer(1, 2*mm), ''],
        [Paragraph(f"Date: {datetime.date.today().strftime('%Y-%m-%d')}", ParagraphStyle('PDD', fontSize=7, textColor=slate_400, alignment=2)), ''],
        [sig_line, '']
    ], colWidths=[55*mm, 25*mm])
    footer_right.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'RIGHT'), ('VALIGN', (0,0), (-1,-1), 'BOTTOM')]))

    footer_main = Table([[footer_left, footer_right]], colWidths=[90*mm, 96*mm])
    footer_main.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('TOPPADDING', (0,0), (-1,-1), 5*mm), ('LINEABOVE', (0,0), (-1,-1), 1, slate_100)]))
    elements.append(footer_main)

    elements.append(Spacer(1, 6*mm))
    elements.append(Paragraph(f"{sc.school_name.upper()} - {datetime.date.today().year} - OFFICIAL DOCUMENT", ParagraphStyle('PC', fontSize=7, textColor=slate_200, alignment=1, tracking=4)))

    def add_watermark(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica-Bold', 60)
        canvas.setFillAlpha(0.02)
        canvas.drawCentredString(105*mm, 148*mm, "OFFICIAL RECEIPT")
        canvas.restoreState()

    try:
        doc.build(elements, onFirstPage=add_watermark, onLaterPages=add_watermark)
        pdf = buffer.getvalue()
        return pdf
    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise
    finally:
        buffer.close()

def generate_payment_receipt_qr(payment):
    """Generate QR code for payment verification (legacy function for Payment model)"""
    import qrcode
    from io import BytesIO
    import base64
    
    # Create QR code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    
    # Add payment verification data
    verification_data = {
        'receipt_no': payment.reference_number,
        'amount': str(payment.amount),
        'date': payment.date.strftime('%Y-%m-%d'),
        'student': payment.student.admission_number
    }
    
    qr.add_data(verification_data)
    qr.make(fit=True)
    
    # Create QR code image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode()

def send_payment_receipt(payment):
    """
    Automatically send payment receipt to parent via email and/or WhatsApp
    Uses parent contact details from student record
    """
    try:
        student = payment.student
        
        # Generate QR code for receipt
        qr_code = generate_payment_receipt_qr(payment)
        
        # Generate PDF receipt
        pdf_content = generate_payment_receipt(payment, qr_code)
        
        if not pdf_content:
            logger.error(f"Failed to generate PDF receipt for payment {payment.id}")
            return False, "Failed to generate receipt PDF"
        
        results = {
            'email_sent': False,
            'whatsapp_sent': False,
            'email_error': None,
            'whatsapp_error': None
        }
        
        # Send via email if parent email exists
        if student.parent_email:
            try:
                from django.template.loader import render_to_string
                
                subject = f'Payment Receipt - {payment.reference_number}'
                
                # Render HTML email template
                html_message = render_to_string(
                    'schools/email/payment_receipt.html',
                    {
                        'payment': payment,
                        'student': student,
                    }
                )
                
                # Plain text fallback
                text_message = f"""
Dear {student.parent_name},

Thank you for your payment. Please find attached the official receipt for the payment made for {student.get_full_name()}.

Payment Details:
- Receipt Number: {payment.reference_number}
- Amount: KES {payment.amount:,.2f}
- Payment Method: {payment.get_payment_method_display()}
- Date: {payment.date.strftime('%B %d, %Y')}
- Student: {student.get_full_name()}
- Admission Number: {student.admission_number}
- Term: Term {payment.term}

Please keep this receipt for your records.

Best regards,
{sc.school_name}
"""
                
                email = EmailMessage(
                    subject=subject,
                    body=text_message,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@bishopdrmandointernationalschool.org'),
                    to=[student.parent_email],
                )
                
                # Set HTML content
                email.content_subtype = "html"
                email.body = html_message
                
                # Attach PDF receipt
                email.attach(
                    f'receipt_{payment.reference_number}.pdf',
                    pdf_content,
                    'application/pdf'
                )
                
                email.send()
                results['email_sent'] = True
                logger.info(f"Receipt sent via email to {student.parent_email} for payment {payment.id}")
                
            except Exception as e:
                error_msg = f"Failed to send email: {str(e)}"
                results['email_error'] = error_msg
                logger.error(f"Email sending failed for payment {payment.id}: {error_msg}")
        
        # Send via WhatsApp if parent phone exists
        if student.parent_phone:
            try:
                from schools.utils.whatsapp import send_whatsapp_pdf, send_whatsapp_message
                
                # First, try to send the PDF receipt
                pdf_filename = f'receipt_{payment.reference_number}.pdf'
                caption = f"""Payment Receipt - {sc.school_name}

Receipt No: {payment.reference_number}
Student: {student.get_full_name()}
Admission No: {student.admission_number}
Amount: KES {payment.amount:,.2f}
Payment Method: {payment.get_payment_method_display()}
Date: {payment.date.strftime('%B %d, %Y')}
Term: Term {payment.term}

Thank you for your payment!"""
                
                # Convert PDF content to BytesIO if needed
                # Reset the buffer position to the beginning if it's a BytesIO object
                if isinstance(pdf_content, BytesIO):
                    pdf_content.seek(0)  # Reset to beginning
                    pdf_io = pdf_content
                elif isinstance(pdf_content, bytes):
                    pdf_io = BytesIO(pdf_content)
                else:
                    # If it's already a file-like object, try to read it
                    if hasattr(pdf_content, 'read'):
                        pdf_content.seek(0)  # Reset to beginning
                        pdf_io = BytesIO(pdf_content.read())
                    else:
                        pdf_io = BytesIO(pdf_content)
                
                # Try to send PDF via WhatsApp
                pdf_success, pdf_response = send_whatsapp_pdf(
                    student.parent_phone, 
                    pdf_io, 
                    filename=pdf_filename,
                    caption=caption
                )
                
                if pdf_success:
                    results['whatsapp_sent'] = True
                    results['whatsapp_pdf_sent'] = True
                    logger.info(f"Receipt PDF sent via WhatsApp to {student.parent_phone} for payment {payment.id}")
                else:
                    # If PDF sending fails, fall back to text message
                    logger.warning(f"PDF sending failed, falling back to text message: {pdf_response}")
                    
                    message = f"""Payment Receipt - Bishop Dr Mando International School

Receipt No: {payment.reference_number}
Student: {student.get_full_name()}
Admission No: {student.admission_number}
Amount: KES {payment.amount:,.2f}
Payment Method: {payment.get_payment_method_display()}
Date: {payment.date.strftime('%B %d, %Y')}
Term: Term {payment.term}

Your official receipt has been sent to your email. Please check your inbox.

Thank you for your payment!"""
                    
                    # send_whatsapp_message automatically formats the phone number
                    # It handles 07 -> 2547 conversion internally
                    success, response = send_whatsapp_message(student.parent_phone, message)
                    
                    if success:
                        results['whatsapp_sent'] = True
                        results['whatsapp_pdf_sent'] = False
                        logger.info(f"Receipt notification sent via WhatsApp (text) to {student.parent_phone} for payment {payment.id}")
                    else:
                        results['whatsapp_error'] = response if isinstance(response, str) else str(response)
                        logger.error(f"WhatsApp sending failed for payment {payment.id}: {response}")
                    
            except Exception as e:
                error_msg = f"Failed to send WhatsApp: {str(e)}"
                results['whatsapp_error'] = error_msg
                logger.error(f"WhatsApp sending failed for payment {payment.id}: {error_msg}")
        
        # Return success if at least one method succeeded
        if results['email_sent'] or results['whatsapp_sent']:
            return True, results
        else:
            error_summary = []
            if results['email_error']:
                error_summary.append(f"Email: {results['email_error']}")
            if results['whatsapp_error']:
                error_summary.append(f"WhatsApp: {results['whatsapp_error']}")
            if not student.parent_email and not student.parent_phone:
                error_summary.append("No parent contact information available")
            
            return False, "; ".join(error_summary) if error_summary else "Failed to send receipt"
            
    except Exception as e:
        error_msg = f"Error sending payment receipt: {str(e)}"
        logger.error(f"Error in send_payment_receipt for payment {payment.id}: {error_msg}")
        return False, error_msg


def generate_transport_fee_receipt(fee, qr_code=None):
    """Generate PDF receipt for transport fee payment matching the official school receipt design"""
    # Validate fee object
    if isinstance(fee, dict):
        logger.error(f"generate_transport_fee_receipt received a dict instead of TransportFee instance: {fee}")
        raise ValueError("fee must be a TransportFee instance, not a dict")
    
    if not hasattr(fee, 'reference_number'):
        logger.error(f"generate_transport_fee_receipt received invalid fee object: {type(fee)}")
        raise ValueError(f"fee object missing 'reference_number' attribute: {type(fee)}")
    
    buffer = BytesIO()
    
    # Create the PDF object using ReportLab with adjusted margins
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15*mm,
        leftMargin=15*mm,
        topMargin=10*mm,
        bottomMargin=10*mm
    )
    
    # Define colors - matching the modern purple gradient receipt design
    primary_color = colors.HexColor('#667eea')  # Purple gradient start
    secondary_color = colors.HexColor('#764ba2')  # Purple gradient end
    text_color = colors.HexColor('#2d3748')  # Dark gray text
    border_color = colors.HexColor('#667eea')  # Purple borders
    accent_color = colors.HexColor('#f7fafc')  # Light background
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Create custom styles (same as payment receipt)
    school_name_style = ParagraphStyle(
        'SchoolName',
        parent=styles['Normal'],
        textColor=primary_color,
        fontSize=16,
        alignment=1,
        fontName='Helvetica-Bold',
        spaceAfter=2
    )
    
    contact_style = ParagraphStyle(
        'Contact',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9,
        alignment=1,
        spaceAfter=2
    )
    
    receipt_title_style = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Normal'],
        textColor=primary_color,
        fontSize=12,
        alignment=1,
        fontName='Helvetica-Bold',
        spaceAfter=8
    )
    
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9,
        fontName='Helvetica-Bold'
    )
    
    value_style = ParagraphStyle(
        'Value',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9
    )
    
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9,
        fontName='Helvetica-Bold',
        alignment=1
    )
    
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9
    )
    
    # Container for PDF elements
    elements = []
    
    # Try to load school logo
    logo_image = None
    possible_logo_paths = [
        os.path.join(settings.STATIC_ROOT, 'images', 'logo.png'),
        os.path.join(settings.BASE_DIR, 'static', 'images', 'logo.png'),
        os.path.join(settings.BASE_DIR, 'schools', 'static', 'images', 'logo.png'),
    ]
    
    for path in possible_logo_paths:
        if os.path.exists(path):
            try:
                logo_image = Image(path, width=50*mm, height=50*mm)
                break
            except Exception as e:
                print(f"Error loading logo from {path}: {e}")
                logo_image = None
    
    # School Header with Logo
    if logo_image:
        school_header_data = [
            [logo_image, 
             Table([
                 [Paragraph("BISHOP DR. MANDO INTERNATIONAL SCHOOL", school_name_style)],
                 [Paragraph("Cell: 0738054336 P.O. Box 3101 Thika", contact_style)]
             ], colWidths=[130*mm]),
             ""]
        ]
        school_header = Table(school_header_data, colWidths=[50*mm, 100*mm, 30*mm])
        school_header.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
    else:
        school_header = Table([
            [Paragraph("BISHOP DR. MANDO INTERNATIONAL SCHOOL", school_name_style)],
            [Paragraph("Cell: 0738054336 P.O. Box 3101 Thika", contact_style)]
        ], colWidths=[180*mm])
        school_header.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
    
    elements.append(school_header)
    elements.append(Spacer(1, 8))
    
    # SCHOOL OFFICIAL RECEIPT Box
    receipt_box = Table([
        [Paragraph("SCHOOL OFFICIAL RECEIPT", receipt_title_style)]
    ], colWidths=[180*mm])
    
    receipt_box.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('BOX', (0, 0), (-1, -1), 1.5, border_color),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#E6F2FF')),
    ]))
    elements.append(receipt_box)
    elements.append(Spacer(1, 10))
    
    # Receipt Number and Date
    receipt_info = Table([
        [Paragraph("No.", label_style), Paragraph(str(fee.reference_number), value_style),
         Paragraph("Date:", label_style), Paragraph(fee.date.strftime('%d/%m/%Y'), value_style)]
    ], colWidths=[15*mm, 50*mm, 20*mm, 50*mm])
    
    receipt_info.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('ALIGN', (2, 0), (2, 0), 'LEFT'),
        ('ALIGN', (3, 0), (3, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(receipt_info)
    elements.append(Spacer(1, 8))
    
    # Received from
    received_from = Table([
        [Paragraph("Received from:", label_style), 
         Paragraph(fee.student.parent_name or fee.student.get_full_name(), value_style)]
    ], colWidths=[40*mm, 140*mm])
    
    received_from.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, text_color),
    ]))
    elements.append(received_from)
    elements.append(Spacer(1, 8))
    
    # Class/Grade and Term
    class_term = Table([
        [Paragraph("Class / Grade", label_style), 
         Paragraph(str(fee.student.grade) if fee.student.grade else "", value_style),
         Paragraph("Term:", label_style), 
         Paragraph(f"Term {fee.term}", value_style)]
    ], colWidths=[35*mm, 50*mm, 20*mm, 50*mm])
    
    class_term.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('ALIGN', (2, 0), (2, 0), 'LEFT'),
        ('ALIGN', (3, 0), (3, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, text_color),
        ('LINEBELOW', (3, 0), (3, 0), 0.5, text_color),
    ]))
    elements.append(class_term)
    elements.append(Spacer(1, 8))
    
    # Amount in words
    amount_words = number_to_words(float(fee.amount))
    amount_in_words = Table([
        [Paragraph("Amount in words", label_style), 
         Paragraph(amount_words, value_style)]
    ], colWidths=[40*mm, 140*mm])
    
    amount_in_words.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, text_color),
    ]))
    elements.append(amount_in_words)
    elements.append(Spacer(1, 10))
    
    # Payment Breakdown Table
    amount_paid = float(fee.amount)
    payment_items = [
        [Paragraph("BEING PAYMENT OF", table_header_style), 
         Paragraph("KSHS.", table_header_style), 
         Paragraph("CTS.", table_header_style)]
    ]
    
    # Add transport fee
    if amount_paid > 0:
        shillings = int(amount_paid)
        cents = round((amount_paid - shillings) * 100)
        payment_items.append([
            Paragraph(f"Transport Fee - {fee.route.name}", table_cell_style),
            Paragraph(f"{shillings:,}", table_cell_style),
            Paragraph(f"{cents:02d}", table_cell_style)
        ])
    
    # Add empty rows for other items
    for item in ["Admission Fee", "Tuition Fee", "School Uniform", "Porridge / Food", "Exam Fee", 
                 "Stationery", "Assessment Book", "Diary", "Trip", "Others"]:
        payment_items.append([
            Paragraph(item, table_cell_style),
            Paragraph("", table_cell_style),
            Paragraph("", table_cell_style)
        ])
    
    # Total row
    total_shillings = int(amount_paid)
    total_cents = round((amount_paid - total_shillings) * 100)
    payment_items.append([
        Paragraph("TOTAL", ParagraphStyle('Total', parent=table_cell_style, fontName='Helvetica-Bold')),
        Paragraph(f"{total_shillings:,}", ParagraphStyle('Total', parent=table_cell_style, fontName='Helvetica-Bold')),
        Paragraph(f"{total_cents:02d}", ParagraphStyle('Total', parent=table_cell_style, fontName='Helvetica-Bold'))
    ])
    
    payment_table = Table(payment_items, colWidths=[100*mm, 40*mm, 40*mm])
    payment_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E6F2FF')),
        ('LINEABOVE', (0, -1), (-1, -1), 1, border_color),
    ]))
    elements.append(payment_table)
    elements.append(Spacer(1, 10))
    
    # Payment Method
    payment_method_text = fee.get_payment_method_display()
    if hasattr(fee, 'transaction_id') and fee.transaction_id:
        payment_method_text += f" No. {fee.transaction_id}"
    
    payment_method = Table([
        [Paragraph("Cash / Money Order / Mpesa / Cheque No.", label_style),
         Paragraph(payment_method_text, value_style)]
    ], colWidths=[70*mm, 110*mm])
    
    payment_method.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, text_color),
    ]))
    elements.append(payment_method)
    elements.append(Spacer(1, 8))
    
    # Fees Balance (if applicable)
    balance = 0  # Transport fees typically don't have balance tracking
    fees_balance = Table([
        [Paragraph("Fees Balance Kshs", label_style),
         Paragraph(f"{balance:,.2f}", value_style)]
    ], colWidths=[40*mm, 140*mm])
    
    fees_balance.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, text_color),
    ]))
    elements.append(fees_balance)
    elements.append(Spacer(1, 20))
    
    # Signatures
    signatures = Table([
        [Paragraph("Signed by", value_style), Paragraph("Signed by", value_style)],
        [Paragraph("_" * 25, value_style), Paragraph("_" * 25, value_style)],
        [Paragraph("H/Teacher", value_style), Paragraph("Director", value_style)]
    ], colWidths=[90*mm, 90*mm])
    
    signatures.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(signatures)
    
    try:
        # Build PDF document
        doc.build(elements)
        pdf = buffer.getvalue()
        return pdf
    except Exception as e:
        print(f"Error generating PDF: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        buffer.close()


def generate_food_fee_receipt(fee, qr_code=None):
    """Generate PDF receipt for food fee payment matching the official school receipt design"""
    # Validate fee object - can be FoodFee or StudentMealPayment
    if isinstance(fee, dict):
        logger.error(f"generate_food_fee_receipt received a dict instead of fee instance: {fee}")
        raise ValueError("fee must be a FoodFee or StudentMealPayment instance, not a dict")
    
    if not hasattr(fee, 'reference_number'):
        logger.error(f"generate_food_fee_receipt received invalid fee object: {type(fee)}")
        raise ValueError(f"fee object missing 'reference_number' attribute: {type(fee)}")
    
    buffer = BytesIO()
    
    # Create the PDF object using ReportLab with adjusted margins
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15*mm,
        leftMargin=15*mm,
        topMargin=10*mm,
        bottomMargin=10*mm
    )
    
    # Define colors - matching the modern purple gradient receipt design
    primary_color = colors.HexColor('#667eea')  # Purple gradient start
    secondary_color = colors.HexColor('#764ba2')  # Purple gradient end
    text_color = colors.HexColor('#2d3748')  # Dark gray text
    border_color = colors.HexColor('#667eea')  # Purple borders
    accent_color = colors.HexColor('#f7fafc')  # Light background
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Create custom styles (same as payment receipt)
    school_name_style = ParagraphStyle(
        'SchoolName',
        parent=styles['Normal'],
        textColor=primary_color,
        fontSize=16,
        alignment=1,
        fontName='Helvetica-Bold',
        spaceAfter=2
    )
    
    contact_style = ParagraphStyle(
        'Contact',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9,
        alignment=1,
        spaceAfter=2
    )
    
    receipt_title_style = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Normal'],
        textColor=primary_color,
        fontSize=12,
        alignment=1,
        fontName='Helvetica-Bold',
        spaceAfter=8
    )
    
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9,
        fontName='Helvetica-Bold'
    )
    
    value_style = ParagraphStyle(
        'Value',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9
    )
    
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9,
        fontName='Helvetica-Bold',
        alignment=1
    )
    
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9
    )
    
    # Container for PDF elements
    elements = []
    
    # Try to load school logo
    logo_image = None
    possible_logo_paths = [
        os.path.join(settings.STATIC_ROOT, 'images', 'logo.png'),
        os.path.join(settings.BASE_DIR, 'static', 'images', 'logo.png'),
        os.path.join(settings.BASE_DIR, 'schools', 'static', 'images', 'logo.png'),
    ]
    
    for path in possible_logo_paths:
        if os.path.exists(path):
            try:
                logo_image = Image(path, width=50*mm, height=50*mm)
                break
            except Exception as e:
                print(f"Error loading logo from {path}: {e}")
                logo_image = None
    
    # School Header with Logo
    if logo_image:
        school_header_data = [
            [logo_image, 
             Table([
                 [Paragraph("BISHOP DR. MANDO INTERNATIONAL SCHOOL", school_name_style)],
                 [Paragraph("Cell: 0738054336 P.O. Box 3101 Thika", contact_style)]
             ], colWidths=[130*mm]),
             ""]
        ]
        school_header = Table(school_header_data, colWidths=[50*mm, 100*mm, 30*mm])
        school_header.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
    else:
        school_header = Table([
            [Paragraph("BISHOP DR. MANDO INTERNATIONAL SCHOOL", school_name_style)],
            [Paragraph("Cell: 0738054336 P.O. Box 3101 Thika", contact_style)]
        ], colWidths=[180*mm])
        school_header.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
    
    elements.append(school_header)
    elements.append(Spacer(1, 8))
    
    # SCHOOL OFFICIAL RECEIPT Box
    receipt_box = Table([
        [Paragraph("SCHOOL OFFICIAL RECEIPT", receipt_title_style)]
    ], colWidths=[180*mm])
    
    receipt_box.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('BOX', (0, 0), (-1, -1), 1.5, border_color),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#E6F2FF')),
    ]))
    elements.append(receipt_box)
    elements.append(Spacer(1, 10))
    
    # Get date - handle both FoodFee and StudentMealPayment
    payment_date = fee.date if hasattr(fee, 'date') else (fee.payment_date if hasattr(fee, 'payment_date') else timezone.now().date())
    if hasattr(payment_date, 'strftime'):
        date_str = payment_date.strftime('%d/%m/%Y')
    else:
        date_str = str(payment_date)
    
    # Receipt Number and Date
    receipt_info = Table([
        [Paragraph("No.", label_style), Paragraph(str(fee.reference_number), value_style),
         Paragraph("Date:", label_style), Paragraph(date_str, value_style)]
    ], colWidths=[15*mm, 50*mm, 20*mm, 50*mm])
    
    receipt_info.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('ALIGN', (2, 0), (2, 0), 'LEFT'),
        ('ALIGN', (3, 0), (3, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(receipt_info)
    elements.append(Spacer(1, 8))
    
    # Received from
    student = fee.student
    received_from = Table([
        [Paragraph("Received from:", label_style), 
         Paragraph(student.parent_name or student.get_full_name(), value_style)]
    ], colWidths=[40*mm, 140*mm])
    
    received_from.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, text_color),
    ]))
    elements.append(received_from)
    elements.append(Spacer(1, 8))
    
    # Get term - handle both models
    term = fee.term if hasattr(fee, 'term') else (student.current_term if hasattr(student, 'current_term') else 1)
    
    # Class/Grade and Term
    class_term = Table([
        [Paragraph("Class / Grade", label_style), 
         Paragraph(str(student.grade) if student.grade else "", value_style),
         Paragraph("Term:", label_style), 
         Paragraph(f"Term {term}", value_style)]
    ], colWidths=[35*mm, 50*mm, 20*mm, 50*mm])
    
    class_term.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('ALIGN', (2, 0), (2, 0), 'LEFT'),
        ('ALIGN', (3, 0), (3, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, text_color),
        ('LINEBELOW', (3, 0), (3, 0), 0.5, text_color),
    ]))
    elements.append(class_term)
    elements.append(Spacer(1, 8))
    
    # Amount in words
    amount_paid = float(fee.amount)
    amount_words = number_to_words(amount_paid)
    amount_in_words = Table([
        [Paragraph("Amount in words", label_style), 
         Paragraph(amount_words, value_style)]
    ], colWidths=[40*mm, 140*mm])
    
    amount_in_words.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, text_color),
    ]))
    elements.append(amount_in_words)
    elements.append(Spacer(1, 10))
    
    # Payment Breakdown Table
    payment_items = [
        [Paragraph("BEING PAYMENT OF", table_header_style), 
         Paragraph("KSHS.", table_header_style), 
         Paragraph("CTS.", table_header_style)]
    ]
    
    # Add food/meal fee - handle both FoodFee and StudentMealPayment
    if amount_paid > 0:
        shillings = int(amount_paid)
        cents = round((amount_paid - shillings) * 100)
        
        # Determine meal type description
        if hasattr(fee, 'get_meal_type_display'):
            meal_desc = fee.get_meal_type_display()
            if hasattr(fee, 'number_of_days'):
                meal_desc += f" ({fee.number_of_days} days)"
        elif hasattr(fee, 'food_plan'):
            meal_desc = f"{fee.food_plan.name} ({fee.food_plan.get_meal_type_display()})"
        else:
            meal_desc = "Meal Payment"
        
        payment_items.append([
            Paragraph(f"Porridge / Food - {meal_desc}", table_cell_style),
            Paragraph(f"{shillings:,}", table_cell_style),
            Paragraph(f"{cents:02d}", table_cell_style)
        ])
    
    # Add empty rows for other items
    for item in ["Admission Fee", "Tuition Fee", "School Uniform", "Exam Fee", 
                 "Stationery", "Assessment Book", "Diary", "Trip", "Transport", "Others"]:
        payment_items.append([
            Paragraph(item, table_cell_style),
            Paragraph("", table_cell_style),
            Paragraph("", table_cell_style)
        ])
    
    # Total row
    total_shillings = int(amount_paid)
    total_cents = round((amount_paid - total_shillings) * 100)
    payment_items.append([
        Paragraph("TOTAL", ParagraphStyle('Total', parent=table_cell_style, fontName='Helvetica-Bold')),
        Paragraph(f"{total_shillings:,}", ParagraphStyle('Total', parent=table_cell_style, fontName='Helvetica-Bold')),
        Paragraph(f"{total_cents:02d}", ParagraphStyle('Total', parent=table_cell_style, fontName='Helvetica-Bold'))
    ])
    
    payment_table = Table(payment_items, colWidths=[100*mm, 40*mm, 40*mm])
    payment_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E6F2FF')),
        ('LINEABOVE', (0, -1), (-1, -1), 1, border_color),
    ]))
    elements.append(payment_table)
    elements.append(Spacer(1, 10))
    
    # Payment Method
    payment_method_text = fee.get_payment_method_display() if hasattr(fee, 'get_payment_method_display') else "Cash"
    if hasattr(fee, 'transaction_id') and fee.transaction_id:
        payment_method_text += f" No. {fee.transaction_id}"
    elif hasattr(fee, 'reference_number'):
        payment_method_text += f" No. {fee.reference_number}"
    
    payment_method = Table([
        [Paragraph("Cash / Money Order / Mpesa / Cheque No.", label_style),
         Paragraph(payment_method_text, value_style)]
    ], colWidths=[70*mm, 110*mm])
    
    payment_method.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, text_color),
    ]))
    elements.append(payment_method)
    elements.append(Spacer(1, 8))
    
    # Fees Balance
    balance = 0
    if hasattr(fee, 'balance'):
        balance = float(fee.balance)
    elif hasattr(fee, 'get_balance'):
        balance = float(fee.get_balance())
    
    fees_balance = Table([
        [Paragraph("Fees Balance Kshs", label_style),
         Paragraph(f"{balance:,.2f}", value_style)]
    ], colWidths=[40*mm, 140*mm])
    
    fees_balance.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, text_color),
    ]))
    elements.append(fees_balance)
    elements.append(Spacer(1, 20))
    
    # Signatures
    signatures = Table([
        [Paragraph("Signed by", value_style), Paragraph("Signed by", value_style)],
        [Paragraph("_" * 25, value_style), Paragraph("_" * 25, value_style)],
        [Paragraph("H/Teacher", value_style), Paragraph("Director", value_style)]
    ], colWidths=[90*mm, 90*mm])
    
    signatures.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(signatures)
    
    try:
        # Build PDF document
        doc.build(elements)
        pdf = buffer.getvalue()
        return pdf
    except Exception as e:
        print(f"Error generating PDF: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        buffer.close()


def generate_transport_payment_receipt(fee, qr_code=None):
    """
    Generate beautiful PDF receipt specifically for transport payments
    Features a modern blue/teal transport-themed design
    """
    # Validate fee object
    if isinstance(fee, dict):
        logger.error(f"generate_transport_payment_receipt received a dict instead of TransportFee instance: {fee}")
        raise ValueError("fee must be a TransportFee instance, not a dict")
    
    if not hasattr(fee, 'reference_number'):
        logger.error(f"generate_transport_payment_receipt received invalid fee object: {type(fee)}")
        raise ValueError(f"fee object missing 'reference_number' attribute: {type(fee)}")
    
    buffer = BytesIO()
    
    # Create the PDF object
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15*mm,
        leftMargin=15*mm,
        topMargin=10*mm,
        bottomMargin=10*mm
    )
    
    # Transport-themed colors - Blue/Teal gradient
    primary_color = colors.HexColor('#0ea5e9')  # Sky blue
    secondary_color = colors.HexColor('#06b6d4')  # Cyan
    accent_color = colors.HexColor('#0284c7')  # Deep blue
    text_color = colors.HexColor('#1e293b')  # Dark slate
    border_color = colors.HexColor('#0ea5e9')
    light_bg = colors.HexColor('#f0f9ff')  # Light blue background
    header_bg = colors.HexColor('#0ea5e9')  # Header background
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Create custom styles
    school_name_style = ParagraphStyle(
        'SchoolName',
        parent=styles['Normal'],
        textColor=colors.HexColor('#ffffff'),
        fontSize=18,
        alignment=1,
        fontName='Helvetica-Bold',
        spaceAfter=3
    )
    
    contact_style = ParagraphStyle(
        'Contact',
        parent=styles['Normal'],
        textColor=colors.HexColor('#e0f2fe'),
        fontSize=9,
        alignment=1,
        spaceAfter=2
    )
    
    receipt_title_style = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Normal'],
        textColor=colors.HexColor('#ffffff'),
        fontSize=14,
        alignment=1,
        fontName='Helvetica-Bold',
        spaceAfter=8
    )
    
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9,
        fontName='Helvetica-Bold'
    )
    
    value_style = ParagraphStyle(
        'Value',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9
    )
    
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        textColor=colors.HexColor('#ffffff'),
        fontSize=9,
        fontName='Helvetica-Bold',
        alignment=1
    )
    
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9
    )
    
    # Container for PDF elements
    elements = []
    
    # Try to load school logo
    logo_image = None
    possible_logo_paths = [
        os.path.join(settings.STATIC_ROOT, 'images', 'logo.png'),
        os.path.join(settings.BASE_DIR, 'static', 'images', 'logo.png'),
        os.path.join(settings.BASE_DIR, 'schools', 'static', 'images', 'logo.png'),
    ]
    
    for path in possible_logo_paths:
        if os.path.exists(path):
            try:
                logo_image = Image(path, width=50*mm, height=50*mm)
                break
            except Exception as e:
                print(f"Error loading logo from {path}: {e}")
                logo_image = None
    
    # Beautiful Header with Gradient Background
    if logo_image:
        header_data = [
            [logo_image, 
             Table([
                 [Paragraph("BISHOP DR. MANDO INTERNATIONAL SCHOOL", school_name_style)],
                 [Paragraph("Cell: 0738054336 | P.O. Box 3101 Thika", contact_style)]
             ], colWidths=[130*mm]),
             ""]
        ]
        header_table = Table(header_data, colWidths=[50*mm, 100*mm, 30*mm])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, -1), header_bg),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
    else:
        header_table = Table([
            [Paragraph("BISHOP DR. MANDO INTERNATIONAL SCHOOL", school_name_style)],
            [Paragraph("Cell: 0738054336 | P.O. Box 3101 Thika", contact_style)]
        ], colWidths=[180*mm])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('BACKGROUND', (0, 0), (-1, -1), header_bg),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
    
    elements.append(header_table)
    elements.append(Spacer(1, 10))
    
    # Transport Receipt Title Box
    receipt_title_box = Table([
        [Paragraph("TRANSPORT PAYMENT RECEIPT", receipt_title_style)]
    ], colWidths=[180*mm])
    
    receipt_title_box.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#ffffff')),
        ('BACKGROUND', (0, 0), (-1, -1), accent_color),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#ffffff')),
    ]))
    elements.append(receipt_title_box)
    elements.append(Spacer(1, 12))
    
    # Receipt Number and Date - Modern card style
    receipt_info = Table([
        [Paragraph("Receipt No.", label_style), 
         Paragraph(str(fee.reference_number), ParagraphStyle('ReceiptNum', parent=value_style, fontName='Helvetica-Bold', textColor=primary_color)),
         Paragraph("Date:", label_style), 
         Paragraph(fee.date.strftime('%B %d, %Y'), value_style)]
    ], colWidths=[30*mm, 50*mm, 20*mm, 50*mm])
    
    receipt_info.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('ALIGN', (2, 0), (2, 0), 'LEFT'),
        ('ALIGN', (3, 0), (3, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, -1), light_bg),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [light_bg]),
    ]))
    elements.append(receipt_info)
    elements.append(Spacer(1, 10))
    
    # Received from
    received_from = Table([
        [Paragraph("Received from:", label_style), 
         Paragraph(fee.student.parent_name or fee.student.get_full_name(), value_style)]
    ], colWidths=[40*mm, 140*mm])
    
    received_from.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (1, 0), (1, 0), 1, border_color),
    ]))
    elements.append(received_from)
    elements.append(Spacer(1, 8))
    
    # Student Information Card
    student_info = Table([
        [Paragraph("Student Name:", label_style), 
         Paragraph(fee.student.get_full_name(), value_style),
         Paragraph("Admission No:", label_style),
         Paragraph(fee.student.admission_number, value_style)],
        [Paragraph("Class / Grade:", label_style), 
         Paragraph(str(fee.student.grade) if fee.student.grade else "N/A", value_style),
         Paragraph("Term:", label_style), 
         Paragraph(f"Term {fee.term}", value_style)],
        [Paragraph("Route:", label_style), 
         Paragraph(fee.route.name, ParagraphStyle('RouteValue', parent=value_style, textColor=primary_color, fontName='Helvetica-Bold')),
         Paragraph("Vehicle:", label_style),
         Paragraph(fee.route.vehicle.vehicle_number if hasattr(fee.route, 'vehicle') and fee.route.vehicle else "N/A", value_style)]
    ], colWidths=[35*mm, 50*mm, 30*mm, 50*mm])
    
    student_info.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 0), (-1, -1), light_bg),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, border_color),
        ('LINEBELOW', (3, 0), (3, 0), 0.5, border_color),
        ('LINEBELOW', (1, 1), (1, 1), 0.5, border_color),
        ('LINEBELOW', (3, 1), (3, 1), 0.5, border_color),
    ]))
    elements.append(student_info)
    elements.append(Spacer(1, 10))
    
    # Amount in words
    amount_words = number_to_words(float(fee.amount))
    amount_in_words = Table([
        [Paragraph("Amount in words:", label_style), 
         Paragraph(amount_words, value_style)]
    ], colWidths=[40*mm, 140*mm])
    
    amount_in_words.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (1, 0), (1, 0), 1, border_color),
    ]))
    elements.append(amount_in_words)
    elements.append(Spacer(1, 12))
    
    # Payment Details Table
    amount_paid = float(fee.amount)
    shillings = int(amount_paid)
    cents = round((amount_paid - shillings) * 100)
    
    payment_table_data = [
        [Paragraph("DESCRIPTION", table_header_style), 
         Paragraph("AMOUNT (KES)", table_header_style)],
        [Paragraph(f"Transport Fee - {fee.route.name}", table_cell_style),
         Paragraph(f"{amount_paid:,.2f}", ParagraphStyle('Amount', parent=table_cell_style, fontName='Helvetica-Bold', textColor=primary_color))],
        [Paragraph("TOTAL", ParagraphStyle('TotalLabel', parent=table_cell_style, fontName='Helvetica-Bold')),
         Paragraph(f"{amount_paid:,.2f}", ParagraphStyle('TotalAmount', parent=table_cell_style, fontName='Helvetica-Bold', textColor=primary_color))]
    ]
    
    payment_table = Table(payment_table_data, colWidths=[120*mm, 60*mm])
    payment_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, border_color),
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#ffffff')),
        ('LINEABOVE', (0, -1), (-1, -1), 2, accent_color),
        ('BACKGROUND', (0, -1), (-1, -1), light_bg),
    ]))
    elements.append(payment_table)
    elements.append(Spacer(1, 12))
    
    # Payment Method
    payment_method_text = fee.get_payment_method_display()
    if hasattr(fee, 'transaction_id') and fee.transaction_id:
        payment_method_text += f" - {fee.transaction_id}"
    
    payment_method = Table([
        [Paragraph("Payment Method:", label_style),
         Paragraph(payment_method_text, value_style)]
    ], colWidths=[50*mm, 130*mm])
    
    payment_method.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 0), (-1, -1), light_bg),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(payment_method)
    elements.append(Spacer(1, 15))
    
    # QR Code and Footer
    footer_data = []
    if qr_code:
        try:
            qr_image_data = base64.b64decode(qr_code)
            qr_buffer = BytesIO(qr_image_data)
            qr_image = Image(qr_buffer, width=40*mm, height=40*mm)
            footer_data = [
                [qr_image, 
                 Table([
                     [Paragraph("Scan to verify receipt", ParagraphStyle('QRText', parent=value_style, fontSize=8, textColor=text_color, alignment=1))],
                     [Paragraph("Thank you for your payment!", ParagraphStyle('ThankYou', parent=value_style, fontSize=10, fontName='Helvetica-Bold', textColor=primary_color, alignment=1))]
                 ], colWidths=[140*mm]),
                 ""]
            ]
        except Exception as e:
            logger.error(f"Error adding QR code to transport receipt: {e}")
            footer_data = [
                [Paragraph("Thank you for your payment!", ParagraphStyle('ThankYou', parent=value_style, fontSize=11, fontName='Helvetica-Bold', textColor=primary_color, alignment=1))]
            ]
    else:
        footer_data = [
            [Paragraph("Thank you for your payment!", ParagraphStyle('ThankYou', parent=value_style, fontSize=11, fontName='Helvetica-Bold', textColor=primary_color, alignment=1))]
        ]
    
    if len(footer_data[0]) > 1:
        footer_table = Table(footer_data, colWidths=[50*mm, 100*mm, 30*mm])
        footer_table.setStyle(TableStyle([
            ('ALIGN', (1, 0), (1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
    else:
        footer_table = Table(footer_data, colWidths=[180*mm])
        footer_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
    
    elements.append(footer_table)
    elements.append(Spacer(1, 10))
    
    # Signatures
    signatures = Table([
        [Paragraph("Authorized Signature", ParagraphStyle('SigLabel', parent=value_style, fontSize=8, alignment=1)),
         Paragraph("Parent/Guardian Signature", ParagraphStyle('SigLabel', parent=value_style, fontSize=8, alignment=1))],
        [Paragraph("_" * 30, ParagraphStyle('SigLine', parent=value_style, fontSize=8, alignment=1)),
         Paragraph("_" * 30, ParagraphStyle('SigLine', parent=value_style, fontSize=8, alignment=1))],
        [Paragraph("School Administrator", ParagraphStyle('SigTitle', parent=value_style, fontSize=8, alignment=1)),
         Paragraph("", ParagraphStyle('SigTitle', parent=value_style, fontSize=8, alignment=1))]
    ], colWidths=[90*mm, 90*mm])
    
    signatures.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(signatures)
    
    try:
        # Build PDF document
        doc.build(elements)
        pdf = buffer.getvalue()
        return pdf
    except Exception as e:
        logger.error(f"Error generating transport payment PDF: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        buffer.close()


def generate_meal_payment_receipt(payment, qr_code=None):
    """
    Generate beautiful PDF receipt specifically for meal payments
    Features a modern orange/green food-themed design
    """
    # Validate payment object
    from schools.models import StudentMealPayment
    if isinstance(payment, dict):
        logger.error(f"generate_meal_payment_receipt received a dict instead of StudentMealPayment instance: {payment}")
        raise ValueError("payment must be a StudentMealPayment instance, not a dict")
    
    if not hasattr(payment, 'reference_number'):
        logger.error(f"generate_meal_payment_receipt received invalid payment object: {type(payment)}")
        raise ValueError(f"payment object missing 'reference_number' attribute: {type(payment)}")
    
    buffer = BytesIO()
    
    # Create the PDF object
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15*mm,
        leftMargin=15*mm,
        topMargin=10*mm,
        bottomMargin=10*mm
    )
    
    # Meal/Food-themed colors - Orange/Green gradient
    primary_color = colors.HexColor('#f97316')  # Orange
    secondary_color = colors.HexColor('#ea580c')  # Deep orange
    accent_color = colors.HexColor('#fb923c')  # Light orange
    text_color = colors.HexColor('#1e293b')  # Dark slate
    border_color = colors.HexColor('#f97316')
    light_bg = colors.HexColor('#fff7ed')  # Light orange background
    header_bg = colors.HexColor('#f97316')  # Header background
    
    # Get all payments in the group if grouped
    all_payments = []
    if payment.payment_group:
        all_payments = StudentMealPayment.objects.filter(
            payment_group=payment.payment_group
        ).order_by('meal_type')
    else:
        all_payments = [payment]
    
    total_amount = sum(p.amount for p in all_payments)
    meal_types = [p.get_meal_type_display() for p in all_payments]
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Create custom styles
    school_name_style = ParagraphStyle(
        'SchoolName',
        parent=styles['Normal'],
        textColor=colors.HexColor('#ffffff'),
        fontSize=18,
        alignment=1,
        fontName='Helvetica-Bold',
        spaceAfter=3
    )
    
    contact_style = ParagraphStyle(
        'Contact',
        parent=styles['Normal'],
        textColor=colors.HexColor('#ffedd5'),
        fontSize=9,
        alignment=1,
        spaceAfter=2
    )
    
    receipt_title_style = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Normal'],
        textColor=colors.HexColor('#ffffff'),
        fontSize=14,
        alignment=1,
        fontName='Helvetica-Bold',
        spaceAfter=8
    )
    
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9,
        fontName='Helvetica-Bold'
    )
    
    value_style = ParagraphStyle(
        'Value',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9
    )
    
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        textColor=colors.HexColor('#ffffff'),
        fontSize=9,
        fontName='Helvetica-Bold',
        alignment=1
    )
    
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        textColor=text_color,
        fontSize=9
    )
    
    # Container for PDF elements
    elements = []
    
    # Try to load school logo
    logo_image = None
    possible_logo_paths = [
        os.path.join(settings.STATIC_ROOT, 'images', 'logo.png'),
        os.path.join(settings.BASE_DIR, 'static', 'images', 'logo.png'),
        os.path.join(settings.BASE_DIR, 'schools', 'static', 'images', 'logo.png'),
    ]
    
    for path in possible_logo_paths:
        if os.path.exists(path):
            try:
                logo_image = Image(path, width=50*mm, height=50*mm)
                break
            except Exception as e:
                print(f"Error loading logo from {path}: {e}")
                logo_image = None
    
    # Beautiful Header with Gradient Background
    if logo_image:
        header_data = [
            [logo_image, 
             Table([
                 [Paragraph("BISHOP DR. MANDO INTERNATIONAL SCHOOL", school_name_style)],
                 [Paragraph("Cell: 0738054336 | P.O. Box 3101 Thika", contact_style)]
             ], colWidths=[130*mm]),
             ""]
        ]
        header_table = Table(header_data, colWidths=[50*mm, 100*mm, 30*mm])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, -1), header_bg),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
    else:
        header_table = Table([
            [Paragraph("BISHOP DR. MANDO INTERNATIONAL SCHOOL", school_name_style)],
            [Paragraph("Cell: 0738054336 | P.O. Box 3101 Thika", contact_style)]
        ], colWidths=[180*mm])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('BACKGROUND', (0, 0), (-1, -1), header_bg),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
    
    elements.append(header_table)
    elements.append(Spacer(1, 10))
    
    # Meal Receipt Title Box
    receipt_title_box = Table([
        [Paragraph("MEAL PAYMENT RECEIPT", receipt_title_style)]
    ], colWidths=[180*mm])
    
    receipt_title_box.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#ffffff')),
        ('BACKGROUND', (0, 0), (-1, -1), secondary_color),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#ffffff')),
    ]))
    elements.append(receipt_title_box)
    elements.append(Spacer(1, 12))
    
    # Receipt Number and Date - Modern card style
    payment_date = payment.payment_date if hasattr(payment, 'payment_date') else payment.date
    receipt_info = Table([
        [Paragraph("Receipt No.", label_style), 
         Paragraph(str(payment.reference_number), ParagraphStyle('ReceiptNum', parent=value_style, fontName='Helvetica-Bold', textColor=primary_color)),
         Paragraph("Date:", label_style), 
         Paragraph(payment_date.strftime('%B %d, %Y'), value_style)]
    ], colWidths=[30*mm, 50*mm, 20*mm, 50*mm])
    
    receipt_info.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('ALIGN', (2, 0), (2, 0), 'LEFT'),
        ('ALIGN', (3, 0), (3, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, -1), light_bg),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [light_bg]),
    ]))
    elements.append(receipt_info)
    elements.append(Spacer(1, 10))
    
    # Received from
    received_from = Table([
        [Paragraph("Received from:", label_style), 
         Paragraph(payment.student.parent_name or payment.student.get_full_name(), value_style)]
    ], colWidths=[40*mm, 140*mm])
    
    received_from.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (1, 0), (1, 0), 1, border_color),
    ]))
    elements.append(received_from)
    elements.append(Spacer(1, 8))
    
    # Student Information Card
    student_info = Table([
        [Paragraph("Student Name:", label_style), 
         Paragraph(payment.student.get_full_name(), value_style),
         Paragraph("Admission No:", label_style),
         Paragraph(payment.student.admission_number, value_style)],
        [Paragraph("Class / Grade:", label_style), 
         Paragraph(str(payment.student.grade) if payment.student.grade else "N/A", value_style),
         Paragraph("Location:", label_style), 
         Paragraph(payment.student.get_location_display() if hasattr(payment.student, 'get_location_display') else "N/A", value_style)],
        [Paragraph("Meal Type(s):", label_style), 
         Paragraph(", ".join(meal_types), ParagraphStyle('MealValue', parent=value_style, textColor=primary_color, fontName='Helvetica-Bold')),
         Paragraph("Days:", label_style),
         Paragraph(f"{payment.number_of_days} days" if hasattr(payment, 'number_of_days') else "N/A", value_style)]
    ], colWidths=[35*mm, 50*mm, 30*mm, 50*mm])
    
    student_info.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 0), (-1, -1), light_bg),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, border_color),
        ('LINEBELOW', (3, 0), (3, 0), 0.5, border_color),
        ('LINEBELOW', (1, 1), (1, 1), 0.5, border_color),
        ('LINEBELOW', (3, 1), (3, 1), 0.5, border_color),
    ]))
    elements.append(student_info)
    elements.append(Spacer(1, 10))
    
    # Amount in words
    amount_words = number_to_words(float(total_amount))
    amount_in_words = Table([
        [Paragraph("Amount in words:", label_style), 
         Paragraph(amount_words, value_style)]
    ], colWidths=[40*mm, 140*mm])
    
    amount_in_words.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (1, 0), (1, 0), 1, border_color),
    ]))
    elements.append(amount_in_words)
    elements.append(Spacer(1, 12))
    
    # Payment Details Table
    payment_table_data = [
        [Paragraph("MEAL TYPE", table_header_style), 
         Paragraph("AMOUNT (KES)", table_header_style)]
    ]
    
    # Add each meal type as a row
    for p in all_payments:
        payment_table_data.append([
            Paragraph(p.get_meal_type_display(), table_cell_style),
            Paragraph(f"{p.amount:,.2f}", table_cell_style)
        ])
    
    # Total row
    payment_table_data.append([
        Paragraph("TOTAL", ParagraphStyle('TotalLabel', parent=table_cell_style, fontName='Helvetica-Bold')),
        Paragraph(f"{total_amount:,.2f}", ParagraphStyle('TotalAmount', parent=table_cell_style, fontName='Helvetica-Bold', textColor=primary_color))
    ])
    
    payment_table = Table(payment_table_data, colWidths=[120*mm, 60*mm])
    payment_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, border_color),
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#ffffff')),
        ('LINEABOVE', (0, -1), (-1, -1), 2, secondary_color),
        ('BACKGROUND', (0, -1), (-1, -1), light_bg),
    ]))
    elements.append(payment_table)
    elements.append(Spacer(1, 12))
    
    # Payment Method
    payment_method_text = payment.get_payment_method_display()
    if hasattr(payment, 'transaction_id') and payment.transaction_id:
        payment_method_text += f" - {payment.transaction_id}"
    
    payment_method = Table([
        [Paragraph("Payment Method:", label_style),
         Paragraph(payment_method_text, value_style)]
    ], colWidths=[50*mm, 130*mm])
    
    payment_method.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 0), (-1, -1), light_bg),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(payment_method)
    elements.append(Spacer(1, 15))
    
    # QR Code and Footer
    footer_data = []
    if qr_code:
        try:
            qr_image_data = base64.b64decode(qr_code)
            qr_buffer = BytesIO(qr_image_data)
            qr_image = Image(qr_buffer, width=40*mm, height=40*mm)
            footer_data = [
                [qr_image, 
                 Table([
                     [Paragraph("Scan to verify receipt", ParagraphStyle('QRText', parent=value_style, fontSize=8, textColor=text_color, alignment=1))],
                     [Paragraph("Thank you for your payment!", ParagraphStyle('ThankYou', parent=value_style, fontSize=10, fontName='Helvetica-Bold', textColor=primary_color, alignment=1))]
                 ], colWidths=[140*mm]),
                 ""]
            ]
        except Exception as e:
            logger.error(f"Error adding QR code to meal receipt: {e}")
            footer_data = [
                [Paragraph("Thank you for your payment!", ParagraphStyle('ThankYou', parent=value_style, fontSize=11, fontName='Helvetica-Bold', textColor=primary_color, alignment=1))]
            ]
    else:
        footer_data = [
            [Paragraph("Thank you for your payment!", ParagraphStyle('ThankYou', parent=value_style, fontSize=11, fontName='Helvetica-Bold', textColor=primary_color, alignment=1))]
        ]
    
    if len(footer_data[0]) > 1:
        footer_table = Table(footer_data, colWidths=[50*mm, 100*mm, 30*mm])
        footer_table.setStyle(TableStyle([
            ('ALIGN', (1, 0), (1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
    else:
        footer_table = Table(footer_data, colWidths=[180*mm])
        footer_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
    
    elements.append(footer_table)
    elements.append(Spacer(1, 10))
    
    # Signatures
    signatures = Table([
        [Paragraph("Authorized Signature", ParagraphStyle('SigLabel', parent=value_style, fontSize=8, alignment=1)),
         Paragraph("Parent/Guardian Signature", ParagraphStyle('SigLabel', parent=value_style, fontSize=8, alignment=1))],
        [Paragraph("_" * 30, ParagraphStyle('SigLine', parent=value_style, fontSize=8, alignment=1)),
         Paragraph("_" * 30, ParagraphStyle('SigLine', parent=value_style, fontSize=8, alignment=1))],
        [Paragraph("School Administrator", ParagraphStyle('SigTitle', parent=value_style, fontSize=8, alignment=1)),
         Paragraph("", ParagraphStyle('SigTitle', parent=value_style, fontSize=8, alignment=1))]
    ], colWidths=[90*mm, 90*mm])
    
    signatures.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(signatures)
    
    try:
        # Build PDF document
        doc.build(elements)
        pdf = buffer.getvalue()
        return pdf
    except Exception as e:
        logger.error(f"Error generating meal payment PDF: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        buffer.close()


def send_transport_fee_receipt(fee):
    """
    Automatically send transport fee payment receipt to parent via email and/or WhatsApp
    """
    try:
        # Ensure fee is a model instance, not a dict
        if isinstance(fee, dict):
            logger.error(f"send_transport_fee_receipt received a dict instead of TransportFee instance: {fee}")
            return False, "Invalid fee object type"
        
        # Ensure fee has required attributes
        if not hasattr(fee, 'student') or not hasattr(fee, 'reference_number'):
            logger.error(f"TransportFee object missing required attributes: {type(fee)}")
            return False, "Invalid fee object - missing required attributes"
        
        student = fee.student
        
        # Generate QR code for receipt
        try:
            qr_data = {
                'type': 'transport_fee',
                'receipt_no': fee.reference_number,
                'student_id': student.id,
                'amount': str(fee.amount),
                'date': fee.date.isoformat()
            }
            qr_code = generate_receipt_qr(qr_data)
        except AttributeError as e:
            logger.error(f"Error accessing fee attributes for QR code generation. Fee type: {type(fee)}, Fee: {fee}")
            raise ValueError(f"Error accessing fee attributes: {str(e)}. Fee object type: {type(fee)}")
        
        # Generate PDF receipt using the new beautiful transport receipt template
        try:
            pdf_content = generate_transport_payment_receipt(fee, qr_code)
        except (AttributeError, ValueError) as e:
            logger.error(f"Error in generate_transport_payment_receipt. Fee type: {type(fee)}, Fee ID: {getattr(fee, 'id', 'N/A')}")
            raise
        
        if not pdf_content:
            logger.error(f"Failed to generate PDF receipt for transport fee {fee.id}")
            return False, "Failed to generate receipt PDF"
        
        results = {
            'email_sent': False,
            'whatsapp_sent': False,
            'email_error': None,
            'whatsapp_error': None
        }
        
        # Send via email if parent email exists
        if student.parent_email:
            try:
                from django.template.loader import render_to_string
                
                # Validate fee before using in subject
                if not hasattr(fee, 'reference_number'):
                    raise ValueError(f"fee object missing 'reference_number' attribute. Type: {type(fee)}")
                
                subject = f'Transport Fee Payment Receipt - {fee.reference_number}'
                
                # Render HTML email template
                html_message = render_to_string(
                    'schools/email/payment_receipt.html',
                    {
                        'payment': fee,
                        'student': student,
                        'fee_type': 'Transport Fee',
                        'fee_detail': fee.route.name
                    }
                )
                
                # Plain text fallback
                text_message = f"""
Dear {student.parent_name},

Thank you for your payment. Please find attached the official receipt for the transport fee payment made for {student.get_full_name()}.

Payment Details:
- Receipt Number: {fee.reference_number}
- Amount: KES {fee.amount:,.2f}
- Payment Method: {fee.get_payment_method_display()}
- Date: {fee.date.strftime('%B %d, %Y')}
- Student: {student.get_full_name()}
- Admission Number: {student.admission_number}
- Term: Term {fee.term}
- Route: {fee.route.name}

Please keep this receipt for your records.

Best regards,
Bishop Dr Mando International School
"""
                
                email = EmailMessage(
                    subject=subject,
                    body=text_message,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@bishopdrmandointernationalschool.org'),
                    to=[student.parent_email],
                )
                
                # Set HTML content
                email.content_subtype = "html"
                email.body = html_message
                
                # Attach PDF receipt
                email.attach(
                    f'transport_receipt_{fee.reference_number}.pdf',
                    pdf_content,
                    'application/pdf'
                )
                
                email.send()
                results['email_sent'] = True
                logger.info(f"Transport fee receipt sent via email to {student.parent_email} for payment {fee.id}")
                
            except Exception as e:
                error_msg = f"Failed to send email: {str(e)}"
                results['email_error'] = error_msg
                logger.error(f"Email sending failed for transport fee {fee.id}: {error_msg}")
        
        # Send via WhatsApp if parent phone exists
        if student.parent_phone:
            try:
                from schools.utils.whatsapp import send_whatsapp_message
                
                message = f"""Transport Fee Payment Receipt - Bishop Dr Mando International School

Receipt No: {fee.reference_number}
Student: {student.get_full_name()}
Admission No: {student.admission_number}
Route: {fee.route.name}
Amount: KES {fee.amount:,.2f}
Payment Method: {fee.get_payment_method_display()}
Date: {fee.date.strftime('%B %d, %Y')}
Term: Term {fee.term}

Your official receipt has been sent to your email. Please check your inbox.

Thank you for your payment!"""
                
                success, response = send_whatsapp_message(student.parent_phone, message)
                
                if success:
                    results['whatsapp_sent'] = True
                    logger.info(f"Transport fee receipt notification sent via WhatsApp to {student.parent_phone} for payment {fee.id}")
                else:
                    results['whatsapp_error'] = response if isinstance(response, str) else str(response)
                    logger.error(f"WhatsApp sending failed for transport fee {fee.id}: {response}")
                    
            except Exception as e:
                error_msg = f"Failed to send WhatsApp: {str(e)}"
                results['whatsapp_error'] = error_msg
                logger.error(f"WhatsApp sending failed for transport fee {fee.id}: {error_msg}")
        
        # Return success if at least one method succeeded
        if results['email_sent'] or results['whatsapp_sent']:
            return True, results
        else:
            error_summary = []
            if results['email_error']:
                error_summary.append(f"Email: {results['email_error']}")
            if results['whatsapp_error']:
                error_summary.append(f"WhatsApp: {results['whatsapp_error']}")
            if not student.parent_email and not student.parent_phone:
                error_summary.append("No parent contact information available")
            
            return False, "; ".join(error_summary) if error_summary else "Failed to send receipt"
            
    except Exception as e:
        error_msg = f"Error sending transport fee receipt: {str(e)}"
        fee_id = getattr(fee, 'id', 'unknown') if not isinstance(fee, dict) else 'dict_object'
        logger.error(f"Error in send_transport_fee_receipt for fee {fee_id}: {error_msg}")
        return False, error_msg


def send_food_fee_receipt(fee):
    """
    Automatically send food fee payment receipt to parent via email and/or WhatsApp
    """
    try:
        # Ensure fee is a model instance, not a dict
        if isinstance(fee, dict):
            logger.error(f"send_food_fee_receipt received a dict instead of FoodFee instance: {fee}")
            return False, "Invalid fee object type"
        
        # Ensure fee has required attributes
        if not hasattr(fee, 'student') or not hasattr(fee, 'reference_number'):
            logger.error(f"FoodFee object missing required attributes: {type(fee)}")
            return False, "Invalid fee object - missing required attributes"
        
        student = fee.student
        
        # Generate QR code for receipt
        try:
            qr_data = {
                'type': 'food_fee',
                'receipt_no': fee.reference_number,
                'student_id': student.id,
                'amount': str(fee.amount),
                'date': fee.date.isoformat()
            }
            qr_code = generate_receipt_qr(qr_data)
        except AttributeError as e:
            logger.error(f"Error accessing fee attributes for QR code generation. Fee type: {type(fee)}, Fee: {fee}")
            raise ValueError(f"Error accessing fee attributes: {str(e)}. Fee object type: {type(fee)}")
        
        # Generate PDF receipt
        try:
            pdf_content = generate_food_fee_receipt(fee, qr_code)
        except (AttributeError, ValueError) as e:
            logger.error(f"Error in generate_food_fee_receipt. Fee type: {type(fee)}, Fee ID: {getattr(fee, 'id', 'N/A')}")
            raise
        
        if not pdf_content:
            logger.error(f"Failed to generate PDF receipt for food fee {fee.id}")
            return False, "Failed to generate receipt PDF"
        
        results = {
            'email_sent': False,
            'whatsapp_sent': False,
            'email_error': None,
            'whatsapp_error': None
        }
        
        # Send via email if parent email exists
        if student.parent_email:
            try:
                from django.template.loader import render_to_string
                
                # Validate fee before using in subject
                if not hasattr(fee, 'reference_number'):
                    raise ValueError(f"fee object missing 'reference_number' attribute. Type: {type(fee)}")
                
                subject = f'Food Fee Payment Receipt - {fee.reference_number}'
                
                # Render HTML email template
                html_message = render_to_string(
                    'schools/email/payment_receipt.html',
                    {
                        'payment': fee,
                        'student': student,
                        'fee_type': 'Food Fee',
                        'fee_detail': fee.food_plan.name
                    }
                )
                
                # Plain text fallback
                text_message = f"""
Dear {student.parent_name},

Thank you for your payment. Please find attached the official receipt for the food fee payment made for {student.get_full_name()}.

Payment Details:
- Receipt Number: {fee.reference_number}
- Amount: KES {fee.amount:,.2f}
- Payment Method: {fee.get_payment_method_display()}
- Date: {fee.date.strftime('%B %d, %Y')}
- Student: {student.get_full_name()}
- Admission Number: {student.admission_number}
- Term: Term {fee.term}
- Food Plan: {fee.food_plan.name} ({fee.food_plan.get_meal_type_display()})

Please keep this receipt for your records.

Best regards,
Bishop Dr Mando International School
"""
                
                email = EmailMessage(
                    subject=subject,
                    body=text_message,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@bishopdrmandointernationalschool.org'),
                    to=[student.parent_email],
                )
                
                # Set HTML content
                email.content_subtype = "html"
                email.body = html_message
                
                # Attach PDF receipt
                email.attach(
                    f'food_receipt_{fee.reference_number}.pdf',
                    pdf_content,
                    'application/pdf'
                )
                
                email.send()
                results['email_sent'] = True
                logger.info(f"Food fee receipt sent via email to {student.parent_email} for payment {fee.id}")
                
            except Exception as e:
                error_msg = f"Failed to send email: {str(e)}"
                results['email_error'] = error_msg
                logger.error(f"Email sending failed for food fee {fee.id}: {error_msg}")
        
        # Send via WhatsApp if parent phone exists
        if student.parent_phone:
            try:
                from schools.utils.whatsapp import send_whatsapp_message
                
                message = f"""Food Fee Payment Receipt - Bishop Dr Mando International School

Receipt No: {fee.reference_number}
Student: {student.get_full_name()}
Admission No: {student.admission_number}
Food Plan: {fee.food_plan.name} ({fee.food_plan.get_meal_type_display()})
Amount: KES {fee.amount:,.2f}
Payment Method: {fee.get_payment_method_display()}
Date: {fee.date.strftime('%B %d, %Y')}
Term: Term {fee.term}

Your official receipt has been sent to your email. Please check your inbox.

Thank you for your payment!"""
                
                success, response = send_whatsapp_message(student.parent_phone, message)
                
                if success:
                    results['whatsapp_sent'] = True
                    logger.info(f"Food fee receipt notification sent via WhatsApp to {student.parent_phone} for payment {fee.id}")
                else:
                    results['whatsapp_error'] = response if isinstance(response, str) else str(response)
                    logger.error(f"WhatsApp sending failed for food fee {fee.id}: {response}")
                    
            except Exception as e:
                error_msg = f"Failed to send WhatsApp: {str(e)}"
                results['whatsapp_error'] = error_msg
                logger.error(f"WhatsApp sending failed for food fee {fee.id}: {error_msg}")
        
        # Return success if at least one method succeeded
        if results['email_sent'] or results['whatsapp_sent']:
            return True, results
        else:
            error_summary = []
            if results['email_error']:
                error_summary.append(f"Email: {results['email_error']}")
            if results['whatsapp_error']:
                error_summary.append(f"WhatsApp: {results['whatsapp_error']}")
            if not student.parent_email and not student.parent_phone:
                error_summary.append("No parent contact information available")
            
            return False, "; ".join(error_summary) if error_summary else "Failed to send receipt"
            
    except Exception as e:
        error_msg = f"Error sending food fee receipt: {str(e)}"
        fee_id = getattr(fee, 'id', 'unknown') if not isinstance(fee, dict) else 'dict_object'
        logger.error(f"Error in send_food_fee_receipt for fee {fee_id}: {error_msg}")
        return False, error_msg

def send_meal_payment_receipt(payment):
    """
    Automatically send meal payment receipt to parent via email and/or WhatsApp
    Uses parent contact details from student record
    """
    try:
        # Ensure payment is a model instance
        if isinstance(payment, dict):
            logger.error(f"send_meal_payment_receipt received a dict instead of StudentMealPayment instance: {payment}")
            return False, "Invalid payment object type"
        
        # Ensure payment has required attributes
        if not hasattr(payment, 'student') or not hasattr(payment, 'reference_number'):
            logger.error(f"StudentMealPayment object missing required attributes: {type(payment)}")
            return False, "Invalid payment object - missing required attributes"
        
        student = payment.student
        
        # Generate QR code for receipt
        try:
            qr_data = {
                'type': 'meal_payment',
                'receipt_no': payment.reference_number,
                'student_id': student.id,
                'amount': str(payment.amount),
                'date': payment.payment_date.isoformat()
            }
            qr_code = generate_receipt_qr(qr_data)
        except AttributeError as e:
            logger.error(f"Error accessing payment attributes for QR code generation. Payment type: {type(payment)}, Payment: {payment}")
            raise ValueError(f"Error accessing payment attributes: {str(e)}. Payment object type: {type(payment)}")
        
        # Generate PDF receipt using the new beautiful meal payment receipt template
        try:
            pdf_content = generate_meal_payment_receipt(payment, qr_code)
        except (AttributeError, ValueError) as e:
            logger.error(f"Error in generate_meal_payment_receipt. Payment type: {type(payment)}, Payment ID: {getattr(payment, 'id', 'N/A')}")
            raise
        
        if not pdf_content:
            logger.error(f"Failed to generate PDF receipt for meal payment {payment.id}")
            return False, "Failed to generate receipt PDF"
        
        results = {
            'email_sent': False,
            'whatsapp_sent': False,
            'email_error': None,
            'whatsapp_error': None
        }
        
        # Get all payments in the group if this is a grouped payment
        all_payments = []
        if payment.payment_group:
            from schools.models import StudentMealPayment
            all_payments = StudentMealPayment.objects.filter(
                payment_group=payment.payment_group
            ).select_related('student').order_by('meal_type')
        else:
            all_payments = [payment]
        
        # Calculate total amount for grouped payments
        total_amount = sum(p.amount for p in all_payments)
        meal_types = [p.get_meal_type_display() for p in all_payments]
        meal_types_str = ', '.join(meal_types) if len(meal_types) > 1 else meal_types[0]
        
        # Send via email if parent email exists
        if student.parent_email:
            try:
                from django.template.loader import render_to_string
                
                # Validate payment before using in subject
                if not hasattr(payment, 'reference_number'):
                    raise ValueError(f"payment object missing 'reference_number' attribute. Type: {type(payment)}")
                
                subject = f'Meal Payment Receipt - {payment.reference_number}'
                
                # Render HTML email template
                html_message = render_to_string(
                    'schools/email/payment_receipt.html',
                    {
                        'payment': payment,
                        'student': student,
                        'fee_type': 'Meal Payment',
                        'fee_detail': meal_types_str,
                        'all_payments': all_payments,
                        'total_amount': total_amount
                    }
                )
                
                # Plain text fallback
                text_message = f"""
Dear {student.parent_name},

Thank you for your payment. Please find attached the official receipt for the meal payment made for {student.get_full_name()}.

Payment Details:
- Receipt Number: {payment.reference_number}
- Amount: KES {total_amount:,.2f}
- Meal Type(s): {meal_types_str}
- Payment Method: {payment.get_payment_method_display()}
- Date: {payment.payment_date.strftime('%B %d, %Y')}
- Number of Days: {payment.number_of_days}
- Student: {student.get_full_name()}
- Admission Number: {student.admission_number}

Please keep this receipt for your records.

Best regards,
Bishop Dr Mando International School
"""
                
                email = EmailMessage(
                    subject=subject,
                    body=text_message,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@bishopdrmandointernationalschool.org'),
                    to=[student.parent_email],
                )
                
                # Set HTML content
                email.content_subtype = "html"
                email.body = html_message
                
                # Attach PDF receipt
                email.attach(
                    f'meal_receipt_{payment.reference_number}.pdf',
                    pdf_content,
                    'application/pdf'
                )
                
                email.send()
                results['email_sent'] = True
                logger.info(f"Meal payment receipt sent via email to {student.parent_email} for payment {payment.id}")
                
            except Exception as e:
                error_msg = f"Failed to send email: {str(e)}"
                results['email_error'] = error_msg
                logger.error(f"Email sending failed for meal payment {payment.id}: {error_msg}")
        
        # Send via WhatsApp if parent phone exists
        if student.parent_phone:
            try:
                from schools.utils.whatsapp import send_whatsapp_message
                
                message = f"""Meal Payment Receipt - Bishop Dr Mando International School

Receipt No: {payment.reference_number}
Student: {student.get_full_name()}
Admission No: {student.admission_number}
Meal Type(s): {meal_types_str}
Amount: KES {total_amount:,.2f}
Payment Method: {payment.get_payment_method_display()}
Date: {payment.payment_date.strftime('%B %d, %Y')}
Number of Days: {payment.number_of_days}

Your official receipt has been sent to your email. Please check your inbox.

Thank you for your payment!"""
                
                success, response = send_whatsapp_message(student.parent_phone, message)
                if success:
                    results['whatsapp_sent'] = True
                    logger.info(f"Meal payment receipt notification sent via WhatsApp to {student.parent_phone} for payment {payment.id}")
                else:
                    results['whatsapp_error'] = response if isinstance(response, str) else str(response)
                    logger.error(f"WhatsApp sending failed for meal payment {payment.id}: {response}")
                    
            except Exception as e:
                error_msg = f"Failed to send WhatsApp: {str(e)}"
                results['whatsapp_error'] = error_msg
                logger.error(f"WhatsApp sending failed for meal payment {payment.id}: {error_msg}")
        
        # Return success if at least one method succeeded
        if results['email_sent'] or results['whatsapp_sent']:
            return True, results
        else:
            error_summary = []
            if results['email_error']:
                error_summary.append(f"Email: {results['email_error']}")
            if results['whatsapp_error']:
                error_summary.append(f"WhatsApp: {results['whatsapp_error']}")
            if not student.parent_email and not student.parent_phone:
                error_summary.append("No parent contact information available")
            
            return False, "; ".join(error_summary) if error_summary else "Failed to send receipt"
            
    except Exception as e:
        error_msg = f"Error sending meal payment receipt: {str(e)}"
        payment_id = getattr(payment, 'id', 'unknown') if not isinstance(payment, dict) else 'dict_object'
        logger.error(f"Error in send_meal_payment_receipt for payment {payment_id}: {error_msg}")
        return False, error_msg