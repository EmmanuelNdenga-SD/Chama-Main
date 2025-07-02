# src/admin_routes.py
from flask import Blueprint, request, jsonify
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt
from .models import db, User, Contribution
from .schemas import UserSchema, ContributionSchema

admin_bp = Blueprint('admin_bp', __name__)
user_schema = UserSchema()
users_schema = UserSchema(many=True)
contribution_schema = ContributionSchema()
contributions_schema = ContributionSchema(many=True)

# Admin required decorator
def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get("is_admin"):
                return fn(*args, **kwargs)
            else:
                return jsonify(msg="Admins only!"), 403
        return decorator
    return wrapper

# --- User Management by Admin ---
@admin_bp.route('/users', methods=['GET'])
@admin_required()
def get_all_users():
    users = User.query.all()
    return jsonify(users_schema.dump(users))

# --- Contribution Management by Admin (Full CRUD) ---
@admin_bp.route('/contributions', methods=['POST'])
@admin_required()
def add_contribution():
    data = request.get_json()
    new_contribution = contribution_schema.load(data, session=db.session)
    db.session.add(new_contribution)
    db.session.commit()
    return jsonify(contribution_schema.dump(new_contribution)), 201

@admin_bp.route('/contributions/<int:id>', methods=['PUT'])
@admin_required()
def update_contribution(id):
    contribution = Contribution.query.get_or_404(id)
    data = request.get_json()
    contribution.amount = data.get('amount', contribution.amount)
    contribution.date = data.get('date', contribution.date)
    db.session.commit()
    return jsonify(contribution_schema.dump(contribution))

@admin_bp.route('/contributions/<int:id>', methods=['DELETE'])
@admin_required()
def delete_contribution(id):
    contribution = Contribution.query.get_or_404(id)
    db.session.delete(contribution)
    db.session.commit()
    return jsonify({"message": "Contribution deleted successfully"}), 200

@admin_bp.route('/contributions', methods=['GET'])
@admin_required()
def get_all_contributions():
    contributions = Contribution.query.order_by(Contribution.date.desc()).all()
    return jsonify(contributions_schema.dump(contributions))