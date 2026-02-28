"""
GitHub Pages deploy helper.
Detects repo type and returns the deploy configuration.
"""

import os
import re


def detect_and_configure(repo_path: str, repo_name: str, github_user: str) -> dict:
    """Return deploy config for the given repo directory."""
    detectors = [
        detect_jekyll,
        # other test cases would be added here
    ]
    for detect in detectors:
        result = detect(repo_path, repo_name, github_user)
        if result:
            return result
    return {}


# ── Test case 10: Jekyll (GitHub Pages Native) ────────────────────────────────

def detect_jekyll(repo_path: str, repo_name: str, github_user: str) -> dict | None:
    """
    Detect by: _config.yml at root + Gemfile containing 'jekyll'.
    GitHub Pages builds Jekyll automatically — no CI needed.
    Output dir: _site/ (built by Pages, not committed).
    Base URL: baseurl/url written into _config.yml.
    """
    config_path = os.path.join(repo_path, "_config.yml")
    gemfile_path = os.path.join(repo_path, "Gemfile")

    if not os.path.isfile(config_path):
        return None
    if not os.path.isfile(gemfile_path):
        return None
    if not _gemfile_has_jekyll(gemfile_path):
        return None

    _set_baseurl(config_path, repo_name, github_user)
    _ensure_no_nojekyll(repo_path)

    return {
        "framework": "jekyll",
        "build_command": None,      # Pages builds automatically
        "output_dir": "_site/",
        "base_url": f"/{repo_name}",
    }


def _gemfile_has_jekyll(gemfile_path: str) -> bool:
    with open(gemfile_path) as f:
        return "jekyll" in f.read().lower()


def _set_baseurl(config_path: str, repo_name: str, github_user: str) -> None:
    """Write baseurl and url into _config.yml, adding them if absent."""
    with open(config_path) as f:
        content = f.read()

    content = _upsert_yaml_key(content, "baseurl", f'"/{repo_name}"')
    content = _upsert_yaml_key(content, "url", f'"https://{github_user}.github.io"')

    with open(config_path, "w") as f:
        f.write(content)


def _upsert_yaml_key(content: str, key: str, value: str) -> str:
    """Replace an existing top-level YAML key or append it."""
    pattern = rf"^{key}:.*$"
    replacement = f"{key}: {value}"
    updated, count = re.subn(pattern, replacement, content, flags=re.MULTILINE)
    if count == 0:
        updated = content.rstrip("\n") + f"\n{replacement}\n"
    return updated


def _ensure_no_nojekyll(repo_path: str) -> None:
    """Remove .nojekyll if present — Jekyll must be allowed to run."""
    nojekyll = os.path.join(repo_path, ".nojekyll")
    if os.path.isfile(nojekyll):
        os.remove(nojekyll)
