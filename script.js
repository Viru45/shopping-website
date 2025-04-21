document.addEventListener("DOMContentLoaded", () => {
  // ===== Signup and Login Logic =====
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirm = document.getElementById("confirm").value;
      const errorMsg = document.getElementById("error-msg");

      if (password !== confirm) {
        errorMsg.textContent = "Passwords do not match.";
        return;
      }

      if (password.length < 6) {
        errorMsg.textContent = "Password must be at least 6 characters.";
        return;
      }

      try {
        const res = await fetch("http://localhost:3030/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        

        const data = await res.json();

        if (!res.ok) {
          errorMsg.textContent = data.message || "Signup failed.";
        } else {
          alert(data.message);
          localStorage.setItem("loggedIn", "true");
          window.location.href = "index.html"; // redirect to homepage
        }
      } catch (err) {
        errorMsg.textContent = "Network or server error.";
      }
    });
  }

  // ===== Add to Cart Buttons =====
  const cartButtons = document.querySelectorAll(".add-to-cart");
  cartButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const product = btn.getAttribute("data-name");
      addToCart(product);
    });
  });

  // ===== Start Shopping scroll =====
  const scrollBtn = document.getElementById("startShopping");
  if (scrollBtn) {
    scrollBtn.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
    });
  }

  updateCartBadge(); // Show cart count on every load
  displayCart();     // If cart list is present, display items
});

// ====== Auth Guard =====
function checkAuth() {
  if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "signup.html";
  }
}

// ===== Logout =====
function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("cart");
  window.location.href = "signup.html";
}

// ===== Cart Functions =====
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};
  cart[product] = (cart[product] || 0) + 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = totalItems;
}

function displayCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  const cartList = document.getElementById("cart-list");

  if (!cartList) return;

  cartList.innerHTML = "";
  if (Object.keys(cart).length === 0) {
    cartList.innerHTML = `<li class="list-group-item">Your cart is empty.</li>`;
    return;
  }

  for (const [product, qty] of Object.entries(cart)) {
    const item = document.createElement("li");
    item.className = "list-group-item d-flex justify-content-between align-items-center";
    item.textContent = product;

    const badge = document.createElement("span");
    badge.className = "badge bg-primary rounded-pill";
    badge.textContent = qty;

    item.appendChild(badge);
    cartList.appendChild(item);
  }
}

function clearCart() {
  localStorage.removeItem("cart");
  displayCart();
  updateCartBadge();
}

function placeOrder() {
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  if (Object.keys(cart).length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const billSection = document.getElementById("bill-section");
  const billList = document.getElementById("bill-items");
  const billTotal = document.getElementById("bill-total");

  billList.innerHTML = "";
  let total = 0;

  for (const [name, qty] of Object.entries(cart)) {
    const price = getProductPrice(name);
    const subtotal = price * qty;
    total += subtotal;

    const item = document.createElement("li");
    item.className = "list-group-item d-flex justify-content-between align-items-center";
    item.textContent = `${name} (x${qty})`;

    const priceTag = document.createElement("span");
    priceTag.className = "badge bg-primary rounded-pill";
    priceTag.textContent = `$${subtotal.toFixed(2)}`;

    item.appendChild(priceTag);
    billList.appendChild(item);
  }

  billTotal.textContent = total.toFixed(2);
  billSection.style.display = "block";

  localStorage.removeItem("cart");
  updateCartBadge();
  displayCart();
}

function getProductPrice(name) {
  const prices = {
    "Product One": 29.99,
    "Product Two": 49.99,
    "Product Three": 19.99,
  };
  return prices[name] || 0;
}
