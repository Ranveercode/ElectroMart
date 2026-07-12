import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.resolve()))

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from graph import compiled_graph

app = FastAPI(title="ElectroMart AI Shopping Cart Microservice", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  ## Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    message: str = Field(..., description="The user's current search/shopping query")
    history: List[Dict[str, str]] = Field(default_factory=list, description="Conversation message history")
    user_token: str = Field(default="", description="JWT token of the authenticated user")

class QueryResponse(BaseModel):
    response: str = Field(..., description="Natural language response from the assistant")
    history: List[Dict[str, str]] = Field(..., description="Updated conversation history")
    intent: str = Field(..., description="Detected intent")
    entities: Dict[str, Any] = Field(..., description="Extracted entities")
    api_success: bool = Field(..., description="Whether the backend API call succeeded")
    api_error: Optional[str] = Field(None, description="Any error details from the API execution")

@app.post("/api/shopping/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """
    Exposes a REST API endpoint that accepts user queries and processes them via LangGraph.
    """
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    try:
        # Initialize graph state
        initial_state = {
            "user_message": request.message,
            "user_token": request.user_token,
            "chat_history": request.history,
            "intent": "unknown",
            "entities": {},
            "api_response": None,
            "api_success": False,
            "api_error": None,
            "response_message": ""
        }
        
        # Invoke LangGraph workflow asynchronously
        final_state = await compiled_graph.ainvoke(initial_state)
        
        return QueryResponse(
            response=final_state.get("response_message", "Sorry, I couldn't generate a response."),
            history=final_state.get("chat_history", []),
            intent=final_state.get("intent", "unknown"),
            entities=final_state.get("entities", {}),
            api_success=final_state.get("api_success", False),
            api_error=final_state.get("api_error")
        )
    except Exception as e:
        print(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "shopping-cart-ai"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
