#!/usr/bin/env python3
"""Validate and add one map record to Maps' app-scoped storage."""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


def request(url, token, *, method="GET", body=None, headers=None):
    merged = {"Authorization": f"Bearer {token}"}
    if headers:
        merged.update(headers)
    payload = None if body is None else json.dumps(body).encode("utf-8")
    if payload is not None:
        merged["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=payload, method=method, headers=merged)
    return urllib.request.urlopen(req, timeout=20)


def find_app_id(base_url, token):
    with request(f"{base_url}/api/apps/", token) as response:
        apps = json.load(response)
    for app in apps:
        if app.get("slug") in {"mapbook", "maps"} or app.get("name") == "Maps":
            return app["id"]
    raise RuntimeError("Maps is not installed")


def validate(record):
    required = ("id", "title", "area", "center", "origin", "places")
    missing = [key for key in required if not record.get(key)]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")
    if not isinstance(record["places"], list) or not record["places"]:
        raise ValueError("places must be a non-empty list")
    for place in record["places"]:
        for key in ("id", "name", "lat", "lon"):
            if key not in place:
                raise ValueError(f"Place is missing {key}")


def put_record(base_url, token, app_id, record):
    record_id = urllib.parse.quote(record["id"], safe="-_.")
    url = f"{base_url}/api/storage/apps/{app_id}/maps/{record_id}.json"
    with request(url, token, method="PUT", body=record):
        return


def merge_index(base_url, token, app_id, record_id):
    url = f"{base_url}/api/storage/apps/{app_id}/maps/index.json"
    for attempt in range(5):
        version = None
        try:
            # Raw storage reads only expose the opaque CAS token when this
            # version opt-in header is present.
            with request(
                url,
                token,
                headers={"X-Mobius-Version": "1"},
            ) as response:
                current = json.load(response)
                version = response.headers.get("ETag")
        except urllib.error.HTTPError as error:
            if error.code != 404:
                raise
            current = {"ids": []}

        ids = [value for value in current.get("ids", []) if isinstance(value, str)]
        ids = [record_id, *[value for value in ids if value != record_id]]
        next_index = {
            "ids": ids,
            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        headers = {}
        if version:
            headers["If-Match"] = version
        else:
            headers["If-None-Match"] = "*"
        try:
            with request(url, token, method="PUT", body=next_index, headers=headers):
                return
        except urllib.error.HTTPError as error:
            if error.code not in (409, 412):
                raise
            time.sleep(0.15 * (attempt + 1))
    raise RuntimeError("Maps index changed repeatedly; please retry")


def surface_app(base_url, token, app_id, source_chat_id):
    """Open Maps beside the source chat without stealing focus."""
    if not source_chat_id:
        return False
    body = {
        "type": "open_item",
        "itemKind": "app",
        "itemId": str(app_id),
        "sourceKind": "chat",
        "sourceId": source_chat_id,
        "placement": "beside-source",
        "activation": "background",
    }
    with request(f"{base_url}/api/notify", token, method="POST", body=body):
        return True


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: add_map.py <record.json>")
    base_url = os.environ.get("API_BASE_URL", "http://localhost:8000").rstrip("/")
    token = os.environ.get("AGENT_TOKEN")
    if not token:
        raise SystemExit("AGENT_TOKEN is required")
    with open(sys.argv[1], encoding="utf-8") as handle:
        record = json.load(handle)
    record.setdefault("created_at", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    if os.environ.get("CHAT_ID"):
        record.setdefault("source_chat", {})
        record["source_chat"].setdefault("id", os.environ["CHAT_ID"])
    validate(record)
    app_id = find_app_id(base_url, token)
    put_record(base_url, token, app_id, record)
    merge_index(base_url, token, app_id, record["id"])
    source_chat_id = record.get("source_chat", {}).get("id")
    surfaced = False
    try:
        surfaced = surface_app(base_url, token, app_id, source_chat_id)
    except (OSError, urllib.error.HTTPError) as error:
        print(f"Map saved, but Maps could not be surfaced: {error}", file=sys.stderr)
    print(
        json.dumps(
            {
                "status": "saved",
                "app_id": app_id,
                "map_id": record["id"],
                "surfaced": surfaced,
            }
        )
    )


if __name__ == "__main__":
    main()
