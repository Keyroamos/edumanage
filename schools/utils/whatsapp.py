"""
WhatsApp Business API integration using Meta's WhatsApp Cloud API
"""
import requests
import json
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def format_phone_number(phone):
    """
    Format phone number to international format for WhatsApp
    Automatically converts numbers starting with 07 to country code format
    Example: 
    - "0712345678" -> "254712345678"
    - "712345678" -> "254712345678"
    - "254712345678" -> "254712345678" (already formatted)
    WhatsApp API requires numbers in international format without + sign
    """
    if not phone:
        return None
    
    phone = str(phone).strip()
    
    # Remove any spaces, dashes, plus signs, or other special characters
    phone = ''.join(filter(str.isdigit, phone))
    
    if not phone:
        return None
    
    # Handle Kenyan numbers - specifically handle numbers starting with 07
    if phone.startswith('07'):
        # Remove leading 0 and add country code 254
        phone = '254' + phone[1:]
    elif phone.startswith('0'):
        # Handle other numbers starting with 0 (like 01, 02, etc.)
        phone = '254' + phone[1:]
    elif phone.startswith('7') and len(phone) == 9:
        # Handle numbers starting with 7 (9 digits total = local format)
        phone = '254' + phone
    elif phone.startswith('1') and len(phone) == 9:
        # Handle numbers starting with 1 (9 digits total = local format)
        phone = '254' + phone
    elif not phone.startswith('254'):
        # If it doesn't start with 254 and doesn't match above patterns, add 254
        phone = '254' + phone
    
    return phone

