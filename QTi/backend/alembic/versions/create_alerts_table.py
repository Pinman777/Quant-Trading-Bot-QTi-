"""create alerts table

Revision ID: create_alerts_table
Revises: 
Create Date: 2024-02-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'create_alerts_table'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create alerts table
    op.create_table(
        'alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('exchange', sa.String(), nullable=False),
        sa.Column('symbol', sa.String(), nullable=False),
        sa.Column('message', sa.String(), nullable=False),
        sa.Column('severity', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('read', sa.Boolean(), server_default='false', nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_alerts_type'), 'alerts', ['type'], unique=False)
    op.create_index(op.f('ix_alerts_exchange'), 'alerts', ['exchange'], unique=False)
    op.create_index(op.f('ix_alerts_symbol'), 'alerts', ['symbol'], unique=False)

    # Create alert_settings table
    op.create_table(
        'alert_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('position_limit_threshold', sa.Integer(), server_default='10', nullable=False),
        sa.Column('enabled_exchanges', postgresql.JSONB(), server_default='[]', nullable=False),
        sa.Column('enabled_symbols', postgresql.JSONB(), server_default='[]', nullable=False),
        sa.Column('notification_channels', postgresql.JSONB(), server_default='{"email": false, "telegram": false, "web": true}', nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('alerts')
    op.drop_table('alert_settings') 