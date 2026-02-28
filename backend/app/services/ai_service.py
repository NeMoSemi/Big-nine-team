import json
import logging
from groq import AsyncGroq
from app.config import settings

logger = logging.getLogger(__name__)

# Initialize the Groq client
# Ensure that GROQ_API_KEY is present in the environment or config
try:
    groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
except Exception as e:
    logger.error(f"Failed to initialize Groq client: {e}")
    groq_client = None

async def analyze_ticket_with_ai(ticket_text: str) -> dict:
    """
    Analyzes a support ticket using Llama 3.3 via Groq API.
    Returns a dictionary with:
      - sentiment (positive, neutral, negative)
      - category (string)
      - draft_response (string)
      - confidence (float)
    """
    if not groq_client:
        logger.error("Groq client not initialized, returning fallback data")
        return {
            "sentiment": "neutral",
            "category": "other",
            "draft_response": "Извините, в данный момент ИИ-помощник недоступен.",
            "confidence": 0.0
        }

    system_prompt = """
    Вы — ИИ-агент технической поддержки (ЭРИС). Ваша задача проанализировать входящее обращение клиента.
    Вам необходимо извлечь тональность (sentiment), категорию обращения (category) и сгенерировать черновик ответа (draft_response), а также указать вашу уверенность в ответе (confidence от 0.0 до 1.0).
    
    Ответьте ТОЛЬКО в формате JSON с ключами:
    - "sentiment": строка (только "positive", "neutral" или "negative")
    - "category": строка (одно из: "malfunction", "calibration", "documentation", "other")
    - "draft_response": строка (подробный, вежливый ответ клиенту на русском языке)
    - "confidence": число (например, 0.9)
    """

    try:
        response = await groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": ticket_text
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        result = json.loads(content)
        
        # Validation/Normalization
        sentiment = result.get("sentiment", "neutral").lower()
        if sentiment not in ["positive", "neutral", "negative"]:
            sentiment = "neutral"
            
        category = result.get("category", "other").lower()
        if category not in ["malfunction", "calibration", "documentation", "other"]:
            category = "other"
            
        return {
            "sentiment": sentiment,
            "category": category,
            "draft_response": result.get("draft_response", ""),
            "confidence": float(result.get("confidence", 1.0))
        }
        
    except Exception as e:
        logger.error(f"Error during AI analysis: {e}")
        return {
            "sentiment": "neutral",
            "category": "other",
            "draft_response": "Извините, произошла ошибка при генерации ответа.",
            "confidence": 0.0
        }
