from django.test import TestCase, Client
from django.urls import get_resolver
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()

class APIHealthTestCase(TestCase):
    def setUp(self):
        """Set up an admin user and client to bypass permission checks."""
        self.admin_user = User.objects.create_superuser(
            username="testadmin", 
            password="password", 
            email="admin@test.com"
        )
        self.client = Client()
        self.client.login(username="testadmin", password="password")

    def test_all_endpoints_status_code(self):
        """
        Dynamically discovers all URLs and checks if they return a 500 error.
        """
        resolver = get_resolver()
        urls = self._collect_urls(resolver.url_patterns)
        
        failed_endpoints = []

        for url in urls:
            # Skip admin, schema, and media URLs to focus on your API
            if url.startswith('/admin') or url.startswith('/media') or url.startswith('/api/schema'):
                continue

            # Handle dynamic URLs (e.g., /api/student/<pk>/)
            # We replace common path variable placeholders with a '1'
            test_url = url.replace('<int:pk>', '1').replace('<pk>', '1').replace('<int:id>', '1')
            
            try:
                response = self.client.get(test_url)
                
                # We flag it if the server crashes (500)
                if response.status_code >= 500:
                    failed_endpoints.append(f"{test_url} -> HTTP {response.status_code}")
            except Exception as e:
                failed_endpoints.append(f"{test_url} -> Exception: {str(e)}")

        # If any endpoints failed, the test fails and lists them
        if failed_endpoints:
            self.fail(f"The following endpoints returned errors:\n" + "\n".join(failed_endpoints))

    def _collect_urls(self, patterns, prefix='/'):
        """Helper to recursively find all URL strings."""
        result = []
        for pattern in patterns:
            if hasattr(pattern, 'url_patterns'):
                result.extend(self._collect_urls(pattern.url_patterns, prefix + str(pattern.pattern)))
            else:
                # Clean the regex/path into a usable string
                path = prefix + str(pattern.pattern)
                path = path.replace('^', '').replace('$', '').replace('\\', '')
                result.append(path)
        return result