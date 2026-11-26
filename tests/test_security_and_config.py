"""
Security, Configuration, and Deployment Artifact Unit Tests
Tests auth hardening, role normalization, timeout settings, and Dockerfiles without requiring a live MongoDB instance.
"""

import os
from unittest.mock import AsyncMock, MagicMock, patch
from bson import ObjectId
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import settings
from backend.app.auth.jwt_handler import create_access_token


def test_mongo_timeout_configured_for_fast_fail():
    assert settings.MONGO_SERVER_SELECTION_TIMEOUT_MS <= 5000


def test_dockerfiles_and_nginx_exist():
    assert os.path.exists("backend/Dockerfile")
    assert os.path.exists("frontend/Dockerfile")
    assert os.path.exists("frontend/nginx.conf")


def test_google_auth_rejects_unverified_in_production(monkeypatch):
    monkeypatch.setattr(settings, "ALLOW_DEV_OAUTH_BYPASS", False)
    with patch("backend.app.main.connect_to_mongo", AsyncMock()), patch("backend.app.main.close_mongo_connection", AsyncMock()):
        with TestClient(app) as tc:
            # Missing token
            res1 = tc.post("/api/auth/google", json={"email": "attacker@gmail.com", "name": "Spoof"})
            assert res1.status_code == 401

            # Forged unsigned JWT payload
            res2 = tc.post("/api/auth/google", json={"token": "header.eyJlbWFpbCI6ImF0dGFja2VyQGdtYWlsLmNvbSJ9.sig"})
            assert res2.status_code == 401


def test_google_client_id_requires_admin_and_validates_format():
    farmer_id = ObjectId()
    admin_id = ObjectId()
    farmer_token = create_access_token({"sub": "farmer@agritech.com", "role": "FARMER"})
    admin_token = create_access_token({"sub": "admin@agritech.com", "role": "ADMIN"})

    mock_db = MagicMock()

    async def fake_find_one(query):
        if query.get("email") == "farmer@agritech.com":
            return {"_id": farmer_id, "email": "farmer@agritech.com", "role": "FARMER", "name": "Farmer"}
        if query.get("email") == "admin@agritech.com":
            return {"_id": admin_id, "email": "admin@agritech.com", "role": "ADMIN", "name": "Admin"}
        return None

    mock_db.users.find_one = AsyncMock(side_effect=fake_find_one)

    with patch("backend.app.main.connect_to_mongo", AsyncMock()), patch("backend.app.main.close_mongo_connection", AsyncMock()):
        with TestClient(app) as tc:
            # Unauthenticated -> 401
            res_no_auth = tc.post("/api/auth/google-client-id", json={"client_id": "12345.apps.googleusercontent.com"})
            assert res_no_auth.status_code == 401

            with patch("backend.app.auth.jwt_handler.get_database", return_value=mock_db):
                # Non-admin -> 403
                res_farmer = tc.post(
                    "/api/auth/google-client-id",
                    json={"client_id": "12345.apps.googleusercontent.com"},
                    headers={"Authorization": f"Bearer {farmer_token}"},
                )
                assert res_farmer.status_code == 403

                # Admin with newline injection attempt -> 400
                res_bad = tc.post(
                    "/api/auth/google-client-id",
                    json={"client_id": "12345.apps.googleusercontent.com\nEVIL=1"},
                    headers={"Authorization": f"Bearer {admin_token}"},
                )
                assert res_bad.status_code == 400


def test_pwa_manifest_service_worker_and_icons_exist():
    """Verify installable PWA manifest, service worker, offline page, and app icons exist."""
    import json
    from pathlib import Path

    pub_dir = Path("frontend/public")
    manifest_path = pub_dir / "manifest.webmanifest"
    assert manifest_path.is_file()
    assert (pub_dir / "sw.js").is_file()
    assert (pub_dir / "offline.html").is_file()
    assert (pub_dir / "pwa-192x192.png").is_file()
    assert (pub_dir / "pwa-512x512.png").is_file()
    assert (pub_dir / "apple-touch-icon.png").is_file()

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert manifest["display"] == "standalone"
    assert len(manifest["icons"]) >= 2

