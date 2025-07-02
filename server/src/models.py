# -*- coding: utf-8 -*-
"""
Database models for the ChamaSys application.
This file defines the User and Contribution tables and their relationships.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy.orm import validates
import re
from datetime import date

# Initialize extensions
# These will be bound to the Flask app in the app factory (e.g., in app.py)
db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model):
    """
    Represents a user/member in the system.
    Users can log in, make contributions, and can be designated as admins.
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)

    # Relationship to Contribution
    # This creates a 'user' attribute on each Contribution instance.
    # 'cascade="all, delete-orphan"' means if a user is deleted, all their contributions are also deleted.
    contributions = db.relationship('Contribution', backref='user', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        """Provide a helpful representation when printing the object."""
        return f'<User {self.username}>'

    def to_dict(self):
        """Serialize the object to a dictionary."""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin
            # IMPORTANT: DO NOT include password_hash in the dictionary
        }

    def set_password(self, password):
        """Create a hashed password from a plaintext password."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Check if a plaintext password matches the stored hash."""
        return bcrypt.check_password_hash(self.password_hash, password)

    @validates('email')
    def validate_email(self, key, email):
        """Ensure the email has a valid format before saving."""
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            raise ValueError("Invalid email format provided.")
        return email

    @validates('username')
    def validate_username(self, key, username):
        """Ensure username is not empty."""
        if not username:
            raise ValueError("Username cannot be empty.")
        return username


class Contribution(db.Model):
    """
    Represents a single financial contribution made by a user.
    """
    __tablename__ = 'contributions'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False, default=date.today)
    
    # Foreign Key to link to the 'users' table
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def __repr__(self):
        """Provide a helpful representation when printing the object."""
        return f'<Contribution id={self.id} amount={self.amount} user_id={self.user_id}>'

    def to_dict(self):
        """Serialize the object to a dictionary."""
        return {
            'id': self.id,
            'amount': self.amount,
            # Convert date object to a string for JSON compatibility
            'date': self.date.isoformat(),
            'user_id': self.user_id,
            # Include the username for convenience in the frontend
            'username': self.user.username if self.user else None
        }

    @validates('amount')
    def validate_amount(self, key, amount):
        """Ensure the contribution amount is a positive number."""
        if amount <= 0:
            raise ValueError("Contribution amount must be positive.")
        return amount