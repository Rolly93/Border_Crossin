from fastapi import APIRouter, Depends, status

from deps.auth import CurrentUser, get_current_user, get_user_id, require_admin
from deps.service import UnitSvc
from schema.unit_schema import AssignIn, AssignmentOut, UnitIn, UnitOut

router = APIRouter(
    prefix="/unit",
    tags=["unit"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=list[UnitOut], status_code=status.HTTP_200_OK)
async def list_units(service: UnitSvc):

    return service.list_units()


@router.post(
    "/create",
    response_model=UnitOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def create_unit(
    data: UnitIn,
    service: UnitSvc,
    current_user: CurrentUser,
):
    unit = service.create(data)
    return service.get_out(unit_id=unit.id)


@router.put(
    "/update/{unit_id}",
    response_model=UnitOut,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_admin)],
)
async def update_unit(
    unit_id: int,
    data: UnitIn,
    service: UnitSvc,
    current_user: CurrentUser,
) -> UnitOut:
    service.update(unit_id, data)
    return service.get_out(unit_id)


@router.post(
    "/{unit_id}/assign",
    response_model=AssignmentOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def assign_driver(
    unit_id: int,
    data: AssignIn,
    service: UnitSvc,
    current_user: CurrentUser,
):
    assignment = service.assign(
        unit_id, data.driverId, assigned_by=get_user_id(current_user)
    )
    return service.history_item(assignment.id)


@router.post(
    "/{unit_id}/release",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_admin)],
)
async def release_driver(
    unit_id: int,
    service: UnitSvc,
    current_user: CurrentUser,
):
    service.release(unit_id)
    return {"detail": "Unidad liberada"}


@router.get(
    "/{unit_id}/history",
    response_model=list[AssignmentOut],
    status_code=status.HTTP_200_OK,
)
async def unit_history(
    unit_id: int,
    service: UnitSvc,
    current_user: CurrentUser,
):
    return service.history(unit_id)
