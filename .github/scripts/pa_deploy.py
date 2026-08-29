#!/usr/bin/env python3
"""把仓库当前文本文件全量上传到 PythonAnywhere（multipart），再交由工作流 Reload。

- 只上传文本类扩展名（图片/视频等二进制已由 owner 手工放在 PA，不在 CI 处理范围）
- PA 免费版 API 有每秒限流：429 时退避重试
- PA_API_TOKEN 未配置时打印警告并以 0 退出（在仓库 Secrets 配置后重跑即可）
"""
import io
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request

TEXT_EXTS = {
    ".py", ".html", ".css", ".js", ".mjs", ".json", ".md", ".yml", ".yaml",
    ".txt", ".ts", ".tsx", ".csv", ".svg", ".xml", ".webmanifest",
}
BASE = "https://www.pythonanywhere.com/api/v0/user/Luyanghao/files/path/home/Luyanghao/mysite/"
USER = "Luyanghao"


def list_files():
    out = subprocess.run(
        ["git", "ls-files"], capture_output=True, text=True, encoding="utf-8"
    ).stdout
    return [
        f.replace("\\", "/")
        for f in out.splitlines()
        if os.path.splitext(f)[1].lower() in TEXT_EXTS
    ]


def upload(rel: str, content: str, token: str) -> int:
    b = "----xhCiBoundary8f2c"
    name = rel.split("/")[-1]
    body = (
        f"--{b}\r\n"
        f'Content-Disposition: form-data; name="content"; filename="{name}"\r\n'
        f"Content-Type: application/octet-stream\r\n\r\n"
    ).encode("utf-8") + content.encode("utf-8") + (f"\r\n--{b}--\r\n").encode("utf-8")
    req = urllib.request.Request(
        BASE + rel,
        data=body,
        method="POST",
        headers={
            "Authorization": "Token " + token,
            "Content-Type": f"multipart/form-data; boundary={b}",
        },
    )
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.status


def main() -> int:
    token = (os.environ.get("PA_API_TOKEN") or "").strip()
    if not token:
        print("⚠️  PA_API_TOKEN 未配置：跳过上传。请在仓库 Settings → Secrets → Actions")
        print("   添加 PA_API_TOKEN（PythonAnywhere API token），然后重跑本工作流。")
        return 0

    files = list_files()
    print(f"deploying {len(files)} text files -> /home/{USER}/mysite/")
    ok, fail = 0, []
    for rel in files:
        content = io.open(rel, encoding="utf-8").read()
        # PA 免费 API 限流严格：请求间保持节奏，429 时按提示秒数长退避
        for attempt in range(10):
            try:
                st = upload(rel, content, token)
                if st in (200, 201):
                    ok += 1
                else:
                    fail.append((rel, f"HTTP {st}"))
                break
            except urllib.error.HTTPError as e:
                body = e.read().decode()[:200]
                if e.code == 429 and attempt < 9:
                    m = re.search(r"in (\d+) seconds", body)
                    wait = min(int(m.group(1)) + 2, 90) if m else 20 * (attempt + 1)
                    print(f"  429 throttled, sleeping {wait}s ({rel})")
                    time.sleep(wait)
                    continue
                fail.append((rel, f"HTTP {e.code} {body}"))
                break
            except Exception as e:  # noqa: BLE001
                if attempt < 9:
                    time.sleep(2 * (attempt + 1))
                    continue
                fail.append((rel, str(e)[:100]))
                break
        time.sleep(1.0)  # 请求节奏
    print(f"uploaded: {ok}/{len(files)}")
    for rel, why in fail:
        print("FAIL:", rel, why)
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
