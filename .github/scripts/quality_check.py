#!/usr/bin/env python3
"""Offline structural checks for the static HEWAD COIN website."""
from __future__ import annotations

import os
import re
import subprocess
import sys
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[2]
SKIP_DIRS = {".git", "node_modules"}
ERRORS: list[str] = []


class PageScanner(HTMLParser):
    def __init__(self, page: Path) -> None:
        super().__init__(convert_charrefs=False)
        self.page = page
        self.inline_scripts: list[str] = []
        self.local_refs: list[tuple[str, str]] = []
        self._script_chunks: list[str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "script":
            if values.get("src"):
                self.local_refs.append(("script", values["src"] or ""))
            else:
                self._script_chunks = []
        elif tag == "iframe" and values.get("src"):
            self.local_refs.append(("iframe", values["src"] or ""))
        elif tag in {"img", "source", "audio", "video"} and values.get("src"):
            self.local_refs.append((tag, values["src"] or ""))
        elif tag == "link" and "stylesheet" in (values.get("rel") or "").lower().split():
            if values.get("href"):
                self.local_refs.append(("stylesheet", values["href"] or ""))

    def handle_data(self, data: str) -> None:
        if self._script_chunks is not None:
            self._script_chunks.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._script_chunks is not None:
            self.inline_scripts.append("".join(self._script_chunks))
            self._script_chunks = None


def files_with_suffix(suffix: str):
    for current, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            path = Path(current) / name
            if path.suffix.lower() == suffix:
                yield path


def check_javascript() -> None:
    js_files = sorted(files_with_suffix(".js"))
    if not js_files:
        print("No JavaScript files found; skipping JS syntax checks.")
    for path in js_files:
        result = subprocess.run(
            ["node", "--check", str(path)],
            cwd=ROOT,
            text=True,
            capture_output=True,
        )
        if result.returncode:
            ERRORS.append(f"JavaScript syntax error in {path.relative_to(ROOT)}")
            detail = (result.stderr or result.stdout).strip()
            if detail:
                print(detail)
        else:
            print(f"JS OK: {path.relative_to(ROOT)}")


def check_html() -> None:
    html_files = sorted(files_with_suffix(".html"))
    if not html_files:
        ERRORS.append("No HTML files found.")
        return

    for page in html_files:
        scanner = PageScanner(page)
        try:
            scanner.feed(page.read_text(encoding="utf-8"))
            scanner.close()
        except Exception as exc:
            ERRORS.append(f"Could not parse {page.relative_to(ROOT)}: {exc}")
            continue

        for kind, raw_url in scanner.local_refs:
            parsed = urlsplit(raw_url.strip())
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            if raw_url.strip().startswith("#"):
                continue
            target = (page.parent / unquote(parsed.path)).resolve()
            try:
                target.relative_to(ROOT)
            except ValueError:
                ERRORS.append(
                    f"Reference escapes repository in {page.relative_to(ROOT)}: {raw_url}"
                )
                continue
            if not target.is_file():
                ERRORS.append(
                    f"Missing local {kind} in {page.relative_to(ROOT)}: {raw_url}"
                )

        # Dynamic scripts are injected into the homepage iframe, so their paths
        # are relative to the repository-root homepage document.
        source = page.read_text(encoding="utf-8")
        for match in re.finditer(
            r"loadScript\s*\(\s*['\"][^'\"]+['\"]\s*,\s*['\"]([^'\"]+)['\"]",
            source,
        ):
            raw_url = match.group(1)
            parsed = urlsplit(raw_url)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            target = (ROOT / unquote(parsed.path)).resolve()
            if not target.is_file():
                ERRORS.append(
                    f"Missing dynamically loaded script referenced by "
                    f"{page.relative_to(ROOT)}: {raw_url}"
                )

        for index, script in enumerate(scanner.inline_scripts, start=1):
            if not script.strip():
                continue
            with tempfile.NamedTemporaryFile(
                mode="w", suffix=".js", encoding="utf-8", delete=False
            ) as temp:
                temp.write(script)
                temp_path = Path(temp.name)
            try:
                result = subprocess.run(
                    ["node", "--check", str(temp_path)],
                    text=True,
                    capture_output=True,
                )
                if result.returncode:
                    ERRORS.append(
                        f"Inline JavaScript syntax error in "
                        f"{page.relative_to(ROOT)} (script {index})"
                    )
                    detail = (result.stderr or result.stdout).strip()
                    if detail:
                        print(detail)
            finally:
                temp_path.unlink(missing_ok=True)

        print(f"HTML references OK: {page.relative_to(ROOT)}")


def main() -> int:
    print("Running HEWAD COIN offline quality checks…")
    check_javascript()
    check_html()
    if ERRORS:
        print("\nQuality checks failed:")
        for error in ERRORS:
            print(f" - {error}")
        return 1
    print("\nAll configured quality checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
