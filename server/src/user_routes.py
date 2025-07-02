# src/user_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import Contribution
from .schemas import ContributionSchema

user_bp = Blueprint('user_bp', __name__)
contributions_schema = ContributionSchema(many=True)

@user_bp.route('/my-contributions', methods=['GET'])
@jwt_required()
def get_my_contributions():
    current_user_id = get_jwt_identity()
    contributions = Contribution.query.filter_by(user_id=current_user_id).order_by(Contribution.date.desc()).all()
    return jsonify(contributions_schema.dump(contributions))