def send_whatsapp_message(phone_number, message):
    """
    Send WhatsApp message using Meta's WhatsApp Business API
    
    Args:
        phone_number: Recipient phone number (will be formatted)
        message: Message text to send
        
    Returns:
        tuple: (success: bool, response: str or dict)
    """
    try:
        # Get WhatsApp API credentials from settings
        phone_number_id = getattr(settings, 'WHATSAPP_PHONE_NUMBER_ID', None)
        access_token = getattr(settings, 'WHATSAPP_ACCESS_TOKEN', None)
        api_version = getattr(settings, 'WHATSAPP_API_VERSION', 'v22.0')
        
        if not phone_number_id or not access_token:
            error_msg = "WhatsApp API credentials not configured. Please set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in settings."
            logger.error(error_msg)
            return False, error_msg
        
        # Format phone number
        formatted_number = format_phone_number(phone_number)
        
        # WhatsApp API endpoint
        url = f"https://graph.facebook.com/{api_version}/{phone_number_id}/messages"
        
        # Headers
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }
        
        # Request payload - Matching WhatsApp API format
        # Using text messages for payment receipts (works within 24-hour window)
        # Template messages are required for first-time messages outside 24-hour window
        payload = {
            "messaging_product": "whatsapp",
            "to": formatted_number,
            "type": "text",
            "text": {
                "preview_url": False,
                "body": message
            }
        }
        
        # Log attempt
        logger.info(f"Attempting to send WhatsApp message to {formatted_number}")
        logger.info(f"WhatsApp API URL: {url}")
        
        # Make API request with connection verification
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
        except requests.exceptions.ConnectionError as e:
            # Provide more detailed error information
            error_details = str(e)
            if "actively refused" in error_details.lower() or "refused" in error_details.lower():
                helpful_msg = (
                    f"Connection refused to WhatsApp API. Possible causes:\n"
                    f"1. Internet connection issue - Check your internet connection\n"
                    f"2. Firewall blocking - Check if firewall is blocking connections to graph.facebook.com\n"
                    f"3. Proxy settings - If behind a proxy, configure proxy settings\n"
                    f"4. API endpoint unreachable - The WhatsApp API might be temporarily unavailable\n"
                    f"5. DNS resolution issue - Unable to resolve graph.facebook.com\n\n"
                    f"Try:\n"
                    f"- Check internet connectivity\n"
                    f"- Verify firewall/proxy settings\n"
                    f"- Test connection: ping graph.facebook.com\n"
                    f"- Retry after a few moments"
                )
                logger.error(f"WhatsApp connection refused: {error_details}")
                return False, helpful_msg
            raise  # Re-raise if it's a different connection error
        
        # Log response
        logger.info(f"WhatsApp API Response Status: {response.status_code}")
        logger.info(f"WhatsApp API Response: {response.text}")
        
        # Check response
        if response.status_code == 200:
            response_data = response.json()
            if 'messages' in response_data:
                message_id = response_data['messages'][0].get('id', 'unknown')
                logger.info(f"WhatsApp message sent successfully. Message ID: {message_id}")
                return True, response_data
            else:
                return False, "Unexpected response format from WhatsApp API"
        else:
            error_data = response.json() if response.text else {}
            error_info = error_data.get('error', {})
            error_code = error_info.get('code')
            error_message = error_info.get('message', f"HTTP {response.status_code}: {response.text}")
            
            # Handle specific error codes
            if error_code == 131030:
                # Recipient phone number not in allowed list
                helpful_message = (
                    f"Phone number {formatted_number} is not in the allowed list. "
                    f"To add this number:\n"
                    f"1. Go to https://developers.facebook.com/apps/\n"
                    f"2. Select your WhatsApp Business App\n"
                    f"3. Go to WhatsApp > API Setup\n"
                    f"4. Click 'Manage phone number list' or 'Add phone number'\n"
                    f"5. Add the number: {formatted_number}\n"
                    f"Note: In test mode, you can only send to numbers in your allowed list."
                )
                logger.error(f"WhatsApp API error (#131030): {error_message}")
                logger.info(f"Helpful message: {helpful_message}")
                return False, helpful_message
            elif error_code == 131026:
                # Message undeliverable
                helpful_message = f"Message could not be delivered to {formatted_number}. Please verify the phone number is correct and the recipient has WhatsApp."
                logger.error(f"WhatsApp API error (#131026): {error_message}")
                return False, helpful_message
            elif error_code == 131047:
                # Rate limit exceeded
                helpful_message = f"Rate limit exceeded. Please wait a moment before sending more messages."
                logger.error(f"WhatsApp API error (#131047): {error_message}")
                return False, helpful_message
            
            logger.error(f"WhatsApp API error (Code {error_code}): {error_message}")
            return False, error_message
            
    except requests.exceptions.ConnectionError as e:
        error_msg = (
            f"Connection error: Could not reach WhatsApp API. "
            f"This could be due to:\n"
            f"1. Internet connection issues\n"
            f"2. Firewall blocking the connection\n"
            f"3. Proxy settings\n"
            f"4. WhatsApp API service temporarily unavailable\n\n"
            f"Error details: {str(e)}"
        )
        logger.error(f"WhatsApp connection error: {str(e)}")
        return False, error_msg
    except requests.exceptions.Timeout as e:
        error_msg = (
            f"Request timeout: WhatsApp API did not respond in time. "
            f"Please try again later."
        )
        logger.error(f"WhatsApp timeout error: {str(e)}")
        return False, error_msg
    except requests.exceptions.RequestException as e:
        error_msg = f"Network error sending WhatsApp message: {str(e)}"
        logger.error(f"WhatsApp network error: {str(e)}")
        return False, error_msg
    except Exception as e:
        error_msg = f"Error sending WhatsApp message: {str(e)}"
        logger.error(f"WhatsApp unexpected error: {str(e)}")
        return False, error_msg

