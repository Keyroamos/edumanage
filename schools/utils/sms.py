import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def initialize_termii():
    """Initialize Termii configuration with error handling"""
    try:
        api_key = getattr(settings, 'TERMII_API_KEY', None)
        sender_id = getattr(settings, 'TERMII_SENDER_ID', 'Edumanage')
        
        if not api_key:
            error_msg = "Missing Termii API key. Please check TERMII_API_KEY in settings."
            logger.error(error_msg)
            return None, None, error_msg
        
        logger.info("Termii configuration loaded successfully")
        return api_key, sender_id, None
    except Exception as e:
        error_msg = f"Failed to initialize Termii: {str(e)}"
        logger.error(error_msg)
        return None, None, error_msg

def send_bulk_sms(phone_numbers, message):
    """
    Send SMS to multiple phone numbers using Termii
    
    Args:
        phone_numbers: List of phone numbers
        message: SMS message text
    
    Returns:
        Tuple of (success: bool, response: dict or error message)
    """
    try:
        from config.models import SystemSettings
        sys_settings = SystemSettings.load()
        if not sys_settings.sms_active:
            return False, "SMS service is currently disabled in global settings."

        api_key, sender_id, init_error = initialize_termii()
        if not api_key:
            return False, init_error or "Termii service not properly initialized"

        # Remove any duplicates and invalid numbers
        phone_numbers = list(set(filter(None, phone_numbers)))
        
        if not phone_numbers:
            return False, "No valid phone numbers provided"
            
        formatted_numbers = []
        for num in phone_numbers:
            try:
                formatted = format_phone_number(num)
                formatted_numbers.append(formatted)
            except Exception as e:
                logger.warning(f"Failed to format phone number {num}: {str(e)}")
                continue
        
        if not formatted_numbers:
            return False, "No valid phone numbers after formatting"
        
        logger.info(f"Attempting to send SMS via Termii to {len(formatted_numbers)} recipients")
        
        # Termii API endpoint
        url = "https://api.ng.termii.com/api/sms/send"
        
        # Send to each recipient (Termii's single send endpoint)
        results = []
        success_count = 0
        
        for number in formatted_numbers:
            try:
                # Prepare payload
                payload = {
                    "to": number,
                    "from": sender_id,
                    "sms": message,
                    "type": "plain",
                    "channel": "dnd",  # Use 'dnd' for transactional, 'generic' for promotional
                    "api_key": api_key
                }
                
                headers = {
                    'Content-Type': 'application/json'
                }
                
                # Make the request
                response = requests.post(url, headers=headers, json=payload, timeout=30)
                
                logger.info(f"Termii response for {number}: Status {response.status_code}, Body: {response.text}")
                
                if response.status_code in [200, 201]:
                    try:
                        result = response.json()
                        if result.get('code') == 'ok' or result.get('message') == 'Successfully Sent':
                            logger.info(f"SMS sent to {number}, Message ID: {result.get('message_id')}")
                            results.append({
                                'number': number,
                                'status': 'Success',
                                'message_id': result.get('message_id'),
                                'balance': result.get('balance'),
                                'code': result.get('code')
                            })
                            success_count += 1
                        else:
                            error_msg = result.get('message', 'Unknown error')
                            logger.error(f"Failed to send SMS to {number}: {error_msg}")
                            results.append({
                                'number': number,
                                'status': 'Failed',
                                'error': error_msg
                            })
                    except ValueError:
                        # Response is not JSON
                        logger.info(f"SMS sent to {number} (non-JSON response)")
                        results.append({
                            'number': number,
                            'status': 'Success',
                            'raw_response': response.text
                        })
                        success_count += 1
                else:
                    error_msg = f"HTTP {response.status_code}: {response.text}"
                    logger.error(f"Failed to send SMS to {number}: {error_msg}")
                    results.append({
                        'number': number,
                        'status': 'Failed',
                        'error': error_msg
                    })
                    
            except requests.exceptions.Timeout:
                error_msg = "Request timed out"
                logger.error(f"Timeout sending to {number}")
                results.append({'number': number, 'status': 'Failed', 'error': error_msg})
            except requests.exceptions.RequestException as e:
                error_msg = f"Request failed: {str(e)}"
                logger.error(f"Request error for {number}: {error_msg}")
                results.append({'number': number, 'status': 'Failed', 'error': error_msg})
            except Exception as e:
                error_msg = f"Unexpected error: {str(e)}"
                logger.error(f"Unexpected error for {number}: {error_msg}", exc_info=True)
                results.append({'number': number, 'status': 'Failed', 'error': error_msg})
        
        if success_count > 0:
            return True, {
                'results': results,
                'success_count': success_count,
                'total_count': len(formatted_numbers)
            }
        else:
            # Extract unique error messages
            errors = set(r.get('error', 'Unknown error') for r in results if r.get('status') == 'Failed')
            error_summary = "; ".join(errors)
            return False, f"All messages failed. Errors: {error_summary}"

    except Exception as e:
        error_msg = str(e)
        logger.error(f"SMS sending failed: {error_msg}", exc_info=True)
        return False, f"Failed to send SMS: {error_msg}"

def format_phone_number(phone):
    """
    Format phone number to international format (E.164)
    """
    phone = str(phone).strip()
    
    # If it already looks like E.164, return it
    if phone.startswith('+') and len(phone) >= 10:
        return phone
        
    # Remove any non-digit characters
    digits = ''.join(filter(str.isdigit, phone))
    
    # Handle Kenyan numbers (starts with 0, 7, 1 and is 9-10 digits)
    if digits.startswith('0') and len(digits) == 10:
        return '+254' + digits[1:]
    elif (digits.startswith('7') or digits.startswith('1')) and len(digits) == 9:
        return '+254' + digits
    elif digits.startswith('254') and len(digits) == 12:
        return '+' + digits
        
    # Handle US numbers (10 digits, add +1)
    if len(digits) == 10:
        return '+1' + digits
    elif len(digits) == 11 and digits.startswith('1'):
        return '+' + digits
        
    # Fallback: just add + if missing
    if len(digits) >= 10:
        return '+' + digits
        
    return '+' + digits
