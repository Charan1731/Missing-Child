from deepface import DeepFace
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import cv2
import os
import logging

logger = logging.getLogger(__name__)

def extract_face_embedding(image_path: str, model_name: str = "ArcFace") -> dict:
    """
    Extract facial embedding from an image using DeepFace.
    
    Args:
        image_path: Path to the image file
        model_name: Face recognition model to use (default: ArcFace)
    
    Returns:
        dict with 'success', 'embedding', and optional 'error' keys
    """
    try:
        # Verify file exists
        if not os.path.exists(image_path):
            return {"success": False, "error": "Image file not found"}
        
        # Extract embedding using DeepFace
        embedding_objs = DeepFace.represent(
            img_path=image_path,
            model_name=model_name,
            enforce_detection=True,
            detector_backend="opencv"
        )
        
        if not embedding_objs or len(embedding_objs) == 0:
            return {"success": False, "error": "No face detected in image"}
        
        # Get the first face embedding (assuming single face per image)
        embedding = embedding_objs[0]["embedding"]
        
        return {
            "success": True,
            "embedding": embedding
        }
        
    except ValueError as e:
        error_msg = str(e)
        if "Face could not be detected" in error_msg:
            return {"success": False, "error": "No face detected in image"}
        return {"success": False, "error": f"Face detection error: {error_msg}"}
    except Exception as e:
        logger.error(f"Error extracting embedding: {str(e)}")
        return {"success": False, "error": f"Error processing image: {str(e)}"}

def compare_embeddings(embedding1: list, embedding2: list) -> float:
    """
    Compare two face embeddings using cosine similarity.
    
    Args:
        embedding1: First face embedding
        embedding2: Second face embedding
    
    Returns:
        Similarity score between 0 and 1
    """
    try:
        # Convert to numpy arrays
        emb1 = np.array(embedding1).reshape(1, -1)
        emb2 = np.array(embedding2).reshape(1, -1)
        
        # Calculate cosine similarity
        similarity = cosine_similarity(emb1, emb2)[0][0]
        
        # Convert to 0-1 range (cosine similarity is -1 to 1)
        normalized_similarity = (similarity + 1) / 2
        
        return float(normalized_similarity)
    except Exception as e:
        logger.error(f"Error comparing embeddings: {str(e)}")
        return 0.0

def find_matching_child(search_embedding: list, children_data: list, threshold: float = 0.75) -> dict:
    """
    Find a matching child from the database based on face embedding.
    
    Args:
        search_embedding: Face embedding to search for
        children_data: List of children with their embeddings
        threshold: Minimum similarity score for a match (default: 0.75)
    
    Returns:
        dict with 'match_found', 'child_data', and 'confidence' keys
    """
    best_match = None
    best_similarity = 0.0
    
    for child in children_data:
        if "embedding" not in child:
            continue
        
        similarity = compare_embeddings(search_embedding, child["embedding"])
        
        if similarity > best_similarity:
            best_similarity = similarity
            best_match = child
    
    if best_similarity >= threshold:
        return {
            "match_found": True,
            "child_data": best_match,
            "confidence": round(best_similarity * 100, 2)
        }
    else:
        return {
            "match_found": False,
            "confidence": 0
        }
