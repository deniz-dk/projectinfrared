# Inserts quiz.css / quiz.js into the artifact source (re-runnable).
import re, pathlib
P = pathlib.Path('/mnt/user-data/outputs/artifacts/3d60e111-8967-4ad7-a13e-1eb2f3ee17f9/index.html')
s = P.read_text()
css = pathlib.Path(__file__).with_name('quiz.css').read_text()
js = pathlib.Path(__file__).with_name('quiz.js').read_text()
def put(s, start, end, body, anchor):
    if start in s:
        a = s.index(start); b = s.index(end) + len(end)
        return s[:a] + start + '\n' + body + '\n' + end + s[b:]
    i = s.index(anchor)
    return s[:i] + start + '\n' + body + '\n' + end + '\n' + s[i:]
s = put(s, '/* QUIZ-CSS-START */', '/* QUIZ-CSS-END */', css, '</style>')
s = put(s, '/* QUIZ-JS-START */', '/* QUIZ-JS-END */', js, 'function renderHome() {')
# route
r = '  if (id === "tiers") renderTiers();'
if 'id === "quiz"' not in s:
    s = s.replace(r, '  if (id === "quiz") renderQuiz();\n  else if (id === "tiers") renderTiers();', 1)
# home tools card
card = '<a class="gc cmpcard qzcardlink" href="#quiz">${ico("compass")}<b>Specialty match quiz</b><span>46 questions about how you think and work. Get your top five specialty matches, with the best-fit fellowship in each.</span></a>'
if 'qzcardlink' not in s:
    s = s.replace('<div class="grid-cards toolcards">', '<div class="grid-cards toolcards">' + card, 1)
    s = s.replace('<h2>Tools</h2><p class="note">Line specialties up against each other, or re-rank them by what matters most to you.</p>', '<h2>Tools</h2><p class="note">Find the specialties that fit you, line them up against each other, or re-rank them by what matters most to you.</p>', 1)
if 'Specialty match quiz:' not in s:
    s = s.replace('const PATCH_NEW = [', 'const PATCH_NEW = ["Specialty match quiz: your top five matches, why they fit, and your best-fit fellowship", ', 1)
P.write_text(s)
print('ok', s.count('QUIZ-JS-START'), 'quiz' in s)
