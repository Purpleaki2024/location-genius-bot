"""Initialize Flask blueprint for admin routes."""
from flask import Blueprint

# Create blueprint for admin routes
admin_bp = Blueprint('admin_bp', __name__, template_folder='../templates/admin')

# Import routes to register them with the blueprint
from admin import routes  # noqa: E402,F401
