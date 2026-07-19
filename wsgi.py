# PythonAnywhere WSGI 配置
# 把本文件内容粘贴到 PythonAnywhere 的 Web 标签里的 WSGI 配置文件
# （路径类似 /var/www/你的用户名_pythonanywhere_com_wsgi.py）
# 并将下面的 path 改成你的实际目录：/home/你的用户名/mysite

import sys
import os

# ===== 改成你的实际路径 =====
path = '/home/你的用户名/mysite'
# ============================

if path not in sys.path:
    sys.path.insert(0, path)

# 确保依赖装在该虚拟环境
from app import app as application
