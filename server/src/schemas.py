# src/schemas.py
from flask_marshmallow import Marshmallow
from .models import User, Contribution

ma = Marshmallow()

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        # Exclude password for security
        exclude = ('password_hash',)

class ContributionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Contribution
        load_instance = True
        include_fk = True # Include user_id