from fastapi import APIRouter , HTTPException
from fastapi_utils.cbv import cbv
router = APIRouter()

@cbv(router)
class DashBoard():
    
    