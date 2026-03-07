document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;

  if (username === 'admin' && password === 'admin123') {
    window.location.href = 'home.html';
  } else {
    alert('Invalid Username and Password');
  }
});
