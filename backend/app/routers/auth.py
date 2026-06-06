from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.staff import Staff
from app.utils.security import hash_password, verify_password, create_access_token
from app.config import SECRET_KEY, ALGORITHM
from jose import jwt

router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer()


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    staff: dict


class StaffCreate(BaseModel):
    username: str
    password: str
    full_name: str | None = None


def get_current_staff(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        staff_id = payload.get("sub")
        if not staff_id:
            raise HTTPException(401, "Invalid token")
        staff = db.query(Staff).filter(Staff.id == int(staff_id)).first()
        if not staff:
            raise HTTPException(401, "Staff not found")
        return staff
    except Exception:
        raise HTTPException(401, "Invalid or expired token")


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.username == data.username).first()
    if not staff or not verify_password(data.password, staff.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token({"sub": str(staff.id), "role": staff.role})
    return LoginResponse(
        token=token,
        staff={"id": staff.id, "username": staff.username, "full_name": staff.full_name, "role": staff.role},
    )


@router.get("/me")
def me(staff: Staff = Depends(get_current_staff)):
    return {"id": staff.id, "username": staff.username, "full_name": staff.full_name, "role": staff.role}


@router.post("/setup")
def setup(data: StaffCreate, db: Session = Depends(get_db)):
    existing = db.query(Staff).filter(Staff.username == data.username).first()
    if existing:
        raise HTTPException(400, "Staff already exists")
    staff = Staff(
        username=data.username,
        hashed_password=hash_password(data.password),
        full_name=data.full_name or data.username,
    )
    db.add(staff)
    db.commit()
    return {"message": "Staff created", "username": staff.username}
