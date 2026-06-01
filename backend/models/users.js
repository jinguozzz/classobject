const fs = require('fs');
const USERS_FILE = __dirname + '/../users.json';

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
module.exports = { loadUsers, saveUsers };