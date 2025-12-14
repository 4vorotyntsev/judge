from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from llm_utils import evaluate_image_with_persona, generate_new_images, combine_feedback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvaluationRequest(BaseModel):
    openRouterKey: str
    personaId: int

class CombineRequest(BaseModel):
    openRouterKey: str
    feedbacks: List[dict]

class GenerateRequest(BaseModel):
    openRouterKey: str
    suggestions: str

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/api/evaluate")
async def evaluate_endpoint(
    openRouterKey: str = Form(...),
    persona: str = Form(...), # JSON string of persona
    image: UploadFile = File(...),
    swipeGoal: str = Form("right")  # "right" = want to be liked, "left" = want to be disliked
):
    try:
        persona_dict = json.loads(persona)
        # Read image content to send to LLM (base64 encoding will affect this, handle in utils)
        image_bytes = await image.read()
        
        result = await evaluate_image_with_persona(image_bytes, persona_dict, openRouterKey, swipeGoal)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/combine")
async def combine_endpoint(request: CombineRequest):
    try:
        result = await combine_feedback(request.feedbacks, request.openRouterKey)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
async def generate_endpoint(
    openRouterKey: str = Form(...),
    suggestions: str = Form(...),
    count: int = Form(4),
    originalImage: UploadFile = File(None)
):
    try:
        # Read original image if provided
        original_image_bytes = None
        if originalImage:
            original_image_bytes = await originalImage.read()
        
        # returns list of image urls
        images = await generate_new_images(
            suggestions, 
            openRouterKey, 
            count=count,
            original_image=original_image_bytes
        )
        return {"images": images}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
