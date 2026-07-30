import asyncio
from typing import AsyncGenerator

class NotificationManager:
    
    def __init__(self):
        self.subscribers : list[asyncio.Queue] =[]
        
    async def connect(self)-> AsyncGenerator[dict,None]:
        queue = asyncio.Queue()
        self.subscribers.append(queue)
        
        try:
            while True:
                notification = await queue.get()
                yield notification
        finally:
            self.subscribers.remove(queue)
            
    async def broadcast(self,data: dict):
        for queue in self.subscribers:
            await queue.put(data)
manager = NotificationManager()