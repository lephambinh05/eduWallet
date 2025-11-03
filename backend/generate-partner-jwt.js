const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'eduwallet_super_secret_jwt_key_2024';

function generateToken(userId) {
  return jwt.sign({ id: userId }, secret, {
    expiresIn: '30d'
  });
}

console.log('Web2 (Quiz) JWT:', generateToken('6902fb28137fbb370d9a8646'));
console.log('Web3 (Hybrid) JWT:', generateToken('6902fb28137fbb370d9a864a'));
