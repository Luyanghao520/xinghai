# -*- coding: utf-8 -*-
"""星海艺术团官方网站（大系统）
- 招新子系统：复用原有 /api/signup、/admin、/cms、AI
- 成员信息子系统（员工式录入）：独立 members.db，学号为主键
- 统一登录 + 工作端：users.db，按角色
- 数据分离：各子系统独立库 / 文件，不混库
依赖 Flask（已预装）+ 标准库 sqlite3 / hashlib。
"""
import csv
import hashlib
import io
import json
import os
import sqlite3
from datetime import datetime
from html import escape

from flask import (Flask, request, jsonify, send_file, Response, redirect,
                     session, url_for)

BASE = os.path.dirname(os.path.abspath(__file__))
DB_REG = os.path.join(BASE, "registrations.db")   # 招新子系统
DB_MEM = os.path.join(BASE, "members.db")          # 成员信息子系统
DB_USR = os.path.join(BASE, "users.db")            # 统一账号
DB_REI = os.path.join(BASE, "reimburse.db")      # 报销子系统
DB_RES = os.path.join(BASE, "reserve.db")       # 预约子系统
DB_BUL = os.path.join(BASE, "bulletins.db")     # 活动通报子系统
CONTENT = os.path.join(BASE, "content.json")
STATIC = os.path.join(BASE, "static")
os.makedirs(os.path.join(STATIC, "uploads"), exist_ok=True)

ADMIN_KEY = "xinghai2026"          # 招新后台 / CMS 密码
SECRET = "xinghai-art-troupe-2026"  # Flask session 密钥

app = Flask(__name__, static_folder=STATIC, static_url_path="/static")
app.secret_key = SECRET

# ============ 工具 ============
def db(path):
    cx = sqlite3.connect(path)
    cx.row_factory = sqlite3.Row
    return cx

def hx(s):  # 学号哈希（加盐）
    return hashlib.sha256((SECRET + str(s)).encode("utf-8")).hexdigest()

def login_required(f):
    from functools import wraps
    @wraps(f)
    def w(*a, **k):
        if "uid" not in session:
            if request.path.startswith("/api"):
                return jsonify({"ok": False, "error": "未登录"}), 401
            return redirect("/login")
        return f(*a, **k)
    return w

# ============ 初始化 ============
def init_reg():
    cx = db(DB_REG)
    cx.execute("""CREATE TABLE IF NOT EXISTS registrations(
        id INTEGER PRIMARY KEY AUTOINCREMENT, time TEXT, target TEXT, name TEXT,
        gender TEXT, birth TEXT, campus TEXT, college TEXT, major TEXT,
        phone TEXT, wechat TEXT, email TEXT, skill TEXT, motive TEXT, adjust INTEGER)""")
    cx.commit()
    jf = os.path.join(BASE, "registrations.json")
    if os.path.exists(jf) and os.path.getsize(jf) > 2:
        try:
            rows = json.load(open(jf, encoding="utf-8"))
            cur = cx.execute("SELECT COUNT(*) AS c FROM registrations").fetchone()["c"]
            if cur == 0:
                for r in rows:
                    cx.execute("INSERT INTO registrations (time,target,name,gender,birth,campus,college,major,phone,wechat,email,skill,motive,adjust) "
                                 "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                                 (r.get("time"), r.get("name"), r.get("gender"),
                                  r.get("birth"), r.get("campus"), r.get("college"), r.get("major"),
                                  r.get("phone"), r.get("wechat"), r.get("email"),
                                  r.get("skill"), r.get("motive"), r.get("adjust"), 1 if r.get("adjust") else 0))
                cx.commit()
            os.rename(jf, jf + ".migrated")
        except Exception as e:
            app.logger.warning("migrate json failed: %s", e)
    cx.close()

MEM_COLS = ["xh", "name", "gender", "campus", "college", "major",
             "phone", "wechat", "email", "role", "dept",
             "join_date", "grade", "status", "skill", "note"]
