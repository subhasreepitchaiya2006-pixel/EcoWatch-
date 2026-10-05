const bcrypt = require('bcryptjs');

const passList = ['admin123', 'analyst123', 'responder123', 'scientist123', 'inspector123'];
passList.forEach(p => {
  const hash = bcrypt.hashSync(p, 10);
  const ok = bcrypt.compareSync(p, hash);
  console.log(p, hash, ok ? 'VERIFIED' : 'FAILED');
});