def send_whatsapp_pdf(phone_number, pdf_content, filename="receipt.pdf", caption=None):
    """
    Send PDF document via WhatsApp using Meta's WhatsApp Business API
    
    Args:
        phone_number: Recipient phone number (will be formatted)
        pdf_content: PDF file content as bytes or BytesIO
        filename: Name of the PDF file (default: "receipt.pdf")
        caption: Optional caption text for the document
        
    Returns:
        tuple: (success: bool, response: str or dict)
    """
    try:
        import os
        import tempfile
        from io import BytesIO
        
        # Get WhatsApp API credentials from settings
        phone_number_id = getattr(settings, 'WHATSAPP_PHONE_NUMBER_ID', None)
        access_token = getattr(settings, 'WHATSAPP_ACCESS_TOKEN', None)
        api_version = getattr(settings, 'WHATSAPP_API_VERSION', 'v22.0')
        
        if not phone_number_id or not access_token:
            error_msg = "WhatsApp API credentials not configured. Please set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in settings."
            logger.error(error_msg)
            return False, error_msg
        
        # Format phone number
        formatted_number = format_phone_number(phone_number)
        if not formatted_number:
            return False, "Invalid phone number format"
        
        # Handle PDF content - convert BytesIO to bytes if needed
        if isinstance(pdf_content, BytesIO):
            pdf_bytes = pdf_content.getvalue()
        elif isinstance(pdf_content, bytes):
            pdf_bytes = pdf_content
        else:
            return False, "PDF content must be bytes or BytesIO"
        
        # WhatsApp API endpoint for media upload
        # First, upload the media to get a media ID
        upload_url = f"https://graph.facebook.com/{api_version}/{phone_number_id}/media"
        
        headers = {
            'Authorization': f'Bearer {access_token}',
        }
        
        # Upload the PDF file
        files = {
            'file': (filename, pdf_bytes, 'application/pdf'),
            'type': (None, 'document'),
            'messaging_product': (None, 'whatsapp'),
        }
        
        logger.info(f"Uploading PDF to WhatsApp API for {formatted_number}")
        
        upload_response = requests.post(upload_url, headers=headers, files=files, timeout=30)
        
        if upload_response.status_code != 200:
            error_data = upload_response.json() if upload_response.text else {}
            error_info = error_data.get('error', {})
            error_message = error_info.get('message', f"HTTP {upload_response.status_code}: {upload_response.text}")
            logger.error(f"WhatsApp media upload failed: {error_message}")
            return False, error_message
        
        media_id = upload_response.json().get('id')
        if not media_id:
            logger.error("No media ID returned from WhatsApp upload")
            return False, "Failed to upload PDF to WhatsApp"
        
        logger.info(f"PDF uploaded successfully. Media ID: {media_id}")
        
        # Now send the document message
        message_url = f"https://graph.facebook.com/{api_version}/{phone_number_id}/messages"
        
        message_headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }
        
        # Build message payload
        payload = {
            "messaging_product": "whatsapp",
            "to": formatted_number,
            "type": "document",
            "document": {
                "id": media_id,
                "filename": filename,
            }
        }
        
        # Add caption if provided
        if caption:
            payload["document"]["caption"] = caption
        
        logger.info(f"Sending document message to {formatted_number}")
        
        message_response = requests.post(message_url, headers=message_headers, json=payload, timeout=30)
        
        if message_response.status_code == 200:
            response_data = message_response.json()
            if 'messages' in response_data:
                message_id = response_data['messages'][0].get('id', 'unknown')
                logger.info(f"WhatsApp PDF sent successfully. Message ID: {message_id}")
                return True, response_data
            else:
                return False, "Unexpected response format from WhatsApp API"
        else:
            error_data = message_response.json() if message_response.text else {}
            error_info = error_data.get('error', {})
            error_message = error_info.get('message', f"HTTP {message_response.status_code}: {message_response.text}")
            logger.error(f"WhatsApp document send failed: {error_message}")
            return False, error_message
            
    except requests.exceptions.ConnectionError as e:
        error_msg = f"Connection error sending WhatsApp PDF: {str(e)}"
        logger.error(error_msg)
        return False, error_msg
    except requests.exceptions.Timeout as e:
        error_msg = f"Timeout sending WhatsApp PDF: {str(e)}"
        logger.error(error_msg)
        return False, error_msg
    except requests.exceptions.RequestException as e:
        error_msg = f"Network error sending WhatsApp PDF: {str(e)}"
        logger.error(error_msg)
        return False, error_msg
    except Exception as e:
        error_msg = f"Error sending WhatsApp PDF: {str(e)}"
        logger.error(error_msg)
        return False, error_msg

def send_bulk_whatsapp(phone_numbers, message):
    """
    Send WhatsApp messages to multiple recipients
    
    Args:
        phone_numbers: List of phone numbers
        message: Message text to send
        
    Returns:
        tuple: (success: bool, response: dict)
    """
    try:
        # Remove any duplicates and invalid numbers
        phone_numbers = list(set(filter(None, phone_numbers)))
        
        if not phone_numbers:
            return False, "No valid phone numbers provided"
        
        results = {
            'successful': [],
            'failed': [],
            'total': len(phone_numbers)
        }
        
        # Send to each recipient
        for phone_number in phone_numbers:
            success, response = send_whatsapp_message(phone_number, message)
            if success:
                results['successful'].append(phone_number)
            else:
                results['failed'].append({
                    'phone': phone_number,
                    'error': response
                })
        
        # Return True if at least one message was sent successfully
        if results['successful']:
            return True, results
        else:
            return False, results
            
    except Exception as e:
        error_msg = f"Error in bulk WhatsApp sending: {str(e)}"
        logger.error(error_msg)
        return False, error_msg

