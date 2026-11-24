from pydantic import BaseModel

class AssginationNotificationEvent(BaseModel):
  target_email:list[str]
  tag:str
  gafet:str
  reference_clint:str
  tracking_reference:str
