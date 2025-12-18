from rest_framework import pagination
from rest_framework.response import Response

class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size = 20
    page_size_query_param = (
        "page_size"  # Allows client to set page size (e.g., ?page_size=50)
    )
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response(
            {
                "links": {
                    "next": self.get_next_link(),
                    "previous": self.get_previous_link(),
                },
                "total_items": self.page.paginator.count,
                "page_number": self.page.number,
                "entry": data,  # Renaming 'results' to something specific
            }
        )