#!/usr/bin/env python3
import requests
import os
import json
import unittest
import time
from dotenv import load_dotenv

# Load environment variables from frontend .env file to get the backend URL
load_dotenv('/app/frontend/.env')
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL')
API_URL = f"{BACKEND_URL}/api"

# Load environment variables from backend .env file to verify they're loaded correctly
load_dotenv('/app/backend/.env')
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME')
JWT_SECRET = os.environ.get('JWT_SECRET')

class BackendTests(unittest.TestCase):
    def test_01_env_variables(self):
        """Test that environment variables are loaded correctly"""
        print("\n=== Testing Environment Variables ===")
        self.assertIsNotNone(MONGO_URL, "MONGO_URL environment variable not loaded")
        self.assertIsNotNone(DB_NAME, "DB_NAME environment variable not loaded")
        self.assertIsNotNone(JWT_SECRET, "JWT_SECRET environment variable not loaded")
        
        print(f"✅ MONGO_URL: {MONGO_URL}")
        print(f"✅ DB_NAME: {DB_NAME}")
        print(f"✅ JWT_SECRET: {'*' * 10}...{'*' * 10}")  # Don't print the actual secret
        
    def test_02_api_health(self):
        """Test the root API endpoint to ensure FastAPI is running correctly"""
        print("\n=== Testing API Health ===")
        response = requests.get(f"{API_URL}/")
        self.assertEqual(response.status_code, 200, f"API health check failed with status code {response.status_code}")
        data = response.json()
        self.assertEqual(data.get("message"), "Hello World", "API response message is incorrect")
        print(f"✅ API Health Check: {data}")
        
    def test_03_cors_configuration(self):
        """Test CORS configuration by checking headers in OPTIONS request"""
        print("\n=== Testing CORS Configuration ===")
        headers = {
            'Origin': 'http://example.com',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options(f"{API_URL}/status", headers=headers)
        self.assertEqual(response.status_code, 200, f"CORS preflight request failed with status code {response.status_code}")
        
        # Check CORS headers
        self.assertIn('Access-Control-Allow-Origin', response.headers, "CORS Allow-Origin header missing")
        self.assertIn('Access-Control-Allow-Methods', response.headers, "CORS Allow-Methods header missing")
        self.assertIn('Access-Control-Allow-Headers', response.headers, "CORS Allow-Headers header missing")
        
        print(f"✅ CORS Headers: Allow-Origin: {response.headers.get('Access-Control-Allow-Origin')}")
        print(f"✅ CORS Headers: Allow-Methods: {response.headers.get('Access-Control-Allow-Methods')}")
        print(f"✅ CORS Headers: Allow-Headers: {response.headers.get('Access-Control-Allow-Headers')}")
        
    def test_04_create_status_check(self):
        """Test creating a status check to verify MongoDB integration"""
        print("\n=== Testing Status Check Creation ===")
        client_name = f"test_client_{int(time.time())}"  # Use timestamp to ensure uniqueness
        payload = {"client_name": client_name}
        
        response = requests.post(f"{API_URL}/status", json=payload)
        self.assertEqual(response.status_code, 200, f"Create status check failed with status code {response.status_code}")
        
        data = response.json()
        self.assertEqual(data.get("client_name"), client_name, "Status check client_name doesn't match")
        self.assertIn("id", data, "Status check response missing id field")
        self.assertIn("timestamp", data, "Status check response missing timestamp field")
        
        print(f"✅ Created Status Check: {data}")
        return data["id"]  # Return the ID for verification in the next test
        
    def test_05_get_status_checks(self):
        """Test retrieving status checks to verify MongoDB integration"""
        print("\n=== Testing Status Check Retrieval ===")
        # First create a new status check
        client_name = f"test_client_get_{int(time.time())}"
        payload = {"client_name": client_name}
        create_response = requests.post(f"{API_URL}/status", json=payload)
        self.assertEqual(create_response.status_code, 200, "Failed to create test status check")
        created_id = create_response.json().get("id")
        
        # Now retrieve all status checks
        response = requests.get(f"{API_URL}/status")
        self.assertEqual(response.status_code, 200, f"Get status checks failed with status code {response.status_code}")
        
        data = response.json()
        self.assertIsInstance(data, list, "Status checks response is not a list")
        
        # Verify our created status check is in the list
        found = False
        for status in data:
            if status.get("id") == created_id:
                found = True
                self.assertEqual(status.get("client_name"), client_name, "Retrieved status check has incorrect client_name")
                break
                
        self.assertTrue(found, f"Created status check with ID {created_id} not found in retrieved list")
        print(f"✅ Retrieved {len(data)} Status Checks")
        print(f"✅ Verified created status check with ID {created_id} was retrieved correctly")

if __name__ == "__main__":
    print(f"Testing backend at: {API_URL}")
    unittest.main(argv=['first-arg-is-ignored'], exit=False)