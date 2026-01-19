import pytest
import httpx
import uuid
import os
from datetime import datetime, timedelta, UTC

### Config
BASE_URL = os.getenv("TEST_API_URL", "http://localhost:7888")
ADMIN_EMAIL = os.getenv("ADMIN_USER", "admin@example.com")
ADMIN_PASS = os.getenv("ADMIN_PASS", "Testpass123")

### Fixtures 
@pytest.fixture
def client():
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        yield client

@pytest.fixture
def unique_id():
    return str(uuid.uuid4())[:8]

### Helpers
def get_auth_headers(client, email, password):
    response = client.post("/auth/jwt/login", data={
        "username": email,
        "password": password
    })
    assert response.status_code == 200, f"Login failed for {email}: {response.text}"
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

### Tests
def test_full_scholarship(client, unique_id):
    """
    1. Organisation registers and posts a scholarship.
    2. Admin logs in and approves the scholarship.
    3. Student registers, sees the scholarship, and adds a reminder.
    """
    
    ### 1) create org + scholarship
    org_email = f"org_{unique_id}@test.example.com"
    org_pass = "securepass"
    
    # 1.1) Register org
    reg_response = client.post("/org/register", json={
        "email": org_email,
        "password": org_pass,
        "name": f"University of {unique_id}",
        "oib": f"{uuid.uuid4().int}"[:11],
        "address": "Test Street 1"
    })
    assert reg_response.status_code == 201

    # 1.2) Login as org
    org_headers = get_auth_headers(client, org_email, org_pass)

    # 1.3) Create scholarship
    scholarship_data = {
        "name": f"Test Scholarship {unique_id}",
        "value": 99,
        "url": "https://example.com",
        "is_allowed": True, # Backend should force this to False for orgs
        "is_monthly": True,
        "description": "Test description",
        "min_grade_average": 2.5
    }
    create_resp = client.post("/scholarships/", json=scholarship_data, headers=org_headers)
    assert create_resp.status_code == 201
    scholarship_id = create_resp.json()["id"]
    
    # Verify it is NOT public yet (orgs arent allowed to do that)
    assert create_resp.json()["is_allowed"] is False
    
    # Verify org can see it in private list
    my_list_resp = client.get("/org/scholarships", headers=org_headers)
    assert any(s["id"] == scholarship_id for s in my_list_resp.json())

    ### 2) admin approves scholarship
    
    # 2.1) Login as admin
    admin_headers = get_auth_headers(client, ADMIN_EMAIL, ADMIN_PASS)

    # 2.2) Find the unlisted scholarship
    unlisted_resp = client.get("/admin/scholarships", headers=admin_headers)
    assert any(s["id"] == scholarship_id for s in unlisted_resp.json())

    # 2.3) Approve
    update_resp = client.put(
        f"/scholarships/{scholarship_id}", 
        json={"is_allowed": True},
        headers=admin_headers
    )
    print(update_resp.text)
    assert update_resp.status_code == 200
    assert update_resp.json()["is_allowed"] is True

    ### 3) create student + verify we see scholarship + add reminder
    student_email = f"student_{unique_id}@test.example.com"
    student_pass = "studentpass"

    # 3.1) Register
    client.post("/auth/register", json={
        "email": student_email,
        "password": student_pass
    })

    # 3.2) Login
    student_headers = get_auth_headers(client, student_email, student_pass)

    # 3.3) Check public list
    public_resp = client.get("/scholarships/")
    assert any(s["id"] == scholarship_id for s in public_resp.json())

    # 3.4) Create reminder
    remind_date = (datetime.now(UTC) + timedelta(days=7)).isoformat()
    reminder_resp = client.post("/email-reminders", json={
        "scholarship_id": scholarship_id,
        "remind_at": remind_date,
        "name": "My Reminder"
    }, headers=student_headers)
    assert reminder_resp.status_code == 200
    reminder_id = reminder_resp.json()["id"]

    # 3.5) List reminders
    list_rem_resp = client.get("/email-reminders", headers=student_headers)
    assert len(list_rem_resp.json()) >= 1
    assert list_rem_resp.json()[0]["scholarship_id"] == scholarship_id

    # 3.6) Delete reminder
    del_resp = client.request(
        "DELETE", 
        "/email-reminders", 
        json={"id": reminder_id}, 
        headers=student_headers
    )
    assert del_resp.status_code == 200

    # 3.7) Verify its deleted
    list_rem_resp_after = client.get("/email-reminders", headers=student_headers)
    assert not any(r["id"] == reminder_id for r in list_rem_resp_after.json())

def test_admin_stats(client):
    """Verify admin stats endpoint works."""
    admin_headers = get_auth_headers(client, ADMIN_EMAIL, ADMIN_PASS)
    
    resp = client.get("/admin/stats", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "users" in data
    assert "active_scholarships" in data
