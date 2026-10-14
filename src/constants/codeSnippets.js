/**
 * Curated Code Snippets for Pawtap Custom Mode
 * Realistic, idiomatic programming syntax across popular languages.
 */

export const CODE_SNIPPETS = [
  {
    id: 'js_array',
    name: 'JavaScript • Array Pipeline',
    lang: 'javascript',
    text: `const activeUsers = users.filter(user => user.isActive && user.age >= 18).map(user => ({ id: user.id, name: user.name, score: user.points * 1.5 })).sort((a, b) => b.score - a.score);`
  },
  {
    id: 'js_async',
    name: 'JavaScript • Async Fetch',
    lang: 'javascript',
    text: `async function fetchUserData(endpoint, options = {}) { try { const res = await fetch(endpoint, { headers: { 'Content-Type': 'application/json' }, ...options }); if (!res.ok) throw new Error(\`HTTP \${res.status}\`); return await res.json(); } catch (err) { console.error('Fetch error:', err.message); return null; } }`
  },
  {
    id: 'python_comprehension',
    name: 'Python • Comprehensions & Lambdas',
    lang: 'python',
    text: `squares = [x ** 2 for x in range(25) if x % 2 == 0] matrix = [[row * col for col in range(1, 6)] for row in range(1, 6)] sorted_items = sorted(matrix, key=lambda r: sum(r), reverse=True)`
  },
  {
    id: 'python_class',
    name: 'Python • Dataclass & Handler',
    lang: 'python',
    text: `from dataclasses import dataclass, field from typing import Optional @dataclass class UserProfile: username: str email: str is_premium: bool = False login_count: int = 0 def increment_logins(self) -> None: self.login_count += 1`
  },
  {
    id: 'html_layout',
    name: 'HTML • Semantic Component',
    lang: 'html',
    text: `<header class="site-header"><nav class="navigation" aria-label="Main menu"><a href="/" class="brand-logo">pawtap</a><ul class="nav-links"><li><a href="#explore">Explore</a></li><li><a href="#stats">Leaderboard</a></li></ul></nav></header>`
  },
  {
    id: 'css_flexbox',
    name: 'CSS • Modern Glassmorphism',
    lang: 'css',
    text: `.card { display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 16px; padding: 24px; border-radius: 16px; background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); }`
  }
];

export const DEFAULT_CUSTOM_TEXT = `In a quiet corner of the city, rain taps softly against the glass while warm amber light fills the room. A fresh cup of coffee steams beside the keyboard as peaceful thoughts flow smoothly into words. Take a deep breath and type gently.`;
