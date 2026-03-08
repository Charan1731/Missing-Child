from fastapi import FastAPI, APIRouter, File, UploadFile, Form, HTTPException, Depends, Request
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from authlib.integrations.starlette_client import OAuth
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import shutil
from face_utils import extract_face_embedding, find_matching_child
from auth_utils import hash_password, verify_password, create_access_token
from auth_middleware import get_current_user, optional_current_user
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Add session middleware for OAuth
app.add_middleware(SessionMiddleware, secret_key=os.environ.get('JWT_SECRET', 'your-secret-key'))

# Configure OAuth
oauth = OAuth()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ Models ============
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    email: str
    name: str
    profile_picture: Optional[str] = None
    oauth_provider: Optional[str] = None
    created_at: datetime

class MissingChild(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    age: int
    gender: str
    last_seen_location: str
    contact_number: str
    image_path: str
    embedding: List[float]
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SearchHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    search_image_path: Optional[str] = None
    match_found: bool
    matched_child_id: Optional[str] = None
    confidence: float
    searched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SearchResult(BaseModel):
    match_found: bool
    confidence: float
    child_data: Optional[dict] = None

class GoogleAuthRequest(BaseModel):
    credential: str

# ============ Auth Routes ============
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    """Register a new user with email and password."""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(user_data.password)
        
        user_doc = {
            "id": user_id,
            "email": user_data.email,
            "password_hash": hashed_password,
            "name": user_data.name,
            "profile_picture": None,
            "oauth_provider": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(user_doc)
        
        # Create access token
        access_token = create_access_token({"sub": user_id, "email": user_data.email})
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": user_data.email,
                "name": user_data.name
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    """Login with email and password."""
    try:
        # Find user
        user = await db.users.find_one({"email": credentials.email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create access token
        access_token = create_access_token({"sub": user["id"], "email": user["email"]})
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "profile_picture": user.get("profile_picture")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/google")
async def google_auth(auth_request: GoogleAuthRequest):
    """Authenticate with Google OAuth."""
    try:
        # Verify Google token
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={auth_request.credential}"
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google token")
            
            google_user = response.json()
        
        email = google_user.get("email")
        name = google_user.get("name")
        picture = google_user.get("picture")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")
        
        # Check if user exists
        user = await db.users.find_one({"email": email})
        
        if user:
            # Update profile picture if changed
            if picture and user.get("profile_picture") != picture:
                await db.users.update_one(
                    {"email": email},
                    {"$set": {"profile_picture": picture}}
                )
            user_id = user["id"]
        else:
            # Create new user
            user_id = str(uuid.uuid4())
            user_doc = {
                "id": user_id,
                "email": email,
                "password_hash": "",  # No password for OAuth users
                "name": name,
                "profile_picture": picture,
                "oauth_provider": "google",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
        
        # Create access token
        access_token = create_access_token({"sub": user_id, "email": email})
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": email,
                "name": name,
                "profile_picture": picture
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error with Google auth: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information."""
    try:
        user = await db.users.find_one({"id": current_user["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ Missing Child Routes (Protected) ============
@api_router.post("/missing-child/register")
async def register_missing_child(
    name: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    last_seen_location: str = Form(...),
    contact_number: str = Form(...),
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Register a missing child with photo and details. Requires authentication."""
    try:
        # Generate unique filename
        file_extension = photo.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOADS_DIR / unique_filename
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        
        # Extract face embedding
        embedding_result = extract_face_embedding(str(file_path))
        
        if not embedding_result["success"]:
            # Clean up file if face detection fails
            os.remove(file_path)
            raise HTTPException(
                status_code=400,
                detail=embedding_result.get("error", "Failed to detect face in image")
            )
        
        # Create child record
        child_data = {
            "id": str(uuid.uuid4()),
            "name": name,
            "age": age,
            "gender": gender,
            "last_seen_location": last_seen_location,
            "contact_number": contact_number,
            "image_path": str(unique_filename),
            "embedding": embedding_result["embedding"],
            "user_id": current_user["sub"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Store in MongoDB
        await db.missing_children.insert_one(child_data)
        
        logger.info(f"Registered missing child: {name} by user {current_user['email']}")
        
        return {
            "success": True,
            "message": "Child registered successfully",
            "child_id": child_data["id"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering child: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error registering child: {str(e)}")

@api_router.post("/missing-child/search", response_model=SearchResult)
async def search_missing_child(
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Search for a missing child by uploading a photo. Requires authentication."""
    try:
        # Generate temporary filename
        file_extension = photo.filename.split(".")[-1]
        temp_filename = f"search_{uuid.uuid4()}.{file_extension}"
        temp_file_path = UPLOADS_DIR / temp_filename
        
        # Save uploaded file temporarily
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        
        # Extract face embedding
        embedding_result = extract_face_embedding(str(temp_file_path))
        
        if not embedding_result["success"]:
            # Clean up temporary file
            os.remove(temp_file_path)
            raise HTTPException(
                status_code=400,
                detail=embedding_result.get("error", "Failed to detect face in image")
            )
        
        # Get all registered children
        children = await db.missing_children.find({}, {"_id": 0}).to_list(1000)
        
        match_result = {
            "match_found": False,
            "confidence": 0,
            "child_data": None
        }
        
        if children:
            # Find matching child
            match_result = find_matching_child(
                embedding_result["embedding"],
                children,
                threshold=0.75
            )
        
        # Save search history
        search_history = {
            "id": str(uuid.uuid4()),
            "user_id": current_user["sub"],
            "search_image_path": temp_filename,
            "match_found": match_result["match_found"],
            "matched_child_id": match_result.get("child_data", {}).get("id") if match_result["match_found"] else None,
            "confidence": match_result["confidence"],
            "searched_at": datetime.now(timezone.utc).isoformat()
        }
        await db.search_history.insert_one(search_history)
        
        if match_result["match_found"]:
            child_data = match_result["child_data"]
            # Remove embedding from response (too large)
            child_data_clean = {k: v for k, v in child_data.items() if k != "embedding"}
            
            return SearchResult(
                match_found=True,
                confidence=match_result["confidence"],
                child_data=child_data_clean
            )
        else:
            # Clean up temp file if no match
            os.remove(temp_file_path)
            return SearchResult(
                match_found=False,
                confidence=0,
                child_data=None
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching for child: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching for child: {str(e)}")

# ============ User Profile Routes ============
@api_router.get("/user/my-children")
async def get_my_children(current_user: dict = Depends(get_current_user)):
    """Get all missing children registered by the current user."""
    try:
        children = await db.missing_children.find(
            {"user_id": current_user["sub"]},
            {"_id": 0, "embedding": 0}
        ).to_list(1000)
        
        return {
            "success": True,
            "count": len(children),
            "children": children
        }
    except Exception as e:
        logger.error(f"Error getting user's children: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/user/search-history")
async def get_search_history(current_user: dict = Depends(get_current_user)):
    """Get search history for the current user."""
    try:
        searches = await db.search_history.find(
            {"user_id": current_user["sub"]},
            {"_id": 0}
        ).sort("searched_at", -1).to_list(100)
        
        # Enrich with child data if match was found
        for search in searches:
            if search["match_found"] and search.get("matched_child_id"):
                child = await db.missing_children.find_one(
                    {"id": search["matched_child_id"]},
                    {"_id": 0, "embedding": 0}
                )
                search["matched_child"] = child
        
        return {
            "success": True,
            "count": len(searches),
            "searches": searches
        }
    except Exception as e:
        logger.error(f"Error getting search history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/missing-child/{child_id}")
async def update_missing_child(
    child_id: str,
    name: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
    gender: Optional[str] = Form(None),
    last_seen_location: Optional[str] = Form(None),
    contact_number: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """Update missing child information. Only the user who registered can update."""
    try:
        # Check if child exists and belongs to user
        child = await db.missing_children.find_one({"id": child_id})
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        if child["user_id"] != current_user["sub"]:
            raise HTTPException(status_code=403, detail="Not authorized to update this record")
        
        # Build update dict
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if age is not None:
            update_data["age"] = age
        if gender is not None:
            update_data["gender"] = gender
        if last_seen_location is not None:
            update_data["last_seen_location"] = last_seen_location
        if contact_number is not None:
            update_data["contact_number"] = contact_number
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Update child record
        await db.missing_children.update_one(
            {"id": child_id},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "message": "Child information updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating child: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/missing-child/{child_id}")
async def delete_missing_child(
    child_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a missing child record. Only the user who registered can delete."""
    try:
        # Check if child exists and belongs to user
        child = await db.missing_children.find_one({"id": child_id})
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        if child["user_id"] != current_user["sub"]:
            raise HTTPException(status_code=403, detail="Not authorized to delete this record")
        
        # Delete image file
        image_path = UPLOADS_DIR / child["image_path"]
        if image_path.exists():
            os.remove(image_path)
        
        # Delete child record
        await db.missing_children.delete_one({"id": child_id})
        
        return {
            "success": True,
            "message": "Child record deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting child: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ Public Routes ============
@api_router.get("/")
async def root():
    return {"message": "Missing Child Detection System API"}

@api_router.get("/missing-child/list")
async def list_missing_children():
    """Get list of all registered missing children (without embeddings)."""
    try:
        children = await db.missing_children.find(
            {},
            {"_id": 0, "embedding": 0}
        ).to_list(1000)
        
        return {
            "success": True,
            "count": len(children),
            "children": children
        }
    except Exception as e:
        logger.error(f"Error listing children: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/missing-child/image/{filename}")
async def get_child_image(filename: str):
    """Serve child image by filename."""
    file_path = UPLOADS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
