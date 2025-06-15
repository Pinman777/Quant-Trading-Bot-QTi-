import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.core.migrations import MigrationService
from app.core.config import settings
import os
import time
import alembic
from alembic.config import Config
from alembic import command

@pytest.fixture
def app():
    app = FastAPI()
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

@pytest.fixture
def migration_service():
    return MigrationService()

def test_migration_lifecycle(client, app, migration_service):
    # Test complete migration lifecycle
    # Initialize migrations
    migration_service.init()
    assert os.path.exists("migrations")
    assert os.path.exists("migrations/versions")
    
    # Create migration
    migration = migration_service.create("create_users_table")
    assert os.path.exists(migration)
    
    # Edit migration
    with open(migration, "w") as f:
        f.write("""
def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('users')
        """)
    
    # Run migration
    migration_service.upgrade()
    
    # Check migration status
    status = migration_service.status()
    assert status["current"] == "create_users_table"
    
    # Downgrade migration
    migration_service.downgrade()
    
    # Check migration status
    status = migration_service.status()
    assert status["current"] is None

def test_migration_operations(client, app, migration_service):
    # Test migration operations
    # Initialize migrations
    migration_service.init()
    
    # Create migration
    migration = migration_service.create("create_users_table")
    assert os.path.exists(migration)
    
    # Edit migration
    with open(migration, "w") as f:
        f.write("""
def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('users')
        """)
    
    # Run migration
    migration_service.upgrade()
    
    # Create another migration
    migration = migration_service.create("add_user_status")
    assert os.path.exists(migration)
    
    # Edit migration
    with open(migration, "w") as f:
        f.write("""
def upgrade():
    op.add_column('users', sa.Column('status', sa.String(), nullable=True))

def downgrade():
    op.drop_column('users', 'status')
        """)
    
    # Run migration
    migration_service.upgrade()
    
    # Check migration history
    history = migration_service.history()
    assert len(history) == 2
    assert history[0]["revision"] == "create_users_table"
    assert history[1]["revision"] == "add_user_status"
    
    # Downgrade one migration
    migration_service.downgrade(1)
    
    # Check migration status
    status = migration_service.status()
    assert status["current"] == "create_users_table"
    
    # Downgrade all migrations
    migration_service.downgrade(0)
    
    # Check migration status
    status = migration_service.status()
    assert status["current"] is None

def test_migration_validation(client, app, migration_service):
    # Test migration validation
    # Initialize migrations
    migration_service.init()
    
    # Create invalid migration
    migration = migration_service.create("invalid_migration")
    assert os.path.exists(migration)
    
    # Edit migration with invalid SQL
    with open(migration, "w") as f:
        f.write("""
def upgrade():
    op.create_table('users', invalid_sql)

def downgrade():
    op.drop_table('users')
        """)
    
    # Try to run invalid migration
    with pytest.raises(Exception):
        migration_service.upgrade()
    
    # Create valid migration
    migration = migration_service.create("valid_migration")
    assert os.path.exists(migration)
    
    # Edit migration with valid SQL
    with open(migration, "w") as f:
        f.write("""
def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('users')
        """)
    
    # Run valid migration
    migration_service.upgrade()
    
    # Check migration status
    status = migration_service.status()
    assert status["current"] == "valid_migration"

def test_migration_error_handling(client, app, migration_service):
    # Test migration error handling
    # Initialize migrations
    migration_service.init()
    
    # Create migration
    migration = migration_service.create("test_migration")
    assert os.path.exists(migration)
    
    # Edit migration with error
    with open(migration, "w") as f:
        f.write("""
def upgrade():
    raise Exception("Test error")

def downgrade():
    op.drop_table('users')
        """)
    
    # Try to run migration with error
    with pytest.raises(Exception):
        migration_service.upgrade()
    
    # Check migration status
    status = migration_service.status()
    assert status["current"] is None
    
    # Create migration with missing downgrade
    migration = migration_service.create("missing_downgrade")
    assert os.path.exists(migration)
    
    # Edit migration
    with open(migration, "w") as f:
        f.write("""
def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
        """)
    
    # Try to run migration with missing downgrade
    with pytest.raises(Exception):
        migration_service.upgrade()

def test_migration_security(client, app, migration_service):
    # Test migration security
    # Initialize migrations
    migration_service.init()
    
    # Create migration with SQL injection
    migration = migration_service.create("sql_injection")
    assert os.path.exists(migration)
    
    # Edit migration
    with open(migration, "w") as f:
        f.write("""
def upgrade():
    op.execute("DROP TABLE users; --")

def downgrade():
    pass
        """)
    
    # Try to run migration with SQL injection
    with pytest.raises(Exception):
        migration_service.upgrade()
    
    # Create migration with path traversal
    migration = migration_service.create("path_traversal")
    assert os.path.exists(migration)
    
    # Edit migration
    with open(migration, "w") as f:
        f.write("""
def upgrade():
    op.execute("COPY FROM '../../../etc/passwd'")

def downgrade():
    pass
        """)
    
    # Try to run migration with path traversal
    with pytest.raises(Exception):
        migration_service.upgrade()

def test_migration_performance(client, app, migration_service):
    # Test migration performance
    # Initialize migrations
    migration_service.init()
    
    # Create multiple migrations
    for i in range(10):
        migration = migration_service.create(f"migration_{i}")
        assert os.path.exists(migration)
        
        # Edit migration
        with open(migration, "w") as f:
            f.write(f"""
def upgrade():
    op.create_table(
        'table_{i}',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('table_{i}')
            """)
    
    # Test upgrade performance
    start_time = time.time()
    migration_service.upgrade()
    end_time = time.time()
    assert end_time - start_time < 10.0  # Should be reasonably fast
    
    # Test downgrade performance
    start_time = time.time()
    migration_service.downgrade()
    end_time = time.time()
    assert end_time - start_time < 10.0  # Should be reasonably fast

def test_migration_concurrency(client, app, migration_service):
    # Test migration concurrency
    import threading
    
    # Initialize migrations
    migration_service.init()
    
    def create_and_run_migration(i):
        # Create migration
        migration = migration_service.create(f"migration_{i}")
        assert os.path.exists(migration)
        
        # Edit migration
        with open(migration, "w") as f:
            f.write(f"""
def upgrade():
    op.create_table(
        'table_{i}',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('table_{i}')
            """)
        
        # Run migration
        migration_service.upgrade()
    
    # Create threads
    threads = []
    for i in range(5):
        threads.append(threading.Thread(target=create_and_run_migration, args=(i,)))
    
    # Start threads
    for thread in threads:
        thread.start()
    
    # Wait for threads
    for thread in threads:
        thread.join()
    
    # Check migration status
    status = migration_service.status()
    assert status["current"] is not None
    
    # Downgrade all migrations
    migration_service.downgrade(0)
    
    # Check migration status
    status = migration_service.status()
    assert status["current"] is None 