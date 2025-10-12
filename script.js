// Basic front-end interactions: nav toggle, modal auth, ticket flow, forms

document.addEventListener('DOMContentLoaded', ()=>{
  // year
  document.getElementById('year').textContent = new Date().getFullYear();

  // nav toggle
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', ()=>{
    mainNav.style.display = mainNav.style.display === 'flex' ? 'none' : 'flex';
  });

  // Auth modal
  const authModal = document.getElementById('authModal');
  const loginBtn = document.getElementById('loginBtn');
  const closeAuth = document.getElementById('closeAuth');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const showSignup = document.getElementById('showSignup');
  const showLogin = document.getElementById('showLogin');

  function openAuth(){ authModal.setAttribute('aria-hidden','false'); }
  function closeAuthModal(){ authModal.setAttribute('aria-hidden','true'); }

  loginBtn.addEventListener('click', openAuth);
  closeAuth.addEventListener('click', closeAuthModal);

  showSignup && showSignup.addEventListener('click', ()=>{ loginForm.classList.add('hidden'); signupForm.classList.remove('hidden'); });
  showLogin && showLogin.addEventListener('click', ()=>{ signupForm.classList.add('hidden'); loginForm.classList.remove('hidden'); });

  // Simple front-end auth (demo only) - stores user in localStorage
  signupForm && signupForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    if(!email || !password) return alert('Enter valid email and password');
    const users = JSON.parse(localStorage.getItem('hok_users')||'[]');
    if(users.find(u=>u.email===email)) return alert('Account already exists.');
    users.push({name,email,password});
    localStorage.setItem('hok_users', JSON.stringify(users));
    alert('Account created. You can now log in.');
    signupForm.reset();
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  });

  loginForm && loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('hok_users')||'[]');
    const user = users.find(u=>u.email===email && u.password===password);
    if(!user) return alert('Invalid credentials.');
    localStorage.setItem('hok_current', JSON.stringify({email:user.email,name:user.name}));
    alert('Logged in as '+user.name);
    closeAuthModal();
  });

  // Tickets buttons - simulate checkout
  document.querySelectorAll('[data-tier]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const tier = btn.dataset.tier;
      const confirmed = confirm(`Buy ${tier} ticket? (Demo: no payment gateway connected)`);
      if(!confirmed) return;
      // create a simple ticket object and save to localStorage
      const tickets = JSON.parse(localStorage.getItem('hok_tickets')||'[]');
      const ticket = {id:Date.now(),tier,owner:JSON.parse(localStorage.getItem('hok_current')||'null')||null,date:new Date().toISOString()};
      tickets.push(ticket);
      localStorage.setItem('hok_tickets', JSON.stringify(tickets));
      alert('Ticket purchased! Check your profile (demo).');
    });
  });

  // contact form
  const contactForm = document.getElementById('contactForm');
  contactForm && contactForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    // demo: store message locally and pretend to send
    const messages = JSON.parse(localStorage.getItem('hok_messages')||'[]');
    messages.push({id:Date.now(),name,email,message});
    localStorage.setItem('hok_messages', JSON.stringify(messages));
    alert('Message sent. We will respond to '+email);
    contactForm.reset();
  });

  // newsletter
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm && newsletterForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    const subs = JSON.parse(localStorage.getItem('hok_news')||'[]');
    if(subs.includes(email)) return alert('Already subscribed');
    subs.push(email);
    localStorage.setItem('hok_news', JSON.stringify(subs));
    alert('Subscribed!');
    newsletterForm.reset();
  });

});
