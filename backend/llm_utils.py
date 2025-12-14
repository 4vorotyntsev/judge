import requests
import json
import base64
import httpx
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def evaluate_image_with_persona(image_bytes, persona, api_key):
    # Encode image
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    
    prompt = f"""You are {persona['name']}. 
Your personality: {persona['bio']}. 
Your task: Look at this person's Tinder profile picture and decide if you would swipe right (like).

You MUST respond with valid JSON in this exact format:
{{
    "swipe_right": true or false,
    "reason": "Your brief explanation staying in character on why you would swipe right or not",
    "change": "Your brief explanation staying in character on what concrete things you would change to make the photo better",
}}

Be honest and stay in character. Only respond with the JSON object, nothing else."""
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", 
    }
    
    data = {
        "model": "openai/gpt-4o-mini",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }
        ],
        "response_format": {"type": "json_object"}
    }
    
    # Log request (without full base64 image for readability)
    logger.info(f"[EVALUATE] Persona: {persona['name']}")
    logger.info(f"[EVALUATE] Prompt: {prompt}")
    logger.info(f"[EVALUATE] Model: {data['model']}")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data, timeout=30.0)
        result = response.json()
    
    # Log response without image data
    logger.info(f"[EVALUATE] Response status: {response.status_code}")
    
    content = result['choices'][0]['message']['content']
    
    # Parse the JSON response
    try:
        parsed = json.loads(content)
        swipe_right = parsed.get("swipe_right", None)
        reason = parsed.get("reason", "No reason provided")
        change = parsed.get("change", "No change provided")
    except json.JSONDecodeError:
        swipe_right = False
        reason = ""
        change = ""
    
    return {
        "personaId": persona['id'], 
        "swipe_right": swipe_right,
        "reason": reason + ' ' + change,
        "content": reason + ' ' + change,
    }

async def combine_feedback(feedbacks, api_key):
    # Aggregator
    feedback_text = "\n".join([f"- {f['personaName']}: {f['content']}" for f in feedbacks])
    
    prompt = f"""
    Here is feedback from different people about a Tinder profile picture:
    ```
    {feedback_text}
    ```
    
    Based on this feedback, provide ONLY a specific image generation prompt that would create an improved version of the photo.
    
    The prompt should be:
    - Detailed and specific about pose, lighting, background, expression, and styling
    - Actionable for an AI image generator
    - Focus on the most impactful improvements mentioned in the feedback
    
    Respond with ONLY the image generation prompt, nothing else. No explanations, no summaries, just the prompt.
    """
     
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
         "HTTP-Referer": "http://localhost:3000", 
    }
    
    data = {
        "model": "openai/gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}]
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data, timeout=30.0)
        result = response.json()
        
    return {"summary": result['choices'][0]['message']['content']}

async def generate_new_images(suggestions, api_key, count=4, original_image=None):
    # Nana Banana Implementation
    # Using google/gemini-3-pro-image-preview
    
    logger.info(f"[GENERATE] Suggestions: {suggestions}")
    logger.info(f"[GENERATE] Count: {count}")
    logger.info(f"[GENERATE] Has original image: {original_image is not None}")
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", 
    }
    
    images = []
    
    # Build message content
    prompt_text = f"Generate a photorealistic tinder profile picture based on this advice: {suggestions}"
    
    if original_image:
        # Include original image for reference
        base64_image = base64.b64encode(original_image).decode('utf-8')
        message_content = [
            {"type": "text", "text": f"Here is the original photo. Please generate an improved version based on this advice: {suggestions}"},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
        ]
    else:
        message_content = prompt_text
    
    data = {
        "model": "google/gemini-3-pro-image-preview",
        "messages": [
            {
                "role": "user",
                "content": message_content
            }
        ],
        "modalities": ["image", "text"]
    }
    
    logger.info(f"[GENERATE] Model: {data['model']}")
    
    # Generate requested number of images
    async with httpx.AsyncClient() as client:
        for i in range(count):
            try:
                logger.info(f"[GENERATE] Generating image {i+1}/{count}...")
                response = await client.post(url, headers=headers, json=data, timeout=60.0)
                result = response.json()
                # Log response without image data
                has_images = bool(result.get("choices", [{}])[0].get("message", {}).get("images"))
                logger.info(f"[GENERATE] Response {i+1}: status={response.status_code}, has_images={has_images}")
                
                if result.get("choices"):
                    message = result["choices"][0]["message"]
                    if message.get("images"):
                        for img in message["images"]:
                            images.append(img["image_url"]["url"])
                    elif "content" in message and "http" in message["content"]: 
                        # Fallback if image is in content url
                        pass
            except Exception as e:
                logger.error(f"[GENERATE] Error generating image {i+1}: {e}")
    
    logger.info(f"[GENERATE] Generated {len(images)} images, returning {min(len(images), count)}")
    return images[:count]  # Limit to requested count

