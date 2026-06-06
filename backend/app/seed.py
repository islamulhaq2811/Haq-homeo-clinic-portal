from app.database import SessionLocal
from app.models.staff import Staff
from app.utils.security import hash_password


def seed_default_admin():
    db = SessionLocal()
    try:
        existing = db.query(Staff).filter(Staff.username == "admin").first()
        if not existing:
            admin = Staff(
                username="admin",
                hashed_password=hash_password("admin123"),
                full_name="Admin",
                role="admin",
            )
            db.add(admin)
            db.commit()
            print("Default admin created (admin / admin123)")
        else:
            print("Admin already exists")
    finally:
        db.close()