MEM_LABELS = {"xh": "学号", "name": "姓名", "gender": "性别", "campus": "校区",
              "college": "学院", "major": "专业/班级", "phone": "手机号", "wechat": "微信",
              "email": "邮箱", "role": "角色", "dept": "所属部门/团队", "join_date": "入团时间",
              "grade": "届别", "status": "状态", "skill": "特长/经历", "note": "备注"}

def init_mem():
    cx = db(DB_MEM)
    cx.execute("""CREATE TABLE IF NOT EXISTS members(
        xh TEXT PRIMARY KEY, name TEXT, gender TEXT, campus TEXT, college TEXT,
        major TEXT, phone TEXT, wechat TEXT, email TEXT, role TEXT, dept TEXT,
        join_date TEXT, grade TEXT, status TEXT, skill TEXT, note TEXT,
        updated TEXT)""")
    cx.commit(); cx.close()

def init_usr():
    cx = db(DB_USR)
    cx.execute("""CREATE TABLE IF NOT EXISTS users(
        xh TEXT PRIMARY KEY, name TEXT, role TEXT, pwd TEXT, campus TEXT, status TEXT)""")
    cx.commit()
    if cx.execute("SELECT COUNT(*) AS c FROM users").fetchone()["c"] == 0:
        cx.execute("INSERT INTO users VALUES (?,?,?,?,?,?)",
                   ("000000000", "系统管理员", "主席", hx("xinghai2026"), "", "在团"))
        cx.commit()
    cx.close()

# ============ 报销子系统（员工式，独立库） ============
def init_rei():
    cx = db(DB_REI)
    cx.execute("""CREATE TABLE IF NOT EXISTS rei(
        id INTEGER PRIMARY KEY AUTOINCREMENT, xh TEXT, name TEXT, title TEXT,
        category TEXT, amount REAL, note TEXT, status TEXT,
        created TEXT, updated TEXT)""")
    cx.commit(); cx.close()

REI_COLS = ["xh", "name", "title", "category", "amount", "note", "status"]

# ============ 预约子系统（员工式，独立库） ============
def init_res():
    cx = db(DB_RES)
    cx.execute("""CREATE TABLE IF NOT EXISTS resv(
        id INTEGER PRIMARY KEY AUTOINCREMENT, xh TEXT, name TEXT, item TEXT,
        type TEXT, start_time TEXT, end_time TEXT, purpose TEXT,
        status TEXT, created TEXT, updated TEXT)""")
    cx.commit(); cx.close()

RES_COLS = ["xh", "name", "item", "type", "start_time", "end_time", "purpose", "status"]

# ============ 活动通报子系统（独立库） ============
def init_bul():
    cx = db(DB_BUL)
    cx.execute("""CREATE TABLE IF NOT EXISTS bul(
        id INTEGER PRIMARY KEY AUTOINCREMENT, author TEXT, author_xh TEXT,
        title TEXT, body TEXT, level TEXT, pinned INTEGER, created TEXT)""")
    cx.commit(); cx.close()

# ============ 招新子系统（复用） ============
@app.route("/recruit")
def recruit():
    return send_file(os.path.join(BASE, "recruit.html"))

