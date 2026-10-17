#!/usr/bin/env python
"""
Database initialization script for Docker.
Creates all tables and seeds initial data.
"""

import os
import sys

import bcrypt

# Add the parent directory to the path so we can import from the app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import func, inspect, select
from sqlalchemy.orm import Session

from database import engine
from model.db_model import Base, Client, Employee, User


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def init_database():
    """Initialize the database by creating all tables."""
    print("Initializing database...")

    # Check if tables already exist
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    if existing_tables:
        print(f"Database already has tables: {existing_tables}")
        print("Skipping table creation.")
    else:
        print("Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully!")

    # Create session for seeding data
    db = Session(bind=engine)
    try:
        # Create default client (Expeditors) if not exists
        client = db.scalar(
            select(Client).where(func.lower(Client.name) == "expeditors")
        )
        if client is None:
            print("Creating default client 'Expeditors'...")
            client = Client(name="Expeditors", still_active=True, phonenumber="N/A")
            db.add(client)
            db.commit()
            db.refresh(client)
            print(f"Client created with ID: {client.id}")
        else:
            print(f"Client 'Expeditors' already exists (ID: {client.id})")

        # Create admin user if not exists
        from config.config import Env

        env = Env()
        admin_user = db.scalar(select(User).where(User.username == env.USER_EMAIL))
        if admin_user is None:
            print("Creating admin user...")
            # Check if admin employee exists
            admin_employee = db.scalar(
                select(Employee).where(Employee.rfc == "ADMIN000000000")
            )
            if admin_employee is None:
                admin_employee = Employee(
                    name="Admin",
                    last_name="User",
                    role="administrator",
                    rfc="ADMIN000000000",
                    still_employee=True,
                )
                db.add(admin_employee)
                db.commit()
                db.refresh(admin_employee)

            # Hash password directly without importing UserService (avoids circular import)
            hashed_password = hash_password(env.USER_PASSWORD)

            admin_user = User(
                username=env.USER_EMAIL,
                email=env.USER_EMAIL,
                hashed_password=hashed_password,
                is_admin=True,
                employee_id=admin_employee.id,
            )
            db.add(admin_user)
            db.commit()
            print(f"Admin user created: {env.USER_EMAIL}")
        else:
            print(f"Admin user already exists: {admin_user.username}")

        db.commit()

    except Exception as e:
        print(f"Warning: Could not seed initial data: {e}")
        db.rollback()
    finally:
        db.close()

    # Seed reference rules if needed
    try:
        from database import SessionLocal
        from scripts.seed_reference_rules import main as seed_reference_rules

        db = SessionLocal()
        seed_reference_rules()
        db.close()
        print("Reference rules seeded!")
    except Exception as e:
        print(f"Warning: Could not seed reference rules: {e}")


if __name__ == "__main__":
    init_database()
