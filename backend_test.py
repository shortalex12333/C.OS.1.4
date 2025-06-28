#!/usr/bin/env python3
import requests
import json
import os
import sys
from dotenv import load_dotenv
import time
from pathlib import Path

# Load environment variables from frontend/.env to get the backend URL
frontend_env_path = Path('/app/frontend/.env')
load_dotenv(frontend_env_path)

# Load environment variables from backend/.env to verify JWT_SECRET
backend_env_path = Path('/app/backend/.env')
load_dotenv(backend_env_path)

# Get the backend URL from the frontend environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL')
if not BACKEND_URL:
    print("Error: REACT_APP_BACKEND_URL not found in frontend/.env")
    sys.exit(1)

# Ensure the backend URL ends with /api for all API calls
API_URL = f"{BACKEND_URL}/api"
print(f"Using API URL: {API_URL}")

# Verify JWT_SECRET is loaded
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    print("Error: JWT_SECRET not found in backend/.env")
    sys.exit(1)
print("JWT_SECRET is properly loaded from environment")

# Test functions
def test_root_endpoint():
    """Test the root endpoint /api/"""
    print("\n=== Testing Root Endpoint ===")
    try:
        response = requests.get(f"{API_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "message" in response.json(), "Response does not contain 'message' field"
        assert response.json()["message"] == "Hello World", f"Expected 'Hello World', got {response.json()['message']}"
        
        print("✅ Root endpoint test passed")
        return True
    except Exception as e:
        print(f"❌ Root endpoint test failed: {str(e)}")
        return False

def test_create_status_check():
    """Test creating a status check via POST /api/status"""
    print("\n=== Testing Create Status Check ===")
    try:
        payload = {"client_name": "test_client"}
        response = requests.post(f"{API_URL}/status", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "id" in response.json(), "Response does not contain 'id' field"
        assert "client_name" in response.json(), "Response does not contain 'client_name' field"
        assert "timestamp" in response.json(), "Response does not contain 'timestamp' field"
        assert response.json()["client_name"] == "test_client", f"Expected client_name 'test_client', got {response.json()['client_name']}"
        
        print("✅ Create status check test passed")
        return True, response.json()["id"]
    except Exception as e:
        print(f"❌ Create status check test failed: {str(e)}")
        return False, None

def test_get_status_checks(expected_id=None):
    """Test retrieving status checks via GET /api/status"""
    print("\n=== Testing Get Status Checks ===")
    try:
        response = requests.get(f"{API_URL}/status")
        print(f"Status Code: {response.status_code}")
        print(f"Response contains {len(response.json())} status checks")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert isinstance(response.json(), list), "Response is not a list"
        
        if expected_id:
            found = False
            for status in response.json():
                if status["id"] == expected_id:
                    found = True
                    break
            assert found, f"Could not find status check with id {expected_id} in response"
            print(f"✅ Found status check with id {expected_id}")
        
        print("✅ Get status checks test passed")
        return True
    except Exception as e:
        print(f"❌ Get status checks test failed: {str(e)}")
        return False

def test_cors_configuration():
    """Test CORS configuration"""
    print("\n=== Testing CORS Configuration ===")
    try:
        headers = {
            "Origin": "http://example.com",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Content-Type"
        }
        
        # Send OPTIONS request to check CORS headers
        response = requests.options(f"{API_URL}/", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"CORS Headers: {json.dumps(dict(response.headers), indent=2)}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "access-control-allow-origin" in response.headers, "Response does not contain 'Access-Control-Allow-Origin' header"
        assert response.headers["access-control-allow-origin"] == "*", f"Expected 'Access-Control-Allow-Origin: *', got {response.headers['access-control-allow-origin']}"
        assert "access-control-allow-methods" in response.headers, "Response does not contain 'Access-Control-Allow-Methods' header"
        assert "access-control-allow-headers" in response.headers, "Response does not contain 'Access-Control-Allow-Headers' header"
        
        print("✅ CORS configuration test passed")
        return True
    except Exception as e:
        print(f"❌ CORS configuration test failed: {str(e)}")
        return False

def test_mongodb_connection():
    """Test MongoDB connection by creating and retrieving status checks"""
    print("\n=== Testing MongoDB Connection ===")
    try:
        # Create a unique status check
        timestamp = int(time.time())
        client_name = f"mongodb_test_{timestamp}"
        payload = {"client_name": client_name}
        
        # Create status check
        create_response = requests.post(f"{API_URL}/status", json=payload)
        assert create_response.status_code == 200, f"Expected status code 200, got {create_response.status_code}"
        created_id = create_response.json()["id"]
        print(f"Created status check with id {created_id} and client_name {client_name}")
        
        # Retrieve status checks and verify the one we just created is there
        get_response = requests.get(f"{API_URL}/status")
        assert get_response.status_code == 200, f"Expected status code 200, got {get_response.status_code}"
        
        found = False
        for status in get_response.json():
            if status["id"] == created_id and status["client_name"] == client_name:
                found = True
                break
        
        assert found, f"Could not find status check with id {created_id} and client_name {client_name} in response"
        
        print("✅ MongoDB connection test passed")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection test failed: {str(e)}")
        return False

def run_all_tests():
    """Run all tests and return overall result"""
    print("\n=== Running All Backend Tests ===")
    
    # Test JWT_SECRET loading - already done during initialization
    
    # Test root endpoint
    root_result = test_root_endpoint()
    
    # Test creating a status check
    create_result, status_id = test_create_status_check()
    
    # Test retrieving status checks
    get_result = test_get_status_checks(status_id if create_result else None)
    
    # Test CORS configuration
    cors_result = test_cors_configuration()
    
    # Test MongoDB connection
    mongo_result = test_mongodb_connection()
    
    # Print overall results
    print("\n=== Test Results Summary ===")
    print(f"JWT_SECRET Loading: {'✅ PASSED' if JWT_SECRET else '❌ FAILED'}")
    print(f"Root Endpoint: {'✅ PASSED' if root_result else '❌ FAILED'}")
    print(f"Create Status Check: {'✅ PASSED' if create_result else '❌ FAILED'}")
    print(f"Get Status Checks: {'✅ PASSED' if get_result else '❌ FAILED'}")
    print(f"CORS Configuration: {'✅ PASSED' if cors_result else '❌ FAILED'}")
    print(f"MongoDB Connection: {'✅ PASSED' if mongo_result else '❌ FAILED'}")
    
    # Overall result
    all_passed = all([JWT_SECRET, root_result, create_result, get_result, cors_result, mongo_result])
    print(f"\nOverall Result: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
    
    return all_passed

if __name__ == "__main__":
    run_all_tests()