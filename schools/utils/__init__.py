"""
Utilities package for schools app
This package re-exports functions from the parent utils.py module
to maintain backward compatibility.
"""
import sys
import importlib.util
from pathlib import Path

# Import functions from the parent utils.py module
_parent_dir = Path(__file__).parent.parent
_utils_file = _parent_dir / 'utils.py'

if _utils_file.exists():
    # Load the parent utils.py as a module
    spec = importlib.util.spec_from_file_location("schools_utils_module", _utils_file)
    if spec and spec.loader:
        utils_module = importlib.util.module_from_spec(spec)
        sys.modules['schools_utils_module'] = utils_module
        spec.loader.exec_module(utils_module)
        
        # Re-export the functions
        generate_payment_receipt = utils_module.generate_payment_receipt
        generate_receipt_qr = utils_module.generate_receipt_qr
        send_payment_receipt = utils_module.send_payment_receipt
        generate_transport_fee_receipt = utils_module.generate_transport_fee_receipt
        generate_food_fee_receipt = utils_module.generate_food_fee_receipt
        send_transport_fee_receipt = utils_module.send_transport_fee_receipt
        send_food_fee_receipt = utils_module.send_food_fee_receipt
        send_meal_payment_receipt = utils_module.send_meal_payment_receipt
        
        __all__ = [
            'generate_payment_receipt', 
            'generate_receipt_qr', 
            'send_payment_receipt',
            'generate_transport_fee_receipt',
            'generate_food_fee_receipt',
            'send_transport_fee_receipt',
            'send_food_fee_receipt',
            'send_meal_payment_receipt'
        ]
    else:
        raise ImportError("Could not load utils.py module")
else:
    raise ImportError(f"utils.py not found at {_utils_file}")