@app.route("/api/signup", methods=["POST"])
def signup():
    try:
        d = request.get_json(force=True, silent=True) or {}
    except Exception:
        return jsonify({"ok": False, "error": "数据格式错误"}), 400
    name = (d.get("name") or "").strip()
    campus = (d.get("campus") or "").strip()
    gender = (d.get("gender") or "").strip()
    college = (d.get("college") or "").strip()
    major = (d.get("major") or "").strip()
    phone = (d.get("phone") or "").strip()
    if not (name and campus and gender and college and major and phone):
        return jsonify({"ok": False, "error": "必填项不完整"}), 400
    if not phone.isdigit() or len(phone) != 11:
        return jsonify({"ok": False, "error": "手机号格式不正确"}), 400
    cx = db(DB_REG)
    cols = ["time","target","name","gender","birth","campus","college","major","phone","wechat","email","skill","motive","adjust"]
    vals = [
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        (d.get("target") or "").strip(), name, gender, (d.get("birth") or "").strip(),
        campus, college, major, phone,
        (d.get("wechat") or "").strip(), (d.get("email") or "").strip(),
        (d.get("skill") or "").strip(), (d.get("motive") or "").strip(),
        1 if d.get("adjust") else 0,
    ]
    assert len(cols) == len(vals), (len(cols), len(vals))
    cx.execute("INSERT INTO registrations (" + ",".join(cols) + ") VALUES (" + ",".join("?" * len(cols)) + ")", vals)
    cx.commit()
    total = cx.execute("SELECT COUNT(*) AS c FROM registrations").fetchone()["c"]
    cx.close()
    export_csv()
    return jsonify({"ok": True, "count": total})

@app.route("/api/delete", methods=["POST"])
def delete():
    if request.args.get("key") != ADMIN_KEY and (request.get_json(silent=True) or {}).get("key") != ADMIN_KEY:
        return jsonify({"ok": False, "error": "无权限"}), 403
    rid = (request.get_json(silent=True) or {}).get("id") or request.args.get("id")
    if not rid:
        return jsonify({"ok": False, "error": "缺少 id"}), 400
    cx = db(DB_REG); cx.execute("DELETE FROM registrations WHERE id=?", (rid,)); cx.commit(); cx.close()
    export_csv()
    return jsonify({"ok": True})

def all_rows(q=None):
    cx = db(DB_REG)
    if q:
        like = "%" + q + "%"
        rows = cx.execute("SELECT * FROM registrations WHERE name LIKE ? OR phone LIKE ? OR target LIKE ? "
                       "OR college LIKE ? OR major LIKE ? ORDER BY id DESC", (like, like, like, like, like)).fetchall()
    else:
        rows = cx.execute("SELECT * FROM registrations ORDER BY id DESC").fetchall()
    cx.close()
    return [dict(r) for r in rows]

def export_csv():
    rows = all_rows()
    path = os.path.join(BASE, "registrations.csv")
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["time", "target", "name", "gender", "birth", "campus",
                                            "college", "major", "phone", "wechat", "email", "skill", "motive", "adjust"])
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in w.fieldnames})

