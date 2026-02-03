import requests
import base64
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

def get_access_token():
    # Try to get token from cache first
    cached_token = cache.get('mpesa_access_token')
    if cached_token:
        return cached_token
    
    consumer_key = settings.MPESA_CONSUMER_KEY
    consumer_secret = settings.MPESA_CONSUMER_SECRET
    auth = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()
    
    try:
        url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        headers = {"Authorization": f"Basic {auth}"}
        # Add timeout to prevent hanging
        response = requests.get(url, headers=headers, timeout=10)
        token = response.json()['access_token']
        
        # Cache the token for 50 minutes (tokens typically expire after 1 hour)
        cache.set('mpesa_access_token', token, timeout=3000)
        return token
    except Exception as e:
        return None

def generate_password():
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    shortcode = settings.MPESA_SHORTCODE
    passkey = settings.MPESA_PASSKEY
    password_str = f"{shortcode}{passkey}{timestamp}"
    return base64.b64encode(password_str.encode()).decode()

def initiate_stk_push(phone, amount, account_ref, description):
    access_token = get_access_token()
    if not access_token:
        logger.error("Failed to get M-Pesa access token")
        return None, "Failed to get access token. Please try again later."
        
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password = generate_password()
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "BusinessShortCode": settings.MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone,
        "PartyB": settings.MPESA_SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": account_ref,
        "TransactionDesc": description
    }
    
    try:
        url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        logger.info(f"Initiating STK push for phone: {phone}, amount: {amount}, ref: {account_ref}")
        
        # Add timeout to prevent hanging
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        response_data = response.json()
        
        # Log the complete response for debugging
        logger.info(f"M-Pesa API Response: {response_data}")
        
        if response.status_code == 200:
            if 'ResponseCode' in response_data and response_data['ResponseCode'] == '0':
                checkout_request_id = response_data.get('CheckoutRequestID')
                merchant_request_id = response_data.get('MerchantRequestID')
                logger.info(f"STK push successful. CheckoutRequestID: {checkout_request_id}")
                return checkout_request_id, None
            else:
                error_code = response_data.get('errorCode', 'Unknown')
                error_message = response_data.get('errorMessage', 'Unknown error occurred')
                logger.error(f"M-Pesa API Error: {error_code} - {error_message}")
                
                # Handle specific error codes
                if error_code == '1037':
                    return None, "Invalid amount format. Please enter a valid amount."
                elif error_code == '1025':
                    return None, "Invalid phone number format. Please use format 254XXXXXXXXX"
                elif error_code == '1019':
                    return None, "Transaction would exceed daily limit. Please try a lower amount."
                else:
                    return None, f"Payment request failed: {error_message}"
        else:
            logger.error(f"HTTP Error: {response.status_code} - {response.text}")
            return None, f"HTTP Error: {response.status_code} - Please try again later"
            
    except requests.Timeout:
        logger.error("M-Pesa API request timed out")
        return None, "Request timed out. Please try again."
    except requests.ConnectionError:
        logger.error("M-Pesa API connection error")
        return None, "Connection error. Please check your internet connection."
    except ValueError as e:
        logger.error(f"Invalid response from M-Pesa: {str(e)}")
        return None, f"Invalid response from M-Pesa: {str(e)}"
    except Exception as e:
        logger.error(f"Unexpected error in STK push: {str(e)}")
        return None, f"An unexpected error occurred: {str(e)}"