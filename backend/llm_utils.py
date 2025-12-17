import os
import requests
import json
import base64
import httpx
import logging
import random

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def _resolve_api_key(api_key):
    """
    Resolve API key: use provided key if not None, otherwise fall back to env var.
    """
    if api_key is not None:
        return api_key
    
    env_key = os.environ.get("OPENROUTER_API_KEY")
    if env_key:
        logger.info("[API_KEY] Using default API key from OPENROUTER_API_KEY environment variable")
        return env_key
    
    raise ValueError("No API key provided and OPENROUTER_API_KEY environment variable is not set")


async def evaluate_image_with_persona(image_bytes, persona, api_key):
    api_key = _resolve_api_key(api_key)
    # Encode image
    base64_image = base64.b64encode(image_bytes).decode('utf-8')

    system_prompt = f"""
    You are `{persona['name']}` with this personality: `{persona['bio']}`.
    You must think and respond as this specific person would - with their unique preferences, dealbreakers, and taste.

    ## EVALUATION CRITERIA
    Analyze these specific aspects of the Tinder profile picture:

    1. **First Impression** (0-3 seconds): What emotion does this photo trigger immediately?
    2. **Face & Expression**: Is the face clearly visible? Genuine smile vs forced? Eye contact?
    3. **Body Language**: Confident? Approachable? Awkward? Open or closed posture?
    4. **Setting/Background**: Interesting? Distracting? Does it tell a story about lifestyle?
    5. **Photo Quality**: Lighting quality, resolution, angles, selfie vs someone else took it
    6. **Outfit & Grooming**: Effort level, style match, cleanliness, appropriateness
    7. **Authenticity**: Does it feel staged/try-hard or natural/effortless?
    8. **Red Flags**: Group photos, bathroom selfies, exes cropped out, sunglasses hiding face, etc.

    ## YOUR TASK
    Based on YOUR CHARACTER's specific preferences and personality, decide: Would YOU swipe RIGHT or LEFT?

    Remember:
    - What would SPECIFICALLY attract YOUR character type?
    - What are YOUR dealbreakers based on your personality?
    - Don't give generic advice - filter everything through YOUR unique perspective.

    ## OUTPUT FORMAT
    Respond with ONLY this JSON object:
    {{
        "swipe": "left" or "right",
        "first_impression": "One sentence - your gut reaction in the first 3 seconds",
        "reason": "2-3 sentences explaining WHY you swiped this way, from your character's perspective",
        "likes": "Be SPECIFIC - not 'nice smile' but 'the genuine laugh lines around the eyes show authenticity'",
        "dislikes": "Be SPECIFIC - not 'bad lighting' but 'harsh overhead lighting creates unflattering shadows under the eyes'",
        "keep": "The ONE element that works best and should absolutely stay",
        "change": "The ONE change that would have the biggest positive impact on your decision",
        "scores": {{
            "attractiveness": 1-10,
            "authenticity": 1-10,
            "photo_quality": 1-10,
            "overall_swipeability": 1-10
        }}
    }}
    """
    logger.info(f"[EVALUATE] System Prompt:\n{system_prompt}")
    
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
    
    # Log request details (without image for readability)
    logger.info(f"[EVALUATE] === Starting Evaluation ===")
    logger.info(f"[EVALUATE] Persona: {persona['name']} (ID: {persona['id']})")
    logger.info(f"[EVALUATE] Persona Bio: {persona['bio']}")
    logger.info(f"[EVALUATE] Model: {data['model']}")
    logger.info(f"[EVALUATE] System Prompt:\n{system_prompt}")
    logger.info(f"[EVALUATE] User Message: [IMAGE - not logged]")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data, timeout=30.0)
        result = response.json()
    
    # Log response (without image data)
    logger.info(f"[EVALUATE] Response Status: {response.status_code}")
    
    content = result['choices'][0]['message']['content']
    logger.info(f"[EVALUATE] Raw LLM Response:\n{content}")
    
    # Parse the JSON response
    try:
        parsed = json.loads(content)
        swipe = parsed.get("swipe", None)
        first_impression = parsed.get("first_impression", "")
        reason = parsed.get("reason", "No reason provided")
        likes = parsed.get("likes", "")
        dislikes = parsed.get("dislikes", "")
        keep = parsed.get("keep", "")
        change = parsed.get("change", "")
        scores = parsed.get("scores", {})
        
        logger.info(f"[EVALUATE] Parsed Response:")
        logger.info(f"[EVALUATE]   Swipe: {swipe}")
        logger.info(f"[EVALUATE]   First Impression: {first_impression}")
        logger.info(f"[EVALUATE]   Reason: {reason}")
        logger.info(f"[EVALUATE]   Likes: {likes}")
        logger.info(f"[EVALUATE]   Dislikes: {dislikes}")
        logger.info(f"[EVALUATE]   Keep: {keep}")
        logger.info(f"[EVALUATE]   Change: {change}")
        logger.info(f"[EVALUATE]   Scores: {scores}")
    except json.JSONDecodeError as e:
        logger.error(f"[EVALUATE] JSONDecodeError: {e}")
        logger.error(f"[EVALUATE] Failed to parse content: {content}")
        swipe = "left"
        first_impression = ""
        reason = ""
        likes = ""
        dislikes = ""
        keep = ""
        change = ""
        scores = {}
    
    # Build content summary
    content_parts = []
    if first_impression:
        content_parts.append(f"First Impression: {first_impression}")
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
        "swipe": swipe,
        "first_impression": first_impression,
        "reason": reason,
        "likes": likes,
        "dislikes": dislikes,
        "keep": keep,
        "change": change,
        "scores": scores,
        "content": full_content,
    }