@app.route("/admin")
def admin():
    if request.args.get("key") != ADMIN_KEY:
        return Response("无权限：key 错误", status=403)
    q = (request.args.get("q") or "").strip()
    export = request.args.get("export")
    rows = all_rows(q if q else None)
    if export == "csv":
        export_csv()
        return send_file(os.path.join(BASE, "registrations.csv"), mimetype="text/csv",
                         as_attachment=True, download_name="星海艺术团报名.csv")
    cx = db(DB_REG)
    total = cx.execute("SELECT COUNT(*) AS c FROM registrations").fetchone()["c"]
    by_campus = dict((r["campus"] or "未填", r["c"]) for r in
                      cx.execute("SELECT campus, COUNT(*) AS c FROM registrations GROUP BY campus"))
    by_target = dict((r["target"] or "未填", r["c"]) for r in
                       cx.execute("SELECT target, COUNT(*) AS c FROM registrations GROUP BY target"))
    cx.close()
    h = ['<meta charset="utf-8"><title>星海报名后台</title>',
         '<style>body{font-family:-apple-system,"Microsoft YaHei",sans-serif;background:#f4f7fb;margin:0;padding:24px;color:#1A2233}a{color:#2B579A}'
         '.top{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:18px}'
         '.card{background:#fff;border:1px solid #e7ecf3;border-radius:14px;padding:14px 18px;box-shadow:0 6px 20px rgba(15,42,82,.06)}'
         '.stat{font-size:13px;color:#6B7280}.stat b{color:#0F2A52;font-size:22px;font-weight:900}'
         '.bar{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.pill{background:#EEF4FB;border:1px solid #dbe6f3;color:#2B579A;border-radius:20px;padding:4px 12px;font-size:12.5px}'
         'form.srch input{padding:9px 12px;border:1px solid #dbe6f3;border-radius:9px;font-size:13px}'
         'form.srch button{padding:9px 16px;border:none;background:#2B579A;color:#fff;border-radius:9px;cursor:pointer}'
         'a.btn{display:inline-block;padding:9px 16px;border-radius:9px;background:#0F2A52;color:#fff;text-decoration:none;font-size:13px;margin-left:auto}'
         'table{border-collapse:collapse;width:100%;font-size:12.5px;background:#fff;margin-top:16px;box-shadow:0 6px 20px rgba(15,42,82,.06);border-radius:14px;overflow:hidden}'
         'th,td{border-bottom:1px solid #eef2f7;padding:9px 10px;text-align:left;vertical-align:top}'
         'th{background:#0F2A52;color:#fff;font-weight:700}tr:hover td{background:#f7faff}'
         '.del{background:#fdeceb;color:#c0392b;border:1px solid #f5c6bd;border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px}'
         '.empty{text-align:center;color:#9aa3b0;padding:40px}</style>']
    cols = ["time", "target", "name", "gender", "birth", "campus", "college", "major", "phone", "wechat", "email", "skill", "motive", "adjust"]
    labels = {"time": "提交时间", "target": "意向方向", "name": "姓名", "gender": "性别", "birth": "出生年月",
             "campus": "校区", "college": "院系", "major": "专业/班级", "phone": "手机号", "wechat": "微信",
             "email": "邮箱", "skill": "特长/经历", "motive": "报名动机", "adjust": "服从调剂"}
    h.append('<div class="top"><div class="card stat">报名总数 <b>%d</b> 人</div></div>' % total)
    pills = [('<span class="pill">%s：%d</span>' % (escape(k), by_campus[k])) for k in ("浦东", "松江") if k in by_campus]
    h.append('<div class="bar">校区：' + ("".join(pills) if pills else '<span class="pill">暂无</span>') + '</div>')
    tp = "".join('<span class="pill">%s：%d</span>' % (escape(k), v) for k, v in by_target.items())
    h.append('<div class="bar">方向：' + (tp if tp else '<span class="pill">暂无</span>') + '</div>')
    h.append('<div class="top"><form class="srch" method="get"><input name="q" value="%s" placeholder="搜姓名/手机/方向/院系">'
             '<button>检索</button></form>' % escape(q) +
             '<a class="btn" href="?key=%s&export=csv">⬇ 导出 CSV</a>' % ADMIN_KEY +
             '<a class="btn" style="background:#2B579A;margin-left:10px" href="/cms" target="_blank">🛠 内容管理</a></div>')
    if not rows:
        h.append('<div class="empty">暂无报名数据</div>')
    else:
        head = "".join("<th>%s</th>" % escape(labels[c]) for c in cols) + "<th>操作</th>"
        body = []
        for r in rows:
            tds = "".join("<td>%s</td>" % escape(str(r.get(c, ""))) for c in cols)
            tds += '<td><button class="del" onclick="del(%d)">删除</button></td>' % r["id"]
            body.append("<tr>" + tds + "</tr>")
        h.append('<table><thead><tr>%s</tr></thead><tbody>%s</tbody></table>' % (head, "".join(body)))
    h.append("""<script>function del(id){if(!confirm('确认删除该报名记录？'))return;
      fetch('/api/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id,key:'%s'})})
      .then(r=>r.json()).then(d=>{if(d.ok)location.reload();else alert('删除失败：'+(d.error||''));});}</script>""" % ADMIN_KEY)
    return Response("".join(h), mimetype="text/html")

