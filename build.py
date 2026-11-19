"""Builds the hosted site (Netlify runs this on every push) (deploy/index.html) from the artifact source plus the account module.
Run after any change to the artifact:  python3 build.py"""
import sys, pathlib
HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE / 'src' / 'site.html'  # the whole site (also published as the Claude preview artifact)
CFG = {'__SUPABASE_URL__': 'https://bazqlqgoqamqofgzoioq.supabase.co',
       '__SUPABASE_KEY__': 'sb_publishable_Mz5qAsulfYLQQdzHXCTSyA_Yc0WUge4'}  # publishable key: safe to ship
LIB = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.89.0/dist/umd/supabase.js" crossorigin="anonymous"></script>'
s = SRC.read_text(encoding='utf-8')
def rep(a, b):
    global s
    if s.count(a) != 1: sys.exit(f'build: expected one match for {a[:60]!r}, found {s.count(a)}')
    s = s.replace(a, b)
js = (HERE / 'accounts.js').read_text(encoding='utf-8') + '\n' + (HERE / 'accounts-hub.js').read_text(encoding='utf-8') + '\n' + (HERE / 'prep.js').read_text(encoding='utf-8') + '\n' + (HERE / 'medprep.js').read_text(encoding='utf-8') + '\nacctInit();\n' + (HERE / 'news.js').read_text(encoding='utf-8') + '\n'
for k, v in CFG.items(): js = js.replace(k, v)
rep('<link rel="preconnect" href="https://fonts.googleapis.com">', '<link rel="manifest" href="/site.webmanifest">\n<link rel="preconnect" href="https://fonts.googleapis.com">')
rep('</style>\n</head>', (HERE / 'accounts.css').read_text(encoding='utf-8') + (HERE / 'prep.css').read_text(encoding='utf-8') + (HERE / 'medprep.css').read_text(encoding='utf-8') + (HERE / 'news.css').read_text(encoding='utf-8') + '</style>\n' + LIB + '\n</head>')
rep('setNavH();\nalignHours();\nsetIncomeStars();\nbuildNav();\nrender();',
    'setNavH();\nalignHours();\nsetIncomeStars();\nbuildNav();\nrender();\n' + js)
# Wording that changes once accounts exist
rep('Your weights are saved in this browser only.', 'Log in and your weights are saved to your account, so they follow you to any device.')
out = HERE / 'deploy'
out.mkdir(exist_ok=True)
(out / 'index.html').write_text(s, encoding='utf-8')
(out / '_headers').write_text('/*\n  X-Frame-Options: DENY\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n')
import shutil, json
for n in ['og-image.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'favicon-32.png', 'favicon-64.png']:
    shutil.copy(HERE / 'brand' / n, out / n)
(out / 'site.webmanifest').write_text(json.dumps({'name': 'Project Infrared', 'short_name': 'Infrared', 'start_url': '/', 'display': 'standalone',
    'background_color': '#0D0D0F', 'theme_color': '#0D0D0F',
    'icons': [{'src': '/icon-192.png', 'sizes': '192x192', 'type': 'image/png'}, {'src': '/icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any maskable'}]}, indent=2))
# The email function needs the site's page names: write them into the copy-paste version of the function
import subprocess
names = subprocess.run(['node', '-e', '''const fs=require("fs");const s=fs.readFileSync(process.argv[1],"utf8");const a=s.indexOf("const S = [");const b=s.indexOf("\\n];\\n",a);const S=eval(s.slice(a+10,b+3));const o={};for(const x of S){o[x.id]=x.name;(x.subs||[]).forEach((y,i)=>o["sub-"+x.id+"-"+i]=y.name+" ("+x.name+")");}process.stdout.write(JSON.stringify(o));''', str(SRC)], capture_output=True, text=True, check=True).stdout
(out / 'names.json').write_text(names, encoding='utf-8')  # page names for the email functions
for fname, outname in [('notify', 'notify-function.txt'), ('news-publish', 'news-publish-function.txt')]:
    (HERE / 'emails' / outname).write_text((HERE / 'emails' / fname / 'index.ts').read_text(encoding='utf-8'), encoding='utf-8')
print('built', out / 'index.html', len(s))

# Which commit this build came from (projectinfrared.org/version.txt), to confirm Netlify deploys pushes
try:
    sha = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True, cwd=HERE).stdout.strip()
except Exception:
    sha = ''
(out / 'version.txt').write_text((sha or 'unknown') + '\n', encoding='utf-8')
