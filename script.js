// ===== script.js (full ready-to-use with username uniqueness check + hide header on scroll) =====

// --- Supabase client ---
const SUPABASE_URL = "https://foudnjdfoszymjlteekd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdWRuamRmb3N6eW1qbHRlZWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MTY4MzcsImV4cCI6MjA3NTk5MjgzN30.Xjunq5WE57yPiJF7s_jK-9ETOnsyNMHJsR41xJ2ZVGg";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// IIFE to avoid polluting global scope
(function () {
  // --- Helpers for modal ---
  function openAuth() {
    const authModal = document.getElementById("authModal");
    if (authModal) {
      authModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden"; // prevent background scroll
    }
  }

  function closeAuthModal() {
    const authModal = document.getElementById("authModal");
    if (authModal) {
      authModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = ""; // restore scroll
    }
  }

  // --- Dashboard & User UI functions ---
  function setupUserMenu(currentUser) {
    const loginBtn = document.getElementById("loginBtn");
    const userMenu = document.getElementById("userMenu");
    const userIcon = document.getElementById("userIcon");
    const userDropdown = document.getElementById("userDropdown");
    const userNameDisplay = document.getElementById("userNameDisplay");
    const logoutBtn = document.getElementById("logoutBtn");
    const openDashboard = document.getElementById("openDashboard");

    if (!loginBtn || !userMenu) return;

    // close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!userMenu.contains(e.target)) userDropdown.style.display = "none";
    });

    if (!currentUser) {
      loginBtn.style.display = "inline-block";
      userMenu.style.display = "none";
      return;
    }

    loginBtn.style.display = "none";
    userMenu.style.display = "flex";
    userNameDisplay.textContent = currentUser.name || currentUser.email || "User";

    userIcon.addEventListener("click", () => {
      userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
    });

    logoutBtn.addEventListener("click", async () => {
      await client.auth.signOut();
      localStorage.removeItem("hok_current");
      userDropdown.style.display = "none";
      location.reload();
    });

    openDashboard.addEventListener("click", () => {
      userDropdown.style.display = "none";
      showDashboardOverlay(currentUser);
    });
  }

  function showDashboardOverlay(currentUser) {
    const overlay = document.getElementById("dashboardOverlay");
    if (!overlay) return;
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden"; // lock scroll when dashboard open
    document.getElementById("dashUserName").textContent = currentUser.name || "";
    document.getElementById("dashUserEmail").textContent = currentUser.email || "";

    // Tickets
    const tickets = JSON.parse(localStorage.getItem("hok_tickets") || "[]").filter(
      (t) => t.owner?.email === currentUser.email
    );
    const dashTicketGrid = document.getElementById("dashTicketGrid");
    dashTicketGrid.innerHTML =
      tickets.length === 0
        ? "<p>You have no tickets yet.</p>"
        : tickets
            .map(
              (t) => `
          <div class="ticket-card">
            <h3>${t.tier} Ticket</h3>
            <p>Date: ${new Date(t.date).toLocaleDateString()}</p>
            <p>ID: ${t.id}</p>
          </div>`
            )
            .join("");

    // Events
    const events = [
      { name: "Deep House Night", date: "2025-12-01", description: "A night of deep house with top DJs." },
      { name: "Afro Tech Special", date: "2026-01-15", description: "Afro tech vibes all night long." }
    ];
    const dashEventsGrid = document.getElementById("dashEventsGrid");
    dashEventsGrid.innerHTML = events
      .map(
        (e) => `
      <div class="card ticket-card">
        <h3>${e.name}</h3>
        <p>${new Date(e.date).toLocaleDateString()}</p>
        <p>${e.description}</p>
      </div>`
      )
      .join("");

    const closeBtn = document.getElementById("closeDashboard");
    closeBtn.addEventListener("click", () => {
      overlay.style.display = "none";
      document.body.style.overflow = ""; // restore scroll
    });
  }

  function showDashboard() {
    const currentUser = JSON.parse(localStorage.getItem("hok_current") || "null");
    setupUserMenu(currentUser);
  }

  // --- DOMContentLoaded ---
  document.addEventListener("DOMContentLoaded", () => {
    // Footer year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // nav toggle
    const navToggle = document.getElementById("navToggle");
    const mainNav = document.getElementById("mainNav");
    if (navToggle && mainNav) {
      navToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
    }

    // close nav when link clicked
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => { if (mainNav) mainNav.classList.remove("open"); });
    });

    // auth modal controls
    const loginBtn = document.getElementById("loginBtn");
    const closeAuth = document.getElementById("closeAuth");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const showSignup = document.getElementById("showSignup");
    const showLogin = document.getElementById("showLogin");

    if (loginBtn) loginBtn.addEventListener("click", openAuth);
    if (closeAuth) closeAuth.addEventListener("click", closeAuthModal);

    if (showSignup) showSignup.addEventListener("click", () => {
      if (loginForm) loginForm.classList.add("hidden");
      if (signupForm) signupForm.classList.remove("hidden");
    });
    if (showLogin) showLogin.addEventListener("click", () => {
      if (signupForm) signupForm.classList.add("hidden");
      if (loginForm) loginForm.classList.remove("hidden");
    });

    // --- Signup handler with username uniqueness check ---
    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const firstName = document.getElementById("signupFirstName").value.trim();
        const lastName = document.getElementById("signupLastName").value.trim();
        const username = document.getElementById("signupUsername").value.trim().toLowerCase();
        const dob = document.getElementById("signupDob").value.trim();
        const phone = document.getElementById("signupPhone").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;
        const confirm = document.getElementById("signupPasswordConfirm").value;

        if (!firstName || !lastName || !username || !dob || !phone || !email || !password) {
          return alert("Please fill out all required fields.");
        }
        if (password !== confirm) return alert("Passwords do not match.");

        try {
          // Check username uniqueness in Supabase
          const { data: existingUser, error: checkError } = await client
            .from("profiles")
            .select("username")
            .eq("username", username)
            .maybeSingle();

          if (checkError) return alert("Error checking username. Try again.");
          if (existingUser) return alert("That username is already taken. Choose another.");

          // Create user in Supabase Auth
          const { data, error } = await client.auth.signUp({
            email, password,
            options: { data: { first_name: firstName, last_name: lastName, username, dob, phone } }
          });

          if (error) return alert(error.message || "Signup failed.");

          // Insert profile record
          if (data.user) {
            const { error: insertError } = await client.from("profiles").insert({
              id: data.user.id, username, first_name: firstName, last_name: lastName, dob, phone
            });
            if (insertError) console.error("Profile insert error:", insertError);
          }

          alert("Signup successful! Check your email to confirm.");
        } catch (err) {
          console.error("Unexpected error:", err);
          alert("Something went wrong during signup.");
        }
      });
    }

    // --- Login handler ---
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) return alert("Email and password required.");

        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) return alert(error.message || "Login failed.");

        const meta = data.user.user_metadata || {};
        const current = {
          email: data.user.email,
          name: (meta.first_name ? meta.first_name + (meta.last_name ? " " + meta.last_name : "") : meta.name) || data.user.email,
          username: meta.username || null
        };
        localStorage.setItem("hok_current", JSON.stringify(current));
        alert("Logged in successfully!");
        closeAuthModal();
        showDashboard();
        setupUserMenu(current);
      });
    }

    // --- Slideshow ---
    let slideIndex = 0;
    const slides = document.querySelectorAll(".slides");
    const dots = document.querySelectorAll(".dot");

    function showSlide(n) {
      if (!slides.length) return;
      slides.forEach((slide, i) => {
        slide.classList.remove("active");
        if (dots[i]) dots[i].classList.remove("active-dot");
      });
      slides[n].classList.add("active");
      if (dots[n]) dots[n].classList.add("active-dot");
    }

    function nextSlide() {
      slideIndex = (slideIndex + 1) % slides.length;
      showSlide(slideIndex);
    }
    function prevSlide() {
      slideIndex = (slideIndex - 1 + slides.length) % slides.length;
      showSlide(slideIndex);
    }

    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");
    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);
    dots.forEach((dot, idx) => dot.addEventListener("click", () => { slideIndex = idx; showSlide(slideIndex); }));

    if (slides.length) { showSlide(slideIndex); setInterval(nextSlide, 5000); }

    // --- Floating ticket button ---
    const floating = document.querySelector(".floating-ticket-btn");
    if (floating) floating.addEventListener("click", (e) => {});

    // --- Hide header on scroll ---
    const header = document.querySelector(".header");
    let lastScroll = 0;
    if (header) {
      window.addEventListener("scroll", () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll <= 0) {
          header.style.transform = "translateY(0)";
          return;
        }
        if (currentScroll > lastScroll) {
          header.style.transform = "translateY(-100%)"; // hide
          header.style.transition = "transform 0.3s ease";
        } else {
          header.style.transform = "translateY(0)"; // show
          header.style.transition = "transform 0.3s ease";
        }
        lastScroll = currentScroll;
      });
    }

    // initialize dashboard/user UI
    showDashboard();
  });

  // --- Supabase auth state change ---
  client.auth.onAuthStateChange((event, session) => {
    if (session && session.user) {
      const meta = session.user.user_metadata || {};
      const current = {
        email: session.user.email,
        name: (meta.first_name ? meta.first_name + (meta.last_name ? " " + meta.last_name : "") : meta.name) || session.user.email,
        username: meta.username || null
      };
      localStorage.setItem("hok_current", JSON.stringify(current));
      showDashboard();
      setupUserMenu(current);
    } else {
      localStorage.removeItem("hok_current");
      showDashboard();
    }
  });

  document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  const data = { name, email, message };

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbwspshVHgRHwVX2nokmDfDloV1hT5MAcJun9wO_87LxO3pTdHD6Ue-GVpeUr54oAENJgw/exec", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    if (result.status === "success") {
      alert("✅ Message sent successfully!");
      e.target.reset();
    } else {
      alert("❌ Something went wrong. Please try again.");
    }
  } catch (error) {
    console.error(error);
    alert("⚠️ Could not send message. Please check your internet connection.");
  }
});


})();
