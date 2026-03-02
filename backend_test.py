#!/usr/bin/env python3
import requests
import sys
from typing import List, Dict, Any, Optional
import json

class BackendTester:
    def __init__(self, base_url: str = "https://washtech-solutions.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, status: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if status:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "status": "PASS" if status else "FAIL", 
            "details": details
        }
        self.test_results.append(result)
        
        symbol = "✅" if status else "❌"
        print(f"{symbol} {name}: {details}")

    def test_api_endpoint(self, endpoint: str, method: str = "GET", data: Dict = None, expected_status: int = 200) -> tuple:
        """Test a single API endpoint"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=10)
            else:
                return False, f"Unsupported method: {method}"

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success:
                try:
                    json_data = response.json()
                    if endpoint == "products" and "products" in json_data:
                        details += f", Products: {len(json_data['products'])}, Total: {json_data.get('total', 0)}"
                    elif endpoint == "categories" and "categories" in json_data:
                        details += f", Categories: {len(json_data['categories'])}"
                    elif endpoint == "brands" and "brands" in json_data:
                        details += f", Brands: {len(json_data['brands'])}"
                    elif endpoint == "products/new" and "products" in json_data:
                        details += f", New Products: {len(json_data['products'])}"
                    elif endpoint == "filters/ranges":
                        details += f", Price range: {json_data.get('price_min', 0)}-{json_data.get('price_max', 0)}"
                    elif endpoint == "contact" and "success" in json_data:
                        details += f", Success: {json_data['success']}"
                except:
                    details += ", JSON response received"
            else:
                details += f" (expected {expected_status})"
                
            return success, details
            
        except Exception as e:
            return False, f"Error: {str(e)}"

    def test_products_filtering(self) -> None:
        """Test products endpoint with various filters"""
        print("\n🔍 Testing Products API with Filters...")
        
        # Test basic products endpoint
        success, details = self.test_api_endpoint("products")
        self.log_test("GET /api/products", success, details)
        
        # Test category filtering
        success, details = self.test_api_endpoint("products?category=cat-1-1")
        self.log_test("GET /api/products (category filter)", success, details)
        
        # Test brand filtering
        success, details = self.test_api_endpoint("products?brand=TOR")
        self.log_test("GET /api/products (brand filter)", success, details)
        
        # Test price filtering
        success, details = self.test_api_endpoint("products?price_min=1000&price_max=5000")
        self.log_test("GET /api/products (price filter)", success, details)
        
        # Test pressure filtering
        success, details = self.test_api_endpoint("products?pressure=180,200")
        self.log_test("GET /api/products (pressure filter)", success, details)
        
        # Test flow filtering
        success, details = self.test_api_endpoint("products?flow=12,15")
        self.log_test("GET /api/products (flow filter)", success, details)

    def test_products_sorting(self) -> None:
        """Test products endpoint with various sorting options"""
        print("\n📊 Testing Products Sorting...")
        
        sort_options = ["price_asc", "price_desc", "name_asc", "name_desc", "new"]
        for sort in sort_options:
            success, details = self.test_api_endpoint(f"products?sort={sort}")
            self.log_test(f"GET /api/products (sort: {sort})", success, details)

    def test_other_endpoints(self) -> None:
        """Test other API endpoints"""
        print("\n🔧 Testing Other Endpoints...")
        
        # Test categories
        success, details = self.test_api_endpoint("categories")
        self.log_test("GET /api/categories", success, details)
        
        # Test brands
        success, details = self.test_api_endpoint("brands")
        self.log_test("GET /api/brands", success, details)
        
        # Test filter ranges
        success, details = self.test_api_endpoint("filters/ranges")
        self.log_test("GET /api/filters/ranges", success, details)
        
        # Test new products
        success, details = self.test_api_endpoint("products/new")
        self.log_test("GET /api/products/new", success, details)

    def test_contact_form(self) -> None:
        """Test contact form submission"""
        print("\n📧 Testing Contact Form...")
        
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+375291234567",
            "message": "Test message from automated testing"
        }
        
        success, details = self.test_api_endpoint("contact", method="POST", data=contact_data)
        self.log_test("POST /api/contact", success, details)

    def test_configurator(self) -> None:
        """Test configurator submission endpoint"""
        print("\n⚙️ Testing Configurator...")
        
        configurator_data = {
            "config": {
                "washType": "car",
                "postCount": 2,
                "equipType": "manual",
                "chemType": "foam",
                "extras": ["softener", "osmosis"],
                "services": ["tz", "design"]
            },
            "contact": {
                "name": "Test Configurator User",
                "phone": "+375291234567",
                "email": "configurator@test.com"
            },
            "estimate": {
                "equipCost": 6475,
                "chemCost": 1300,
                "extraCost": 5000,
                "serviceCost": 2800,
                "total": 15575,
                "posts": 2
            }
        }
        
        success, details = self.test_api_endpoint("configurator", method="POST", data=configurator_data)
        self.log_test("POST /api/configurator", success, details)

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all backend tests"""
        print("🚀 Starting Backend API Tests...")
        print(f"Base URL: {self.base_url}\n")
        
        # Test basic API health
        success, details = self.test_api_endpoint("")
        self.log_test("GET /api/ (health)", success, details)
        
        self.test_products_filtering()
        self.test_products_sorting()
        self.test_other_endpoints()
        self.test_contact_form()
        self.test_configurator()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": (self.tests_passed/self.tests_run)*100,
            "results": self.test_results
        }

def main():
    tester = BackendTester()
    result = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if result["failed_tests"] == 0 else 1

if __name__ == "__main__":
    sys.exit(main())