async def combine_feedback(feedbacks, api_key, goal):
    api_key = _resolve_api_key(api_key)
    logger.info(f"[COMBINE] === Starting Feedback Combination ===")
    logger.info(f"[COMBINE] Number of feedbacks: {len(feedbacks)}")
    
    # Aggregator - shuffle to prevent order bias
    random.shuffle(feedbacks)
    feedback_text = ''
    for persona in feedbacks:
        scores_str = persona.get('scores', {})
        feedback_text += f"""
        Character: {persona['name']}
        Swipe: {persona.get('swipe', 'unknown')}
        First Impression: {persona.get('first_impression', 'N/A')}
        Reason: {persona.get('reason', 'N/A')}
        Likes: {persona['likes']}
        Dislikes: {persona['dislikes']}
        Keep: {persona['keep']}
        Change: {persona['change']}
        Scores: {scores_str}
        ---
    """

    
    # Calculate consensus metrics
    right_swipes = sum(1 for f in feedbacks if f.get('swipe') == 'right')
    left_swipes = sum(1 for f in feedbacks if f.get('swipe') == 'left')
    total = len(feedbacks)
    
    goal_strategy = """
    ## STRATEGY FOR MORE RIGHT SWIPES:
    - Maximize approachability and attractiveness
    - Emphasize positive traits that multiple personas mentioned
    - Fix the TOP 2 issues that got negative reactions
    - Keep authentic elements that resonated
    - Double down on unique strengths
    """ if goal == 'right' else """
    ## STRATEGY FOR MORE LEFT SWIPES:
    - Identify what made the photo appealing and reduce it
    - Emphasize elements that got negative reactions
    - Make the photo less polished/effortful
    - Add subtle elements that turn people off
    """

    system_prompt = f"""
    You are an expert image generation specialist AND dating coach with deep knowledge of what makes Tinder photos successful.

    ## FEEDBACK SUMMARY
    - Total evaluators: {total}
    - Right swipes: {right_swipes} ({right_swipes*100//total if total > 0 else 0}%)
    - Left swipes: {left_swipes} ({left_swipes*100//total if total > 0 else 0}%)

    ## ANALYSIS FRAMEWORK
    Analyze the feedback using this structured approach:

    1. **CONSENSUS ITEMS** (High Confidence): What do MOST personas agree on?
    - These are your primary action items
    
    2. **CONFLICTING OPINIONS**: Where do personas disagree?
    - Identify the majority view
    - Consider which view aligns better with the target goal
    
    3. **OUTLIER INSIGHTS**: Any unique observations worth considering?
    - Sometimes one persona catches something others missed

    ## PRIORITY RANKING
    - **P1 (Critical)**: Issues/strengths mentioned by 3+ personas
    - **P2 (Important)**: Issues/strengths mentioned by 2 personas
    - **P3 (Nice-to-have)**: Unique suggestions worth considering

    ## GOAL: Get more {goal.upper()} SWIPES
    {goal_strategy}

    ## YOUR TASK
    Provide TWO things:

    ### 1. THINKING
    Your structured analysis including:
    - What to KEEP (working well)
    - What to CHANGE (needs improvement)  
    - What to DOUBLE DOWN on (amplify strengths)
    - What to AVOID (remove entirely)
    - Overall strategy for achieving the goal

    ### 2. PROMPT
    A detailed image generation prompt that MUST include:
    - **Subject**: Exact pose, expression, body language to achieve
    - **Camera**: Angle (eye-level, slightly above), distance (medium shot, close-up)
    - **Lighting**: Type (golden hour, soft natural, studio), direction
    - **Background**: Specific setting that enhances the story
    - **Mood/Vibe**: The emotional tone to convey
    - **Style**: Photography style (candid, portrait, lifestyle)

    Example format: "Professional lifestyle portrait, genuine laughing expression, looking slightly off-camera, golden hour natural lighting from the left, outdoor café setting with soft bokeh background, warm and approachable mood, shot at eye level, medium-close framing"

    ## OUTPUT FORMAT
    Respond with ONLY this JSON:
    {{
        "thinking": "Your detailed structured analysis",
        "prompt": "The complete, specific image generation prompt",
        "priority_changes": ["P1 change 1", "P1 change 2"],
        "consensus_keeps": ["Element to keep 1", "Element to keep 2"]
    }}
    """
    logger.info(f"[COMBINE] System Prompt:\n{system_prompt}")
    
    prompt = f"""
    Here is feedback from different people about a Tinder profile picture:
    ```
    {feedback_text}
    ```
    """
    logger.info(f"[COMBINE] User Prompt:\n{prompt}")
     
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
        ],
        "response_format": {"type": "json_object"}
    }
    
    logger.info(f"[COMBINE] Model: {data['model']}")
    logger.info(f"[COMBINE] System Prompt:\n{system_prompt}")
    logger.info(f"[COMBINE] User Prompt:\n{prompt}")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data, timeout=30.0)
        result = response.json()
    
    content = result['choices'][0]['message']['content']
    logger.info(f"[COMBINE] Response Status: {response.status_code}")
    logger.info(f"[COMBINE] Raw Response:\n{content}")
    
    # Parse the JSON response
    try:
        parsed = json.loads(content)
        thinking = parsed.get("thinking", "")
        prompt_text = parsed.get("prompt", "")
        logger.info(f"[COMBINE] Parsed Thinking:\n{thinking}")
        logger.info(f"[COMBINE] Parsed Prompt:\n{prompt_text}")
    except json.JSONDecodeError as e:
        logger.error(f"[COMBINE] JSONDecodeError: {e}")
        logger.error(f"[COMBINE] Failed to parse content: {content}")
        # Fallback: use entire content as prompt
        thinking = ""
        prompt_text = content
    
    return {"thinking": thinking, "prompt": prompt_text}

