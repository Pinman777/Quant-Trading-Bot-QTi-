import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.core.documentation import Documentation
from app.core.config import settings
import json
import os
import yaml

@pytest.fixture
def app():
    app = FastAPI()
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

@pytest.fixture
def documentation():
    return Documentation()

def test_documentation_lifecycle(client, documentation):
    # Test complete documentation lifecycle
    # Generate documentation
    docs = documentation.generate()
    assert docs is not None
    
    # Validate documentation
    assert documentation.validate(docs)
    
    # Update documentation
    updated_docs = documentation.update(docs, {"new_section": "content"})
    assert updated_docs is not None
    assert "new_section" in updated_docs
    
    # Export documentation
    exported_docs = documentation.export(updated_docs)
    assert exported_docs is not None

def test_api_documentation(client, documentation):
    # Test API documentation
    # Generate OpenAPI schema
    schema = documentation.generate_openapi()
    assert schema is not None
    assert "openapi" in schema
    assert "info" in schema
    assert "paths" in schema
    assert "components" in schema
    
    # Validate OpenAPI schema
    assert documentation.validate_openapi(schema)
    
    # Generate API documentation
    api_docs = documentation.generate_api_docs()
    assert api_docs is not None
    assert "endpoints" in api_docs
    assert "models" in api_docs
    assert "schemas" in api_docs
    
    # Validate API documentation
    assert documentation.validate_api_docs(api_docs)

def test_code_documentation(client, documentation):
    # Test code documentation
    # Generate code documentation
    code_docs = documentation.generate_code_docs()
    assert code_docs is not None
    assert "modules" in code_docs
    assert "classes" in code_docs
    assert "functions" in code_docs
    
    # Validate code documentation
    assert documentation.validate_code_docs(code_docs)
    
    # Generate module documentation
    module_docs = documentation.generate_module_docs("app.core")
    assert module_docs is not None
    assert "name" in module_docs
    assert "description" in module_docs
    assert "classes" in module_docs
    assert "functions" in module_docs
    
    # Validate module documentation
    assert documentation.validate_module_docs(module_docs)

def test_user_documentation(client, documentation):
    # Test user documentation
    # Generate user guide
    user_guide = documentation.generate_user_guide()
    assert user_guide is not None
    assert "introduction" in user_guide
    assert "getting_started" in user_guide
    assert "features" in user_guide
    assert "tutorials" in user_guide
    
    # Validate user guide
    assert documentation.validate_user_guide(user_guide)
    
    # Generate API reference
    api_ref = documentation.generate_api_reference()
    assert api_ref is not None
    assert "endpoints" in api_ref
    assert "models" in api_ref
    assert "schemas" in api_ref
    
    # Validate API reference
    assert documentation.validate_api_reference(api_ref)

def test_developer_documentation(client, documentation):
    # Test developer documentation
    # Generate developer guide
    dev_guide = documentation.generate_developer_guide()
    assert dev_guide is not None
    assert "architecture" in dev_guide
    assert "setup" in dev_guide
    assert "development" in dev_guide
    assert "testing" in dev_guide
    
    # Validate developer guide
    assert documentation.validate_developer_guide(dev_guide)
    
    # Generate contribution guide
    contrib_guide = documentation.generate_contribution_guide()
    assert contrib_guide is not None
    assert "code_style" in contrib_guide
    assert "pull_requests" in contrib_guide
    assert "issues" in contrib_guide
    
    # Validate contribution guide
    assert documentation.validate_contribution_guide(contrib_guide)

def test_documentation_export(client, documentation):
    # Test documentation export
    # Generate documentation
    docs = documentation.generate()
    
    # Export as HTML
    html_docs = documentation.export_html(docs)
    assert html_docs is not None
    assert isinstance(html_docs, str)
    assert "<html" in html_docs
    
    # Export as Markdown
    md_docs = documentation.export_markdown(docs)
    assert md_docs is not None
    assert isinstance(md_docs, str)
    assert "#" in md_docs
    
    # Export as PDF
    pdf_docs = documentation.export_pdf(docs)
    assert pdf_docs is not None
    assert isinstance(pdf_docs, bytes)
    
    # Export as JSON
    json_docs = documentation.export_json(docs)
    assert json_docs is not None
    assert isinstance(json_docs, str)
    assert json.loads(json_docs) is not None
    
    # Export as YAML
    yaml_docs = documentation.export_yaml(docs)
    assert yaml_docs is not None
    assert isinstance(yaml_docs, str)
    assert yaml.safe_load(yaml_docs) is not None

