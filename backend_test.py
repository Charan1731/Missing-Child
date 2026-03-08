#!/usr/bin/env python3

import requests
import sys
import os
import json
from datetime import datetime
from pathlib import Path
import tempfile
from PIL import Image, ImageDraw

class MissingChildAPITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def create_test_image(self, filename="test_child.jpg"):
        """Create a simple test image with a face-like pattern"""
        # Create a simple image that might be detected as having a face
        img = Image.new('RGB', (300, 300), color='white')
        draw = ImageDraw.Draw(img)
        
        # Draw a simple face-like pattern
        # Head (circle)
        draw.ellipse([50, 50, 250, 250], fill='peachpuff', outline='black')
        # Eyes
        draw.ellipse([80, 100, 120, 140], fill='black')
        draw.ellipse([180, 100, 220, 140], fill='black')
        # Nose
        draw.ellipse([140, 150, 160, 170], fill='pink')
        # Mouth
        draw.arc([100, 180, 200, 220], 0, 180, fill='red', width=3)
        
        temp_path = Path(tempfile.gettempdir()) / filename
        img.save(temp_path, 'JPEG')
        return str(temp_path)

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'No message')}"
            self.log_test("API Root Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("API Root Endpoint", False, f"Error: {str(e)}")
            return False

    def test_register_missing_child(self):
        """Test registering a missing child"""
        try:
            # Create test image
            image_path = self.create_test_image("register_test.jpg")
            
            # Prepare form data
            form_data = {
                'name': 'Test Child',
                'age': '8',
                'gender': 'male',
                'last_seen_location': 'Test Park, Test City',
                'contact_number': '+1234567890'
            }
            
            # Prepare file
            with open(image_path, 'rb') as f:
                files = {'photo': ('test_child.jpg', f, 'image/jpeg')}
                
                response = requests.post(
                    f"{self.api_url}/missing-child/register",
                    data=form_data,
                    files=files,
                    timeout=30
                )
            
            # Clean up test image
            os.unlink(image_path)
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Success: {data.get('success')}, Child ID: {data.get('child_id')}"
                # Store child ID for later tests
                self.test_child_id = data.get('child_id')
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Register Missing Child", success, details)
            return success
            
        except Exception as e:
            self.log_test("Register Missing Child", False, f"Error: {str(e)}")
            return False

    def test_search_missing_child_with_match(self):
        """Test searching for a child that should match"""
        try:
            # Create test image (similar to registration)
            image_path = self.create_test_image("search_test.jpg")
            
            with open(image_path, 'rb') as f:
                files = {'photo': ('search_child.jpg', f, 'image/jpeg')}
                
                response = requests.post(
                    f"{self.api_url}/missing-child/search",
                    files=files,
                    timeout=30
                )
            
            # Clean up test image
            os.unlink(image_path)
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                match_found = data.get('match_found', False)
                confidence = data.get('confidence', 0)
                details += f", Match Found: {match_found}, Confidence: {confidence}%"
                
                if match_found:
                    child_data = data.get('child_data', {})
                    details += f", Child Name: {child_data.get('name', 'Unknown')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Search Missing Child (With Match)", success, details)
            return success
            
        except Exception as e:
            self.log_test("Search Missing Child (With Match)", False, f"Error: {str(e)}")
            return False

    def test_search_missing_child_no_match(self):
        """Test searching for a child that should not match"""
        try:
            # Create a different test image
            img = Image.new('RGB', (200, 200), color='blue')
            draw = ImageDraw.Draw(img)
            # Draw a different pattern
            draw.rectangle([50, 50, 150, 150], fill='yellow', outline='black')
            
            temp_path = Path(tempfile.gettempdir()) / "no_match_test.jpg"
            img.save(temp_path, 'JPEG')
            
            with open(temp_path, 'rb') as f:
                files = {'photo': ('no_match_child.jpg', f, 'image/jpeg')}
                
                response = requests.post(
                    f"{self.api_url}/missing-child/search",
                    files=files,
                    timeout=30
                )
            
            # Clean up test image
            os.unlink(temp_path)
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                match_found = data.get('match_found', False)
                confidence = data.get('confidence', 0)
                details += f", Match Found: {match_found}, Confidence: {confidence}%"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Search Missing Child (No Match)", success, details)
            return success
            
        except Exception as e:
            self.log_test("Search Missing Child (No Match)", False, f"Error: {str(e)}")
            return False

    def test_list_missing_children(self):
        """Test listing all missing children"""
        try:
            response = requests.get(f"{self.api_url}/missing-child/list", timeout=10)
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                success_flag = data.get('success', False)
                count = data.get('count', 0)
                details += f", Success: {success_flag}, Count: {count}"
                
                if count > 0:
                    children = data.get('children', [])
                    first_child = children[0] if children else {}
                    details += f", First Child: {first_child.get('name', 'Unknown')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("List Missing Children", success, details)
            return success
            
        except Exception as e:
            self.log_test("List Missing Children", False, f"Error: {str(e)}")
            return False

    def test_invalid_image_upload(self):
        """Test uploading invalid image (no face)"""
        try:
            # Create a plain image with no face-like features
            img = Image.new('RGB', (100, 100), color='red')
            temp_path = Path(tempfile.gettempdir()) / "invalid_test.jpg"
            img.save(temp_path, 'JPEG')
            
            form_data = {
                'name': 'Invalid Test',
                'age': '5',
                'gender': 'female',
                'last_seen_location': 'Test Location',
                'contact_number': '+1111111111'
            }
            
            with open(temp_path, 'rb') as f:
                files = {'photo': ('invalid.jpg', f, 'image/jpeg')}
                
                response = requests.post(
                    f"{self.api_url}/missing-child/register",
                    data=form_data,
                    files=files,
                    timeout=30
                )
            
            # Clean up test image
            os.unlink(temp_path)
            
            # Should fail with 400 status code
            success = response.status_code == 400
            details = f"Status: {response.status_code}"
            
            if response.status_code == 400:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test("Invalid Image Upload (No Face)", success, details)
            return success
            
        except Exception as e:
            self.log_test("Invalid Image Upload (No Face)", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Missing Child Detection System Backend Tests")
        print(f"📡 Testing API at: {self.api_url}")
        print("=" * 60)
        
        # Test API availability first
        if not self.test_api_root():
            print("❌ API is not accessible. Stopping tests.")
            return False
        
        # Run all tests
        self.test_register_missing_child()
        self.test_search_missing_child_with_match()
        self.test_search_missing_child_no_match()
        self.test_list_missing_children()
        self.test_invalid_image_upload()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check details above.")
            return False

def main():
    """Main test runner"""
    tester = MissingChildAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results_file = "/app/backend_test_results.json"
    with open(results_file, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": f"{(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "0%",
            "results": tester.test_results
        }, f, indent=2)
    
    print(f"📄 Detailed results saved to: {results_file}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())