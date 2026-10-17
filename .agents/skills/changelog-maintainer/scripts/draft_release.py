#!/usr/bin/env python3
"""Print a release-note starting point from the root Git index."""

from __future__ import annotations

import argparse
import datetime as dt
import subprocess
import sys


def staged_paths() -> list[tuple[str, str]]:
    result = subprocess.run(
        ["git", "diff", "--cached", "--name-status", "-z"],
        check=True,
        capture_output=True,
    )
    fields = result.stdout.decode("utf-8", errors="replace").split("\0")
    entries: list[tuple[str, str]] = []
    index = 0
    while index < len(fields) and fields[index]:
        status = fields[index]
        index += 1
        if status.startswith(("R", "C")):
            index += 1  # Old path; report the destination.
        path = fields[index]
        index += 1
        entries.append((status, path))
    return entries


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("version", help="Release version, for example 1.1.0")
    parser.add_argument("--date", default=dt.date.today().isoformat())
    args = parser.parse_args()

    try:
        entries = staged_paths()
    except subprocess.CalledProcessError as exc:
        print(exc.stderr.decode("utf-8", errors="replace"), file=sys.stderr)
        return exc.returncode

    print(f"## [{args.version}] - {args.date}\n")
    if not entries:
        print("No staged changes. Stage the release changes before drafting notes.")
        return 0

    sections = {"Added": [], "Changed": [], "Removed": []}
    for status, path in entries:
        section = "Added" if status.startswith("A") else "Removed" if status.startswith("D") else "Changed"
        sections[section].append(path)
    for section, paths in sections.items():
        if paths:
            print(f"### {section}\n")
            for path in paths:
                print(f"- Describe the impact of `{path}`.")
            print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