def test_documentation_validation(client, documentation):
    # Test documentation validation
    # Test invalid documentation
    invalid_docs = {"invalid": "documentation"}
    assert not documentation.validate(invalid_docs)
    
    # Test invalid OpenAPI schema
    invalid_schema = {"invalid": "schema"}
    assert not documentation.validate_openapi(invalid_schema)
    
    # Test invalid API documentation
    invalid_api_docs = {"invalid": "api_docs"}
    assert not documentation.validate_api_docs(invalid_api_docs)
    
    # Test invalid code documentation
    invalid_code_docs = {"invalid": "code_docs"}
    assert not documentation.validate_code_docs(invalid_code_docs)
    
    # Test invalid user guide
    invalid_user_guide = {"invalid": "user_guide"}
    assert not documentation.validate_user_guide(invalid_user_guide)
    
    # Test invalid developer guide
    invalid_dev_guide = {"invalid": "dev_guide"}
    assert not documentation.validate_developer_guide(invalid_dev_guide)
    
    # Test invalid contribution guide
    invalid_contrib_guide = {"invalid": "contrib_guide"}
    assert not documentation.validate_contribution_guide(invalid_contrib_guide)

def test_documentation_error_handling(client, documentation):
    # Test documentation error handling
    # Test invalid generation
    with pytest.raises(Exception):
        documentation.generate(invalid=True)
    
    # Test invalid validation
    with pytest.raises(Exception):
        documentation.validate(None)
    
    # Test invalid update
    with pytest.raises(Exception):
        documentation.update(None, {})
    
    # Test invalid export
    with pytest.raises(Exception):
        documentation.export(None)
    
    # Test invalid OpenAPI generation
    with pytest.raises(Exception):
        documentation.generate_openapi(invalid=True)
    
    # Test invalid API documentation generation
    with pytest.raises(Exception):
        documentation.generate_api_docs(invalid=True)
    
    # Test invalid code documentation generation
    with pytest.raises(Exception):
        documentation.generate_code_docs(invalid=True)

def test_documentation_security(client, documentation):
    # Test documentation security
    # Test input sanitization
    input_data = "<script>alert('test')</script>"
    sanitized_data = documentation.sanitize_input(input_data)
    assert sanitized_data == "&lt;script&gt;alert('test')&lt;/script&gt;"
    
    # Test output sanitization
    output_data = "&lt;script&gt;alert('test')&lt;/script&gt;"
    sanitized_data = documentation.sanitize_output(output_data)
    assert sanitized_data == "<script>alert('test')</script>"
    
    # Test file path sanitization
    file_path = "../../../etc/passwd"
    sanitized_path = documentation.sanitize_file_path(file_path)
    assert sanitized_path != file_path
    
    # Test URL sanitization
    url = "javascript:alert('test')"
    sanitized_url = documentation.sanitize_url(url)
    assert sanitized_url != url

def test_documentation_performance(client, documentation):
    # Test documentation performance
    # Test generation performance
    start_time = time.time()
    for _ in range(100):
        documentation.generate()
    generate_time = time.time() - start_time
    assert generate_time < 1.0  # Should be fast
    
    # Test validation performance
    docs = documentation.generate()
    start_time = time.time()
    for _ in range(100):
        documentation.validate(docs)
    validate_time = time.time() - start_time
    assert validate_time < 1.0  # Should be fast
    
    # Test export performance
    start_time = time.time()
    for _ in range(100):
        documentation.export(docs)
    export_time = time.time() - start_time
    assert export_time < 1.0  # Should be fast

def test_documentation_concurrency(client, documentation):
    # Test documentation concurrency
    import threading
    
    def generate_docs():
        for _ in range(100):
            documentation.generate()
    
    def validate_docs():
        docs = documentation.generate()
        for _ in range(100):
            documentation.validate(docs)
    
    def export_docs():
        docs = documentation.generate()
        for _ in range(100):
            documentation.export(docs)
    
    # Create threads
    threads = []
    for _ in range(10):
        threads.append(threading.Thread(target=generate_docs))
        threads.append(threading.Thread(target=validate_docs))
        threads.append(threading.Thread(target=export_docs))
    
    # Start threads
    for thread in threads:
        thread.start()
    
    # Wait for threads
    for thread in threads:
        thread.join()
    
    # Verify results
    docs = documentation.generate()
    assert documentation.validate(docs)
    assert documentation.export(docs) is not None 