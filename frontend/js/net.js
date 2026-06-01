// 和后端通信的fetch封装
function apiRegister(username, password) {
  return fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  }).then(res => res.json());
}
function apiLogin(username, password) {
  return fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  }).then(res => res.json());
}
function apiScore(username, score) {
  return fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, score })
  }).then(res => res.json());
}
function apiBuySkill(username, cost) {
  return fetch('/api/buy-skill', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, cost })
  }).then(res => res.json());
}
function apiRank() {
  return fetch('/api/rank').then(res => res.json());
}