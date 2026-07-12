from state import ShoppingState

async def conversation_memory_node(state: ShoppingState) -> dict:
    """
    Maintains conversational memory by keeping only the last 5 user-assistant message pairs (10 messages total)
    and appending the new user message.
    """
    history = state.get("chat_history", [])
    user_message = state.get("user_message", "")
    
    # Clean/normalize history format. Ensure it's a list of dicts.
    clean_history = []
    for msg in history:
        if isinstance(msg, dict) and "role" in msg and "content" in msg:
            clean_history.append({"role": msg["role"], "content": msg["content"]})
            
    # Keep only the last 10 messages (5 pairs)
    if len(clean_history) > 10:
        clean_history = clean_history[-10:]
        
    # Append the new user message to history
    clean_history.append({"role": "user", "content": user_message})
    
    return {"chat_history": clean_history}
