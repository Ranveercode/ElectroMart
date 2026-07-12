from langgraph.graph import StateGraph, END
from state import ShoppingState
from nodes.memory import conversation_memory_node
from nodes.intent import intent_recognition_node
from nodes.api_nodes import (
    product_details_node,
    add_to_cart_node,
    remove_from_cart_node,
    checkout_node
)
from nodes.response import response_generation_node

def route_intent(state: ShoppingState) -> str:
    """
    Router function to determine next node based on detected intent.
    """
    intent = state.get("intent", "unknown")
    if intent in ["product_details", "add_to_cart", "remove_from_cart", "checkout"]:
        return intent
    return "unknown"

# Initialize StateGraph
workflow = StateGraph(ShoppingState)

# Add Nodes
workflow.add_node("memory", conversation_memory_node)
workflow.add_node("intent", intent_recognition_node)
workflow.add_node("product_details", product_details_node)
workflow.add_node("add_to_cart", add_to_cart_node)
workflow.add_node("remove_from_cart", remove_from_cart_node)
workflow.add_node("checkout", checkout_node)
workflow.add_node("response", response_generation_node)

# Set Entry Point
workflow.set_entry_point("memory")

# Connect Memory to Intent
workflow.add_edge("memory", "intent")

# Add Conditional Edges from Intent Node
workflow.add_conditional_edges(
    "intent",
    route_intent,
    {
        "product_details": "product_details",
        "add_to_cart": "add_to_cart",
        "remove_from_cart": "remove_from_cart",
        "checkout": "checkout",
        "unknown": "response"
    }
)

# Connect API Execution Nodes to Response Node
workflow.add_edge("product_details", "response")
workflow.add_edge("add_to_cart", "response")
workflow.add_edge("remove_from_cart", "response")
workflow.add_edge("checkout", "response")

# Response Node points to END
workflow.add_edge("response", END)

# Compile the graph
compiled_graph = workflow.compile()