async def generate_new_images(suggestions, api_key, count=4, original_image=None):
    api_key = _resolve_api_key(api_key)

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
    
    # Build message content with identity preservation constraints
    system_prompt = f"""
    You are enhancing a Tinder profile picture. Your goal is to create an improved version that follows the advice below.

    ## CRITICAL CONSTRAINTS
    - **PRESERVE**: Same person, recognizable facial features, authentic feel, personality
    - **TRANSFORM**: Only the specific elements mentioned in the advice
    - **AVOID**: Making the person look like someone else, over-filtering, uncanny valley effects, unrealistic enhancements

    ## QUALITY REQUIREMENTS
    - Resolution: High-quality, sharp, not pixelated
    - Lighting: Natural and flattering
    - Focus: Sharp on face, appropriate depth of field
    - Realism: Must look like a real photo taken by a real camera
    - Platform-ready: Appropriate for Tinder (tasteful, genuine, approachable)

    ## ADVICE TO IMPLEMENT
    ```
    {suggestions}
    ```

    ## IMPORTANT
    Generate a photo that:
    1. Looks like it could have been taken on the same day as the original
    2. The person is clearly the SAME person, just photographed better
    3. Improvements feel natural, not artificial or AI-generated
    4. Would genuinely perform better on Tinder based on the advice given
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
    
    logger.info(f"[GENERATE] Generated {len(images)} images from {count} API calls, returning all")
    return images