# ============ 内容库（CMS，复用） ============
def load_content():
    try:
        if os.path.exists(CONTENT):
            with open(CONTENT, encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return {}

def save_content(obj):
    with open(CONTENT, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

@app.route("/api/content")
def api_content():
    return jsonify(load_content())

@app.route("/api/content", methods=["POST"])
def api_content_set():
    if request.args.get("key") != ADMIN_KEY and (request.get_json(silent=True) or {}).get("key") != ADMIN_KEY:
        return jsonify({"ok": False, "error": "无权限"}), 403
    data = request.get_json(force=True, silent=True) or {}
    cur = load_content(); cur.update(data); save_content(cur)
    return jsonify({"ok": True})

@app.route("/api/upload", methods=["POST"])
def api_upload():
    if request.args.get("key") != ADMIN_KEY:
        return jsonify({"ok": False, "error": "无权限"}), 403
    f = request.files.get("file")
    if not f:
        return jsonify({"ok": False, "error": "未收到文件"}), 400
    name = (f.filename or "img.png").rsplit(".", 1)
    ext = (name[-1] if len(name) > 1 else "png").lower()
    if ext not in ("png", "jpg", "jpeg", "gif", "webp"):
        return jsonify({"ok": False, "error": "仅支持图片文件"}), 400
    safe = "u" + datetime.now().strftime("%Y%m%d%H%M%S") + "_" + os.urandom(4).hex() + "." + ext
    f.save(os.path.join(STATIC, "uploads", safe))
    return jsonify({"ok": True, "url": "/static/uploads/" + safe})

@app.route("/cms")
def cms():
    return send_file(os.path.join(BASE, "cms.html"))

# ============ 统一登录 ============
@app.route("/login", methods=["GET"])
def login_page():
    if "uid" in session:
        return redirect("/work")
    return send_file(os.path.join(BASE, "login.html"))

@app.route("/api/login", methods=["POST"])
def api_login():
    d = request.get_json(force=True, silent=True) or {}
    xh = (d.get("xh") or "").strip()
    pwd = (d.get("pwd") or "").strip()
    if not (xh and pwd):
        return jsonify({"ok": False, "error": "请输入学号/工号和密码"}), 400
    cx = db(DB_USR)
    u = cx.execute("SELECT * FROM users WHERE xh=?", (xh,)).fetchone()
    cx.close()
    if not u or u["pwd"] != hx(pwd):
        return jsonify({"ok": False, "error": "学号/工号或密码错误"}), 401
    session["uid"] = u["xh"]; session["name"] = u["name"]; session["role"] = u["role"]
    return jsonify({"ok": True, "name": u["name"], "role": u["role"]})

@app.route("/api/me")
def api_me():
    if "uid" not in session:
        return jsonify({"ok": False})
    return jsonify({"ok": True, "name": session.get("name"),
                    "role": session.get("role"), "uid": session.get("uid")})

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

# ============ 成员信息子系统（员工式录入） ============
@app.route("/work")
@login_required
def work():
    return send_file(os.path.join(BASE, "work.html"))

@app.route("/work/members")
@login_required
def members_page():
    return send_file(os.path.join(BASE, "members.html"))

@app.route("/api/members")
@login_required
def api_members():
    q = (request.args.get("q") or "").strip()
    campus = (request.args.get("campus") or "").strip()
    role = (request.args.get("role") or "").strip()
    cx = db(DB_MEM)
    sql = "SELECT * FROM members WHERE 1=1"
    args = []
    if q:
        sql += " AND (xh LIKE ? OR name LIKE ? OR dept LIKE ? OR college LIKE ? OR major LIKE ?)"
        like = "%" + q + "%"
        args += [like, like, like, like, like]
    if campus:
        sql += " AND campus=?"; args.append(campus)
    if role:
        sql += " AND role=?"; args.append(role)
    sql += " ORDER BY xh"
    rows = [dict(r) for r in cx.execute(sql, args).fetchall()]
    cx.close()
    return jsonify(rows)

@app.route("/api/members", methods=["POST"])
@login_required
def api_members_save():
    d = request.get_json(force=True, silent=True) or {}
    xh = (d.get("xh") or "").strip()
    if not (xh.isdigit() and len(xh) == 9):
        return jsonify({"ok": False, "error": "学号须为 9 位数字（如 251400143）"}), 400
    vals = {c: (d.get(c) or "").strip() for c in MEM_COLS if c != "xh"}
    vals["updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cx = db(DB_MEM)
    exists = cx.execute("SELECT 1 FROM members WHERE xh=?", (xh,)).fetchone()
    if exists:
        cx.execute("UPDATE members SET " + ",".join("%s=?" % c for c in MEM_COLS if c != "xh") +
                   ",updated=? WHERE xh=?", tuple(vals[c] for c in MEM_COLS if c != "xh") + (vals["updated"], xh))
    else:
        cols = ["xh"] + [c for c in MEM_COLS if c != "xh"] + ["updated"]
        cx.execute("INSERT INTO members (" + ",".join(cols) + ") VALUES (" + ",".join("?" * len(cols)) + ")",
                   (xh,) + tuple(vals[c] for c in MEM_COLS if c != "xh") + (vals["updated"],))
    cx.commit(); cx.close()
    return jsonify({"ok": True})

@app.route("/api/members/<xh>", methods=["DELETE"])
@login_required
def api_members_del(xh):
    cx = db(DB_MEM); cx.execute("DELETE FROM members WHERE xh=?", (xh,)); cx.commit(); cx.close()
    return jsonify({"ok": True})

@app.route("/api/members/import", methods=["POST"])
@login_required
def api_members_import():
    f = request.files.get("file")
    if not f:
        return jsonify({"ok": False, "error": "未收到文件"}), 400
    raw = f.read().decode("utf-8-sig", errors="ignore")
    reader = csv.DictReader(io.StringIO(raw))
    hmap = {"学号": "xh", "姓名": "name", "性别": "gender", "校区": "campus", "学院": "college",
             "专业/班级": "major", "专业班级": "major", "手机号": "phone", "微信": "wechat", "邮箱": "email",
             "角色": "role", "所属部门/团队": "dept", "所属部门团队": "dept", "入团时间": "join_date",
             "届别": "grade", "状态": "status", "特长/经历": "skill", "特长经历": "skill", "备注": "note"}
    n = 0
    cx = db(DB_MEM)
    for row in reader:
        m = {hmap.get(k, k): (v or "").strip() for k, v in row.items() if hmap.get(k, k) in MEM_COLS}
        xh = (m.get("xh") or "").strip()
        if not (xh.isdigit() and len(xh) == 9):
            continue
        vals = {c: m.get(c, "") for c in MEM_COLS if c != "xh"}
        vals["updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if cx.execute("SELECT 1 FROM members WHERE xh=?", (xh,)).fetchone():
            cx.execute("UPDATE members SET " + ",".join("%s=?" % c for c in MEM_COLS if c != "xh") +
                       ",updated=? WHERE xh=?", tuple(vals[c] for c in MEM_COLS if c != "xh") + (vals["updated"], xh))
        else:
            cols = ["xh"] + [c for c in MEM_COLS if c != "xh"] + ["updated"]
            cx.execute("INSERT INTO members (" + ",".join(cols) + ") VALUES (" + ",".join("?" * len(cols)) + ")",
                       (xh,) + tuple(vals[c] for c in MEM_COLS if c != "xh") + (vals["updated"],))
        n += 1
    cx.commit(); cx.close()
    return jsonify({"ok": True, "imported": n})

@app.route("/api/members/export")
@login_required
def api_members_export():
    cx = db(DB_MEM)
    rows = cx.execute("SELECT * FROM members ORDER BY xh").fetchall()
    cx.close()
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=MEM_COLS)
    w.writeheader()
    for r in rows:
        w.writerow({c: r[c] for c in MEM_COLS})
    return Response(buf.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition": "attachment; filename=members.csv"})

# ============ 官网首页（学生端） ============
# =========== 报销子系统（员工式，独立库） ===========
@app.route("/work/reimburse")
@login_required
def reimburse_page():
    return send_file(os.path.join(BASE, "reimburse.html"))

@app.route("/api/reimburse")
@login_required
def api_reimburse():
    mine = request.args.get("mine")
    cx = db(DB_REI)
    if mine:
        rows = cx.execute("SELECT * FROM rei WHERE xh=? ORDER BY id DESC", (session["uid"],)).fetchall()
    else:
        rows = cx.execute("SELECT * FROM rei ORDER BY id DESC").fetchall()
    cx.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/reimburse", methods=["POST"])
@login_required
def api_reimburse_save():
    d = request.get_json(force=True, silent=True) or {}
    title = (d.get("title") or "").strip()
    category = (d.get("category") or "").strip()
    amt = d.get("amount")
    if amt is None or amt == "":
        return jsonify({"ok": False, "error": "金额须为数字"}), 400
    try:
        amt = float(amt)
    except Exception:
        return jsonify({"ok": False, "error": "金额须为数字"}), 400
    if not (title and category and amt > 0):
        return jsonify({"ok": False, "error": "请填写事项、类别与正数金额"}), 400
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cx = db(DB_REI)
    cols = ["xh", "name", "title", "category", "amount", "note", "status", "created", "updated"]
    vals = [session["uid"], session["name"], title, category, amt,
             (d.get("note") or "").strip(), "待审", now, now]
    cx.execute("INSERT INTO rei (" + ",".join(cols) + ") VALUES (" + ",".join("?" * len(cols)) + ")", vals)
    cx.commit(); cx.close()
    return jsonify({"ok": True})

@app.route("/api/reimburse/<int:rid>", methods=["DELETE"])
@login_required
def api_reimburse_del(rid):
    cx = db(DB_REI)
    row = cx.execute("SELECT xh FROM rei WHERE id=?", (rid,)).fetchone()
    if row and (row["xh"] == session["uid"] or session.get("role") in ("主席", "副主席")):
        cx.execute("DELETE FROM rei WHERE id=?", (rid,)); cx.commit()
    cx.close()
    return jsonify({"ok": True})

@app.route("/api/reimburse/<int:rid>/status", methods=["POST"])
@login_required
def api_reimburse_status(rid):
    if session.get("role") not in ("主席", "副主席"):
        return jsonify({"ok": False, "error": "仅主席/副主席可审批"}), 403
    d = request.get_json(force=True, silent=True) or {}
    st = (d.get("status") or "").strip()
    if st not in ("待审", "已通过", "已驳回"):
        return jsonify({"ok": False, "error": "状态非法"}), 400
    cx = db(DB_REI)
    cx.execute("UPDATE rei SET status=?, updated=? WHERE id=?",
               (st, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), rid))
    cx.commit(); cx.close()
    return jsonify({"ok": True})

# =========== 预约子系统（员工式，独立库） ===========
@app.route("/work/reserve")
@login_required
def reserve_page():
    return send_file(os.path.join(BASE, "reserve.html"))

@app.route("/api/reserve")
@login_required
def api_reserve():
    mine = request.args.get("mine")
    cx = db(DB_RES)
    if mine:
        rows = cx.execute("SELECT * FROM resv WHERE xh=? ORDER BY id DESC", (session["uid"],)).fetchall()
    else:
        rows = cx.execute("SELECT * FROM resv ORDER BY id DESC").fetchall()
    cx.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/reserve", methods=["POST"])
@login_required
def api_reserve_save():
    d = request.get_json(force=True, silent=True) or {}
    item = (d.get("item") or "").strip()
    type_ = (d.get("type") or "").strip()
    start = (d.get("start_time") or "").strip()
    end = (d.get("end_time") or "").strip()
    if not (item and type_ and start and end):
        return jsonify({"ok": False, "error": "请填写对象、名称与起止时间"}), 400
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cx = db(DB_RES)
    cols = ["xh", "name", "item", "type", "start_time", "end_time", "purpose", "status", "created", "updated"]
    vals = [session["uid"], session["name"], item, type_, start, end,
            (d.get("purpose") or "").strip(), "待确认", now, now]
    cx.execute("INSERT INTO resv (" + ",".join(cols) + ") VALUES (" + ",".join("?" * len(cols)) + ")", vals)
    cx.commit(); cx.close()
    return jsonify({"ok": True})

@app.route("/api/reserve/<int:rid>", methods=["DELETE"])
@login_required
def api_reserve_del(rid):
    cx = db(DB_RES)
    row = cx.execute("SELECT xh FROM resv WHERE id=?", (rid,)).fetchone()
    if row and (row["xh"] == session["uid"] or session.get("role") in ("主席", "副主席")):
        cx.execute("DELETE FROM resv WHERE id=?", (rid,)); cx.commit()
    cx.close()
    return jsonify({"ok": True})

@app.route("/api/reserve/<int:rid>/status", methods=["POST"])
@login_required
def api_reserve_status(rid):
    if session.get("role") not in ("主席", "副主席"):
        return jsonify({"ok": False, "error": "仅主席/副主席可审批"}), 403
    d = request.get_json(force=True, silent=True) or {}
    st = (d.get("status") or "").strip()
    if st not in ("待确认", "已通过", "已驳回"):
        return jsonify({"ok": False, "error": "状态非法"}), 400
    cx = db(DB_RES)
    cx.execute("UPDATE resv SET status=?, updated=? WHERE id=?",
               (st, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), rid))
    cx.commit(); cx.close()
    return jsonify({"ok": True})

# =========== 活动通报子系统（独立库） ===========
@app.route("/work/bulletin")
@login_required
def bulletin_page():
    return send_file(os.path.join(BASE, "bulletin.html"))

@app.route("/api/bulletin")
@login_required
def api_bulletin():
    cx = db(DB_BUL)
    rows = cx.execute("SELECT * FROM bul ORDER BY pinned DESC, id DESC").fetchall()
    cx.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/bulletin", methods=["POST"])
@login_required
def api_bulletin_save():
    d = request.get_json(force=True, silent=True) or {}
    title = (d.get("title") or "").strip()
    body = (d.get("body") or "").strip()
    level = (d.get("level") or "普通").strip()
    if level not in ("普通", "重要", "紧急"):
        level = "普通"
    if not (title and body):
        return jsonify({"ok": False, "error": "请填写标题与内容"}), 400
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cx = db(DB_BUL)
    cols = ["author", "author_xh", "title", "body", "level", "pinned", "created"]
    vals = [session["name"], session["uid"], title, body, level,
            1 if d.get("pinned") else 0, now]
    cx.execute("INSERT INTO bul (" + ",".join(cols) + ") VALUES (" + ",".join("?" * len(cols)) + ")", vals)
    cx.commit(); cx.close()
    return jsonify({"ok": True})

@app.route("/api/bulletin/<int:bid>", methods=["DELETE"])
@login_required
def api_bulletin_del(bid):
    cx = db(DB_BUL)
    row = cx.execute("SELECT author_xh FROM bul WHERE id=?", (bid,)).fetchone()
    if row and (row["author_xh"] == session["uid"] or session.get("role") in ("主席", "副主席")):
        cx.execute("DELETE FROM bul WHERE id=?", (bid,)); cx.commit()
    cx.close()
    return jsonify({"ok": True})

@app.route("/")
def index():
    return send_file(os.path.join(BASE, "index.html"))

# ============ 启动 ============
init_reg(); init_mem(); init_usr(); init_rei(); init_res(); init_bul(); export_csv()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
