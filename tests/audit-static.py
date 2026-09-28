"""Audit all generated HTML and CSS, including fragments and safety boundaries."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re
root=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.links=[];self.ids=set();self.feed(text)
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if 'id' in attrs:self.ids.add(attrs['id'])
  for key in ('href','src','action','poster'):
   if attrs.get(key):self.links.append(attrs[key])
  if attrs.get('srcset'):
   self.links.extend(x.strip().split()[0] for x in attrs['srcset'].split(','))
pages={p:Page(p.read_text()) for p in root.rglob('*.html')};missing=[];count=0
for p,page in pages.items():
 for link in page.links:
  u=urlsplit(link)
  if u.scheme or u.netloc:continue
  target=(p.parent/unquote(u.path)).resolve() if u.path else p
  if not target.is_relative_to(root):missing.append((str(p),link,'outside root'));continue
  count+=1
  if not target.is_file():missing.append((str(p.relative_to(root)),link,'missing file'))
  elif u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:missing.append((str(p.relative_to(root)),link,'missing fragment'))
for p in (root/'assets').glob('*.css'):
 for link in re.findall(r'url\([\'\"]?([^\)\'\"]+)',p.read_text()):
  u=urlsplit(link)
  if u.scheme or u.netloc:continue
  count+=1
  if not (p.parent/unquote(u.path)).is_file():missing.append((p.name,link,'missing css asset'))
for p in list(pages)+list((root/'assets').glob('*.js')):
 text=p.read_text()
 for pattern in (r'<\?php',r'\{\{',r'@(?:csrf|foreach|endif)\b',r'csrf-token',r'127\.0\.0\.1',r'fetch\s*\(',r'XMLHttpRequest',r'localStorage',r'sessionStorage',r'/administrasi/api/',r'/api/students'):
  if re.search(pattern,text):missing.append((str(p.relative_to(root)),pattern,'safety scan'))
print(f'{len(pages)} HTML pages; {count} local targets; {len(missing)} findings')
for item in missing:print(item)
raise SystemExit(bool(missing))
