import os
import json

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from PIL import Image
import io
from dotenv import load_dotenv
from duckduckgo_search import DDGS

# Load environment variables from .env file
# Looks for .env in the parent directory or current directory
load_dotenv()

# Initialize App
app = FastAPI()

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for prototype
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Configure Gemini
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("Warning: GEMINI_API_KEY not found in environment variables or .env file.")

SYSTEM_PROMPT = """
당신은 'VisionCost 2.0'의 화장품 성분 분석 AI입니다.
사용자가 화장품 제품 사진을 보내면, 다음 JSON 형식으로 쇼핑 가이드를 제공해야 합니다.
사용자의 피부 타입과 고민을 고려하여 엄격하게 판단하세요.

Output Format (JSON):
{
    "score": 0-100 (Integer),
    "verdict": "한 문장 판정",
    "color": "Hex Code",
    "icon": "Icon Name",
    "summary": "종합 분석 (2-3문장). 성분 데이터 출처(이미지/검색/AI지식)를 명시할 것.",
    "triggers": ["주의성분1"],
    "review_keywords": ["키워드1(긍정)", "키워드2(부정)"],
    "alternatives": [{"name": "대체재1", "reason": "이유"}]
}

Rules:
1. **정확성 최우선**: 이미지/검색에서 정보를 얻을 수 없더라도, **유명 제품이라면 당신의 지식을 활용해 분석**하세요. (절대 쉽게 포기하지 마세요!)
2. '화해'나 공식 홈페이지의 정보가 검색되었다면 가중치를 높게 두세요.
3. 'review_keywords'는 검색된 리뷰 데이터에서 가장 많이 언급된 특징 5가지를 추출하세요.
4. 0.1초만에 판단하는 것처럼 직관적이고 위트 있는 한국어로 작성하세요.
"""

def search_product_info(product_name):
    """Search for product reviews AND ingredients using DuckDuckGo"""
    print(f"Searching for info: {product_name}")
    try:
        # 1. Search for Reviews
        review_results = DDGS().text(f"{product_name} 화장품 후기 장단점", max_results=4)
        review_snippets = "\n".join([r['body'] for r in review_results])
        
        # 2. Search for Ingredients specifically (Targeting Hwahae/Glowpick data bubbles)
        # Adding '화해' (Hwahae) to the query as it's the standard in Korea
        ing_results = DDGS().text(f"{product_name} 전성분 화해", max_results=5)
        ing_snippets = "\n".join([r['body'] for r in ing_results])
        
        return f"--- REVIEW DATA ---\n{review_snippets}\n\n--- INGREDIENT DATA ---\n{ing_snippets}"
    except Exception as e:
        print(f"Search failed: {e}")
        return "추가 정보를 찾을 수 없습니다."

@app.post("/analyze")
async def analyze_product(
    image: UploadFile = File(...),
    user_profile: str = Form(...)
):
    print(f"Analyzing image for user: {user_profile}")
    
    if not api_key:
        return {
            "score": 0,
            "verdict": "API 키 설정 필요",
            "summary": "서버에 GEMINI_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.",
            "color": "#FF3B30",
            "icon": "error",
            "triggers": [],
            "alternatives": []
        }

    try:
        # Read Image
        contents = await image.read()
        pil_image = Image.open(io.BytesIO(contents))
        
        
        # 1. Identify Product first (Lightweight call)
        # However, to save time, we will do a one-shot chain if possible.
        # But for 'Search', we need the name first.
        
        # Strategy: Ask Gemini to identify Name AND Analyze in one go, 
        # but if we want *Real External Data*, we need the name first.
        # Let's try to do it in one complex prompt to Gemini to extract name first? 
        # No, we can't search inside Gemini without tools.
        # So we must do: Image -> Name -> Search -> Final Logic.
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Step 1: Identify Product Name
        name_prompt = "Identify the product brand and name from this image. Return ONLY the name."
        name_response = model.generate_content([name_prompt, pil_image])
        product_name = name_response.text.strip()
        print(f"Identified Product: {product_name}")
        
        # Step 2: Search Reviews & Ingredients
        search_data = search_product_info(product_name)
        
        # Step 3: Final Analysis
        final_prompt = f"""
        User Profile: {user_profile}
        Product Name: {product_name}
        
        Web Search Data (Reviews & Ingredients):
        {search_data}
        
        Based on the User Profile, Image, AND the Search Data above:
        1. FIRST, try to extract the ACCURATE ingredient list from the 'Search Data' or 'Image'.
        2. [CRITICAL] If the Search Data is incomplete, BUT you recognize this product name (e.g., famous brands like Dr.G, Innisfree, etc.), **USE YOUR INTERNAL KNOWLEDGE** to recall the ingredients. Do NOT return "Analysis Failed" for famous products.
        3. Analyze the ingredients against the User Profile (Skin Type & Avoid List).
        4. Generate the JSON output. 
        """
        
        response = model.generate_content([SYSTEM_PROMPT, final_prompt, pil_image])
        result_text = response.text
        
        # Clean JSON
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0]
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0]
            
        return json.loads(result_text)

    except Exception as e:
        print(f"Error: {e}")
        return {
            "score": 0,
            "verdict": "분석 실패",
            "summary": "죄송합니다. AI가 제품을 분석하는 도중 오류가 발생했습니다.",
            "color": "#FF3B30",
            "icon": "error",
            "triggers": [],
            "review_keywords": [],
            "alternatives": []
        }

