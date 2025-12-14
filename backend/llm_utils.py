import requests
import json
import base64
import httpx
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def evaluate_image_with_persona(image_bytes, persona, api_key, swipe_goal="right"):
    # Encode image
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    
    goal_description = f"""
    IMPORTANT CONTEXT: The owner of this photo WANTS to get swiped {swipe_goal.upper()} on Tinder.
    They want to make their profile {"LESS attractive" if swipe_goal == "left" else "MORE attractive"} to most people.
    
    Your task is to:
    - Look at this person's Tinder profile picture and decide if you would swipe {swipe_goal.upper()}.
    - Provide detailed feedback on what makes this photo unappealing or off-putting.
    - Suggest what to KEEP to maintain the "unattractive" vibe.
    - Suggest what to CHANGE to make the photo even MORE likely to get left swipes.
    """

    json_instructions = """
    You MUST respond with valid JSON in this exact format:
    {{
        "swipe_right": true or false,
        "reason": "Brief explanation of why you would or wouldn't swipe",
        "likes": "What you like about this photo that might make someone swipe (things to potentially remove)",
        "dislikes": "What you dislike about this photo that helps achieve left swipes (things to keep or enhance)",
        "keep": "What aspects make this photo unappealing and should stay the same",
        "change": "What concrete things to change to make this photo even MORE likely to get left swipes"
    }}
    """

    system_prompt = f"""
    You act as `{persona['name']}` with `{persona['bio']}` personality.
    {goal_description}
    You should act and answer as a real human with the specified personality.
    {json_instructions}
    Be honest and stay in character when providing your response. Only respond with the JSON object, nothing else.
    """
    
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
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }
        ],
        "response_format": {"type": "json_object"}
    }
    
    # Log request (without full base64 image for readability)
    logger.info(f"[EVALUATE] Persona: {persona['name']}")
    logger.info(f"[EVALUATE] System prompt length: {len(system_prompt)} chars")
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
        likes = parsed.get("likes", "")
        dislikes = parsed.get("dislikes", "")
        keep = parsed.get("keep", "")
        change = parsed.get("change", "")
    except json.JSONDecodeError as e:
        logger.error(f"[EVALUATE] JSONDecodeError: {e}")
        swipe_right = False
        reason = ""
        likes = ""
        dislikes = ""
        keep = ""
        change = ""
    
    # Build content summary
    content_parts = []
    if reason:
        content_parts.append(f"Reason: {reason}")
    if likes:
        content_parts.append(f"Likes: {likes}")
    if dislikes:
        content_parts.append(f"Dislikes: {dislikes}")
    if keep:
        content_parts.append(f"Keep: {keep}")
    if change:
        content_parts.append(f"Change: {change}")
    
    full_content = '\n'.join(content_parts)
    
    return {
        "personaId": persona['id'], 
        'name': persona['name'],
        "swipe_right": swipe_right,
        "reason": reason,
        "likes": likes,
        "dislikes": dislikes,
        "keep": keep,
        "change": change,
        "content": full_content,
    }

async def combine_feedback(feedbacks, api_key):
    # Aggregator
    feedback_text = ''
    for persona in feedbacks:
        feedback_text += f"""
        Character: {persona['name']}
        Feedback: {persona['content']}
        Like: {persona['likes']}
        Dislike: {persona['dislikes']}
        Keep: {persona['keep']}
        Change: {persona['change']}
        ---
    """

    system_prompt = """
    You act as an image generation expert. 
    Based on the feedback about the photo, provide ONLY a specific image generation prompt that would enhance the photo.
    
    The prompt should be:
    - Detailed and specific about pose, lighting, background, expression, and styling
    - Actionable for an AI image generator
    - Focus on the most impactful improvements mentioned in the feedback
    
    Respond with ONLY the image generation prompt, nothing else. No explanations, no summaries, just the prompt.
    """
    
    prompt = f"""
    Here is feedback from different people about a Tinder profile picture:
    ```
    {feedback_text}
    ```
    """
     
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
         "HTTP-Referer": "http://localhost:3000", 
    }
    
    data = {
        "model": "openai/gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
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
    system_prompt = f"""
    Generate an enhanced version of a Tinder profile picture based on this advice
    ```
    {suggestions}
    ```
    """
    
    # Include original image for reference
    base64_image = base64.b64encode(original_image).decode('utf-8')

    data = {
        "model": "google/gemini-3-pro-image-preview",
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
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

