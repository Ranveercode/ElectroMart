from typing import TypedDict, List, Dict, Any, Optional

class ShoppingState(TypedDict):
    # Input fields
    user_message: str
    user_token: str  # Forwarded JWT token
    
    # Conversational memory (last 5 message pairs)
    chat_history: List[Dict[str, str]]
    
    # Intent recognition results
    intent: str  # "product_details" | "add_to_cart" | "remove_from_cart" | "checkout" | "unknown"
    entities: Dict[str, Any]  # e.g., {"product_name": "...", "quantity": N, "address": "...", etc.}
    
    # API execution results
    api_response: Optional[Dict[str, Any]]
    api_success: bool
    api_error: Optional[str]
    
    # Final response
    response_message: str
