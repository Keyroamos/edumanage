# M-Pesa Configuration
MPESA_ENVIRONMENT = 'sandbox'  # Change to 'production' in production
MPESA_CONSUMER_KEY = 'your_consumer_key'
MPESA_CONSUMER_SECRET = 'your_consumer_secret'
MPESA_SHORTCODE = 'your_shortcode'
MPESA_PASSKEY = 'your_passkey'
MPESA_CALLBACK_URL = 'https://your-domain.com/mpesa/callback/'

# Update CSP settings
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = (
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
)

CSP_STYLE_SRC = (
    "'self'",
    "'unsafe-inline'",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
)

CSP_FONT_SRC = (
    "'self'",
    "https://cdn.jsdelivr.net",
    "data:",
)

CSP_IMG_SRC = (
    "'self'",
    "data:",
    "https:",
)

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'csp.middleware.CSPMiddleware',
    # ... other middleware ...
] 