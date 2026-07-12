from langchain_groq import ChatGroq
import config

class LLMService:
    def __init__(self):
        self.api_key = config.GROQ_API_KEY
        self.model = config.GROQ_MODEL
        self._llm = None
        
        if not self.api_key:
            print("Warning: GROQ_API_KEY is not set.")
            
    def get_llm(self) -> ChatGroq:
        if self._llm is None:
            if not self.api_key:
                raise ValueError("GROQ_API_KEY environment variable is not set. Please set it in your .env file.")
            self._llm = ChatGroq(
                groq_api_key=self.api_key,
                model_name=self.model,
                temperature=0.0
            )
        return self._llm

# Singleton instance
llm_service = LLMService()
