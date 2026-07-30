import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from service import manager

class NotificationRouter:
    
    def __init__(self):
        self.router = APIRouter(prefix='/events' , tags=['notifications'])
        self._register_routes()
        
    def _register_routes(self):
        
        self.router.get('/stream')(self.stream_notifications)
    async def stream_notifications(self):
        return StreamingResponse(manager.connect(),
                                 media_type='text/event-stream')
notification_router_instance = NotificationRouter()
router = notification_router_instance.router