"""Tests for test case 10: Jekyll (GitHub Pages Native)."""

import os
import tempfile

from deploy import detect_and_configure, detect_jekyll


def _make_jekyll_repo(tmp: str, config_extra: str = "", has_nojekyll: bool = False) -> None:
    with open(os.path.join(tmp, "_config.yml"), "w") as f:
        f.write(f"title: My Site\n{config_extra}")
    with open(os.path.join(tmp, "Gemfile"), "w") as f:
        f.write('gem "jekyll", "~> 4.3"\n')
    if has_nojekyll:
        open(os.path.join(tmp, ".nojekyll"), "w").close()


def test_detects_jekyll():
    with tempfile.TemporaryDirectory() as tmp:
        _make_jekyll_repo(tmp)
        result = detect_and_configure(tmp, "my-repo", "alice")
        assert result["framework"] == "jekyll"
        assert result["build_command"] is None
        assert result["output_dir"] == "_site/"
        assert result["base_url"] == "/my-repo"


def test_sets_baseurl_and_url_in_config():
    with tempfile.TemporaryDirectory() as tmp:
        _make_jekyll_repo(tmp)
        detect_and_configure(tmp, "my-repo", "alice")
        config = open(os.path.join(tmp, "_config.yml")).read()
        assert 'baseurl: "/my-repo"' in config
        assert 'url: "https://alice.github.io"' in config


def test_updates_existing_baseurl():
    with tempfile.TemporaryDirectory() as tmp:
        _make_jekyll_repo(tmp, config_extra='baseurl: ""\n')
        detect_and_configure(tmp, "new-repo", "bob")
        config = open(os.path.join(tmp, "_config.yml")).read()
        assert 'baseurl: "/new-repo"' in config
        assert config.count("baseurl:") == 1  # no duplicates


def test_removes_nojekyll():
    with tempfile.TemporaryDirectory() as tmp:
        _make_jekyll_repo(tmp, has_nojekyll=True)
        assert os.path.isfile(os.path.join(tmp, ".nojekyll"))
        detect_and_configure(tmp, "my-repo", "alice")
        assert not os.path.isfile(os.path.join(tmp, ".nojekyll"))


def test_no_config_yml_not_detected():
    with tempfile.TemporaryDirectory() as tmp:
        open(os.path.join(tmp, "Gemfile"), "w").close()
        result = detect_jekyll(tmp, "my-repo", "alice")
        assert result is None


def test_no_gemfile_not_detected():
    with tempfile.TemporaryDirectory() as tmp:
        open(os.path.join(tmp, "_config.yml"), "w").close()
        result = detect_jekyll(tmp, "my-repo", "alice")
        assert result is None


def test_gemfile_without_jekyll_not_detected():
    with tempfile.TemporaryDirectory() as tmp:
        open(os.path.join(tmp, "_config.yml"), "w").close()
        with open(os.path.join(tmp, "Gemfile"), "w") as f:
            f.write('gem "rails"\n')
        result = detect_jekyll(tmp, "my-repo", "alice")
        assert result is None


if __name__ == "__main__":
    tests = [v for k, v in list(globals().items()) if k.startswith("test_")]
    passed = failed = 0
    for t in tests:
        try:
            t()
            print(f"  PASS  {t.__name__}")
            passed += 1
        except Exception as e:
            print(f"  FAIL  {t.__name__}: {e}")
            failed += 1
    print(f"\n{passed} passed, {failed} failed")
