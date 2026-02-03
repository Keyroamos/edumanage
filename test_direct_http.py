"""
Direct HTTP implementation of Africa's Talking SMS API
Following the official API documentation
"""

import requests
import logging

logger = logging.getLogger(__name__)

def send_sms_direct_http(username, api_key, recipients, message, sender_id=None):
    """
    Send SMS using direct HTTP POST request to Africa's Talking API
    
    Args:
        username: Africa's Talking username
        api_key: Africa's Talking API key
        recipients: List of phone numbers in international format
        message: SMS message text
        sender_id: Optional sender ID
    
    Returns:
        Tuple of (success: bool, response: dict or error message)
    """
    
    # API endpoint
    url = "https://api.africastalking.com/version1/messaging"
    
    # Headers - API key goes in header
    headers = {
        "apiKey": api_key,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }
    
    # Prepare form data - username goes in form data for POST
    data = {
        "username": username,
        "to": recipients if isinstance(recipients, str) else ",".join(recipients),
        "message": message
    }
    
    # Add sender ID if provided
    if sender_id:
        data["from"] = sender_id
    
    try:
        logger.info(f"Sending SMS to {len(recipients) if isinstance(recipients, list) else 1} recipient(s)")
        logger.info(f"URL: {url}")
        logger.info(f"Username: {username}")
        logger.info(f"Recipients: {data['to']}")
        
        # Make the POST request
        response = requests.post(url, headers=headers, data=data, timeout=30)
        
        logger.info(f"Response status: {response.status_code}")
        logger.info(f"Response body: {response.text}")
        
        # Check if request was successful
        if response.status_code == 200 or response.status_code == 201:
            try:
                result = response.json()
                return True, result
            except ValueError:
                return True, {"raw_response": response.text}
        else:
            error_msg = f"HTTP {response.status_code}: {response.text}"
            logger.error(error_msg)
            return False, error_msg
            
    except requests.exceptions.Timeout:
        error_msg = "Request timed out"
        logger.error(error_msg)
        return False, error_msg
    except requests.exceptions.RequestException as e:
        error_msg = f"Request failed: {str(e)}"
        logger.error(error_msg)
        return False, error_msg
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return False, error_msg


if __name__ == "__main__":
    # Test the direct HTTP implementation
    print("=" * 70)
    print("TESTING DIRECT HTTP API CALL")
    print("=" * 70)
    
    username = "eduma"
    api_key = "atsk_f9e923cd29897da8390b31aa82ee148c70714533c5d5c6d17cd9d42c0227a282607ca72a"
    recipients = ["+254720990929"]
    message = "Hello! This is a test from Africa's Talking using direct HTTP API. 🎉"
    
    print(f"\nUsername: {username}")
    print(f"API Key: {api_key[:20]}...{api_key[-10:]}")
    print(f"Recipients: {recipients}")
    print(f"Message: {message}")
    
    print("\nSending SMS...")
    print("-" * 70)
    
    success, response = send_sms_direct_http(username, api_key, recipients, message)
    
    print("\n" + "=" * 70)
    if success:
        print("✅ SUCCESS!")
        print("=" * 70)
        print(f"\nResponse: {response}")
    else:
        print("❌ FAILED!")
        print("=" * 70)
        print(f"\nError: {response}")
    print("=" * 70)
