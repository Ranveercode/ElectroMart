const fs = require('fs');
const files = ['App.jsx', 'pages/UserList.jsx', 'pages/ProductList.jsx', 'pages/ProductEdit.jsx', 'pages/OrderList.jsx'];
files.forEach(f => {
  const path = 'admin/frontend/src/' + f;
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/const API = .*/g, 'const API = "https://electro-mart-qalg.vercel.app";');
  fs.writeFileSync(path, content);
});
