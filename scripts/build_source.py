"""Build a deterministic public Page source artifact from tracked allowlisted files."""

import hashlib
import json
import subprocess
import zipfile
from pathlib import Path

roots = {"src", "public", "contracts", "scripts", "tests"}
root_files = {
    "README.md", "SECURITY.md", "MIGRATION.md", "CHANGELOG.md", "LICENSE",
    ".env.example", "package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml",
    "tsconfig.json", "next.config.ts", "next.config.mjs", "next.config.js",
    "eslint.config.mjs", "vitest.config.ts", "vitest.config.mts",
    "playwright.config.ts", "next-env.d.ts", ".gitignore",
    "postcss.config.mjs", "postcss.config.js",
}
tracked = subprocess.check_output(["git", "ls-files", "-z"]).decode().split("\0")
paths = sorted(
    Path(name)
    for name in tracked
    if name and (Path(name).parts[0] in roots or name in root_files)
)
manifest = {
    "version": "2.0.0",
    "commit": subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip(),
    "files": {
        str(path): hashlib.sha256(path.read_bytes()).hexdigest() for path in paths
    },
}
Path("dist").mkdir(exist_ok=True)
output = Path("dist/ConanGrayBot-Page-v2.0.0-source.zip")
with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    entries = [(str(path), path.read_bytes()) for path in paths]
    entries.append(
        (
            "BUILD_MANIFEST.json",
            (json.dumps(manifest, sort_keys=True, indent=2) + "\n").encode(),
        )
    )
    for name, data in entries:
        info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
        info.external_attr = 0o100644 << 16
        info.compress_type = zipfile.ZIP_DEFLATED
        archive.writestr(info, data)
Path("dist/SHA256SUMS").write_text(
    hashlib.sha256(output.read_bytes()).hexdigest() + "  " + output.name + "\n"
)
print("Public Page source artifact and checksums generated.")
