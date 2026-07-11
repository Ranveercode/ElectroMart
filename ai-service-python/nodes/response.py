from state import ShoppingState
from services.llm import llm_service
from langchain_core.messages import SystemMessage, HumanMessage

async def response_generation_node(state: ShoppingState) -> dict:
    """
    Generates a natural language response using the API output, detected intent,
    and chat history, then appends it to the conversation history.
    """
    intent = state.get("intent", "unknown")
    entities = state.get("entities", {})
    api_response = state.get("api_response")
    api_success = state.get("api_success", False)
    api_error = state.get("api_error")
    chat_history = state.get("chat_history", [])
    
    # Format chat history for the prompt context
    history_str = ""
    for msg in chat_history[:-1]:  # exclude the last user message
        role = "User" if msg["role"] == "user" else "Assistant"
        history_str += f"[{role}]: {msg['content']}\n"
        
    system_prompt = (
        "You are ElectroMart's friendly, professional AI shopping assistant.\n"
        "Your task is to respond to the user's message using the provided API execution results or errors.\n\n"
        "Rules:\n"
        "1. Keep responses natural, helpful, and concise (usually 2-4 sentences max).\n"
        "2. Do not invent details not present in the API response.\n"
        "3. If the API call was successful, confirm the action clearly. Format currency values as ₹ (Rupees).\n"
        "4. If the API call failed (or requires more details), explain why and guide the user on what to do next.\n"
        "5. If the intent is 'unknown', answer politely that you can help them find products, manage their cart, or check out.\n"
    )
    
    # Context data for response generation
    context_info = f"Detected Intent: {intent}\n"
    context_info += f"API Success: {api_success}\n"
    if api_success and api_response:
        context_info += f"API Response Data: {api_response}\n"
    if api_error:
        context_info += f"API Error/Instruction: {api_error}\n"
        
    user_prompt = (
        f"Conversation History:\n{history_str}\n"
        f"Context Info:\n{context_info}\n"
        f"Current User Message: {chat_history[-1]['content'] if chat_history else ''}\n\n"
        "Assistant Response:"
    )
    
    llm = llm_service.get_llm()
    
    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        response = await llm.ainvoke(messages)
        response_text = response.content.strip()
        
        # Append assistant response to history
        updated_history = list(chat_history)
        updated_history.append({"role": "assistant", "content": response_text})
        
        return {
            "response_message": response_text,
            "chat_history": updated_history
        }
    except Exception as e:
        error_msg = f"Sorry, I encountered an error while processing your request: {str(e)}"
        updated_history = list(chat_history)
        updated_history.append({"role": "assistant", "content": error_msg})
        return {
            "response_message": error_msg,
            "chat_history": updated_history
        }
