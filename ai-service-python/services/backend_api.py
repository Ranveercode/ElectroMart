import httpx
import config
from typing import List, Dict, Any, Optional

class BackendApiClient:
    def __init__(self):
        self.base_url = config.BACKEND_BASE_URL

    def _get_cookies(self, token: str) -> Dict[str, str]:
        return {"jwt": token}

    async def search_products(self, keyword: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/api/products"
        params = {"keyword": keyword}
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error searching products: {e}")
                raise Exception(f"Failed to fetch products: {str(e)}")

    async def get_cart(self, token: str) -> Dict[str, Any]:
        url = f"{self.base_url}/api/cart"
        cookies = self._get_cookies(token)
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, cookies=cookies)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error getting cart: {e}")
                raise Exception(f"Failed to fetch cart: {str(e)}")

    async def add_to_cart(self, product_id: str, quantity: int, token: str) -> Dict[str, Any]:
        url = f"{self.base_url}/api/cart"
        cookies = self._get_cookies(token)
        data = {"productId": product_id, "quantity": quantity}
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(url, json=data, cookies=cookies)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error adding to cart: {e}")
                raise Exception(f"Failed to add item to cart: {str(e)}")

    async def remove_from_cart(self, product_id: str, token: str) -> Dict[str, Any]:
        url = f"{self.base_url}/api/cart/{product_id}"
        cookies = self._get_cookies(token)
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.delete(url, cookies=cookies)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error removing from cart: {e}")
                raise Exception(f"Failed to remove item from cart: {str(e)}")

    async def clear_cart(self, token: str) -> Dict[str, Any]:
        url = f"{self.base_url}/api/cart/clear"
        cookies = self._get_cookies(token)
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.delete(url, cookies=cookies)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error clearing cart: {e}")
                raise Exception(f"Failed to clear cart: {str(e)}")

    async def create_order(self, order_data: Dict[str, Any], token: str) -> Dict[str, Any]:
        url = f"{self.base_url}/api/orders"
        cookies = self._get_cookies(token)
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(url, json=order_data, cookies=cookies)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error creating order: {e}")
                raise Exception(f"Failed to place order: {str(e)}")

# Singleton instance
backend_api_client = BackendApiClient()
