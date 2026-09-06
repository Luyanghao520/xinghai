# -*- coding: utf-8 -*-
"""阶段2（管理员多账号+角色）全链路验收。ASCII 输出。"""
import hashlib
import http.cookiejar
import json
import sqlite3
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:3000"
DB = r"C:/Users/陆阳昊/Desktop/星海艺术团官网建设/xinghai-next/data/xinghai.db"
LEGACY_SECRET = "LEGACYTESTSECRET"


def make_opener(jar):
    return urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(jar), urllib.request.ProxyHandler({})
    )


def req(jar, method, path, payload=None):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    r = urllib.request.Request(
        BASE + path, data=data, method=method,
        headers={"Content-Type": "application/json"} if data else {},
    )
    try:
        resp = make_opener(jar).open(r, timeout=15)
        return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))


ok = lambda cond: "PASS" if cond else "FAIL"
results = []
super_jar = http.cookiejar.CookieJar()
mgr_jar = http.cookiejar.CookieJar()
anon = http.cookiejar.CookieJar()

# 1) 超管种子账号登录
c, b = req(super_jar, "POST", "/api/admin/login", {"username": "admin", "pwd": "Xinghai@2026"})
results.append(("super login", ok(c == 200 and b.get("role") == "super")))

# 2) 错密码拒绝
c, b = req(http.cookiejar.CookieJar(), "POST", "/api/admin/login", {"username": "admin", "pwd": "nope"})
results.append(("super wrong-pwd 401", ok(c == 401)))

# 3) 超管创建管理人员
c, b = req(super_jar, "POST", "/api/admin/users",
           {"username": "manager001", "name": "测试干部", "role": "admin", "campus": "浦东", "pwd": "mgr123456"})
results.append(("super create manager", ok(c == 200)))

# 4) 用户名重复 409
c, b = req(super_jar, "POST", "/api/admin/users",
           {"username": "manager001", "name": "重复", "role": "admin", "pwd": "mgr123456"})
results.append(("duplicate 409", ok(c == 409)))

# 5) 干部登录
c, b = req(mgr_jar, "POST", "/api/admin/login", {"username": "manager001", "pwd": "mgr123456"})
results.append(("manager login", ok(c == 200 and b.get("role") == "admin")))

# 6) 干部无权管理账号（403）
c, b = req(mgr_jar, "POST", "/api/admin/users",
           {"username": "hacker", "name": "x", "role": "super", "pwd": "mgr123456"})
results.append(("manager create 403", ok(c == 403)))
c, b = req(mgr_jar, "POST", "/api/admin/users/action", {"id": "any", "action": "disable"})
results.append(("manager action 403", ok(c == 403)))

# 7) 未登录 401
c, b = req(anon, "POST", "/api/admin/users/action", {"id": "any", "action": "disable"})
results.append(("anon action 401", ok(c == 401)))

# 8) 干部改自己密码 → 旧密码失效、新密码可登录
c, b = req(mgr_jar, "POST", "/api/admin/account/password", {"oldPwd": "mgr123456", "newPwd": "mgr654321"})
results.append(("manager change pwd", ok(c == 200)))
c, b = req(http.cookiejar.CookieJar(), "POST", "/api/admin/login", {"username": "manager001", "pwd": "mgr123456"})
results.append(("manager old pwd 401", ok(c == 401)))
c, b = req(http.cookiejar.CookieJar(), "POST", "/api/admin/login", {"username": "manager001", "pwd": "mgr654321"})
results.append(("manager new pwd 200", ok(c == 200)))

# 9) 超管重置干部密码 → 临时密码可登录
con = sqlite3.connect(DB)
mgr_id = con.execute("SELECT id FROM users WHERE username='manager001'").fetchone()[0]
con.close()
c, b = req(super_jar, "POST", "/api/admin/users/action", {"id": mgr_id, "action": "reset_pwd"})
temp = (b.get("data") or {}).get("tempPassword", "")
results.append(("super reset_pwd", ok(c == 200 and len(temp) == 8)))
c, b = req(http.cookiejar.CookieJar(), "POST", "/api/admin/login", {"username": "manager001", "pwd": temp})
results.append(("temp pwd login", ok(c == 200)))

# 10) 超管不能停用/降级自己
con = sqlite3.connect(DB)
admin_id = con.execute("SELECT id FROM users WHERE username='admin'").fetchone()[0]
con.close()
c, b = req(super_jar, "POST", "/api/admin/users/action", {"id": admin_id, "action": "disable"})
results.append(("self disable blocked", ok(c == 400)))

# 11) 停用干部 → 登录 401；再启用 → 200
c, b = req(super_jar, "POST", "/api/admin/users/action", {"id": mgr_id, "action": "disable"})
results.append(("super disable", ok(c == 200)))
c, b = req(http.cookiejar.CookieJar(), "POST", "/api/admin/login", {"username": "manager001", "pwd": temp})
results.append(("disabled login 401", ok(c == 401)))
c, b = req(super_jar, "POST", "/api/admin/users/action", {"id": mgr_id, "action": "enable"})
results.append(("super enable", ok(c == 200)))

# 12) 应急通道：用户名留空 + ADMIN_TOKEN
c, b = req(http.cookiejar.CookieJar(), "POST", "/api/admin/login", {"username": "", "pwd": "xh-preview"})
results.append(("token backdoor", ok(c == 200 and b.get("role") == "super")))

# 13) 旧格式干部密码兼容（sha256(LEGACY_SECRET+pwd)）+ 自动升级
con = sqlite3.connect(DB)
legacy_hash = hashlib.sha256((LEGACY_SECRET + "oldchair789").encode()).hexdigest()
con.execute(
    "INSERT OR IGNORE INTO users (id, username, pwd, name, role, campus, status, created, updated, source)"
    " VALUES ('legacy-admin-1', '251400999', ?, '旧主席', 'super', NULL, 'active', '2025-01-01', '2025-01-01', 'legacy')",
    (legacy_hash,),
)
con.commit(); con.close()
c, b = req(http.cookiejar.CookieJar(), "POST", "/api/admin/login", {"username": "251400999", "pwd": "oldchair789"})
results.append(("legacy admin login", ok(c == 200)))
con = sqlite3.connect(DB)
stored = con.execute("SELECT pwd FROM users WHERE username='251400999'").fetchone()[0]
con.close()
results.append(("legacy upgraded scrypt", ok(stored.startswith("scrypt$"))))

print()
for name, verdict in results:
    print(f"[{verdict}] {name}")
fails = sum(1 for _, v in results if v == "FAIL")
print(f"\n{len(results) - fails}/{len(results)} passed")

# 清理测试账号（保留种子超管与真实迁移干部）
con = sqlite3.connect(DB)
con.execute("DELETE FROM users WHERE username IN ('manager001','251400999')")
con.commit(); con.close()
print("test managers cleaned")
