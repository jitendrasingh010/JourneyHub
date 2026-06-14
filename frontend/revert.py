import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if not filepath.endswith('.jsx'): return

    original = content
    
    # Remove imports
    content = re.sub(r"import\s+\{?\s*[^}]*motion[^}]*\}?\s+from\s+['\"]framer-motion['\"];?\n?", "", content)
    content = re.sub(r"import\s+PageWrapper\s+from\s+['\"][^'\"]+PageWrapper['\"];?\n?", "", content)
    content = re.sub(r"import\s+SkeletonLoader\s+from\s+['\"][^'\"]+SkeletonLoader['\"];?\n?", "", content)
    content = re.sub(r"import\s+AnimatedCounter\s+from\s+['\"][^'\"]+AnimatedCounter['\"];?\n?", "", content)
    
    # Let's keep LazyImage because it's part of searching/sorting task potentially, but wait, LazyImage uses framer-motion internally, we need to rewrite LazyImage
    # I'll manually rewrite ConfirmAlert and LazyImage.
    
    # Replace tags
    content = content.replace('<motion.div', '<div')
    content = content.replace('</motion.div>', '</div>')
    content = content.replace('<motion.section', '<section')
    content = content.replace('</motion.section>', '</section>')
    content = content.replace('<motion.button', '<button')
    content = content.replace('</motion.button>', '</button>')
    content = content.replace('<motion.form', '<form')
    content = content.replace('</motion.form>', '</form>')
    content = content.replace('<motion.img', '<img')
    content = content.replace('</motion.img>', '</img>')
    content = content.replace('<AnimatePresence>', '')
    content = content.replace('</AnimatePresence>', '')
    content = content.replace('<AnimatePresence mode="wait">', '')
    
    content = content.replace('<PageWrapper', '<div')
    content = content.replace('</PageWrapper>', '</div>')

    # Remove framer motion props using non-greedy matching
    content = re.sub(r'\s+initial=\{[^}]+\}', '', content)
    content = re.sub(r'\s+animate=\{[^}]+\}', '', content)
    content = re.sub(r'\s+exit=\{[^}]+\}', '', content)
    content = re.sub(r'\s+transition=\{[^}]+\}', '', content)
    content = re.sub(r'\s+variants=\{[^}]+\}', '', content)
    content = re.sub(r'\s+whileHover=\{[^}]+\}', '', content)
    content = re.sub(r'\s+whileTap=\{[^}]+\}', '', content)
    content = re.sub(r'\s+whileInView=\{[^}]+\}', '', content)
    content = re.sub(r'\s+viewport=\{[^}]+\}', '', content)
    
    # SkeletonLoader usage
    content = re.sub(r'<SkeletonLoader[^>]*/>', '<div>Loading...</div>', content)

    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Processed {filepath}")

for root, _, files in os.walk('c:/Users/jitendra singh/OneDrive/Documents/Air_bin/frontend/src'):
    for file in files:
        process_file(os.path.join(root, file))
