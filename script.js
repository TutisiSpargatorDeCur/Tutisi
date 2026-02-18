diff --git a/script.js b/script.js
index e4320626d50f4b092dc8cc4aa22ca93192947a65..0c766684155ee199edda9453729fbdab27ce505b 100644
--- a/script.js
+++ b/script.js
@@ -1,34 +1,219 @@
-// INTRO ANIMATION
-gsap.from("#intro h1", {
-  opacity: 0,
-  scale: 0.8,
-  duration: 1
-});
-
-gsap.from("#intro p", {
-  opacity: 0,
-  delay: 0.5
-});
-
-gsap.to("#intro", {
-  opacity: 0,
-  delay: 2,
-  duration: 1,
-  onComplete: () => {
-    document.getElementById("intro").style.display = "none";
-    gsap.to("#main", { opacity: 1 });
-  }
-});
-
-// LANGUAGE SWITCH
-let currentLang = "ro";
-const toggle = document.getElementById("langToggle");
-
-toggle.addEventListener("click", () => {
-  currentLang = currentLang === "ro" ? "en" : "ro";
-  toggle.innerText = currentLang === "ro" ? "EN" : "RO";
-
-  document.querySelectorAll("[data-ro]").forEach(el => {
-    el.innerText = el.dataset[currentLang];
-  });
-});
+const SHIPPING_FEE = 5;
+
+const albums = [
+  {
+    id: "tutisi-records",
+    name: "Tutisi Records",
+    photo: "TutisiRecords",
+    price: 15,
+  },
+  {
+    id: "oribil",
+    name: "Oribil",
+    photo: "Oribil",
+    price: 17,
+  },
+];
+
+const state = {
+  cart: {},
+};
+
+const refs = {
+  screens: {
+    store: document.getElementById("storeScreen"),
+    cart: document.getElementById("cartScreen"),
+    checkout: document.getElementById("checkoutScreen"),
+  },
+  albumList: document.getElementById("albumList"),
+  openCartBtn: document.getElementById("openCartBtn"),
+  cartCount: document.getElementById("cartCount"),
+  cartRows: document.getElementById("cartRows"),
+  cartEmpty: document.getElementById("cartEmpty"),
+  subtotal: document.getElementById("subtotal"),
+  shipping: document.getElementById("shipping"),
+  total: document.getElementById("total"),
+  goCheckoutBtn: document.getElementById("goCheckoutBtn"),
+  checkoutForm: document.getElementById("checkoutForm"),
+  checkoutMessage: document.getElementById("checkoutMessage"),
+};
+
+function money(value) {
+  return `€${value.toFixed(2)}`;
+}
+
+function getAlbumById(id) {
+  return albums.find((album) => album.id === id);
+}
+
+function cartItemsCount() {
+  return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
+}
+
+function cartSubtotal() {
+  return Object.entries(state.cart).reduce((sum, [id, qty]) => {
+    const album = getAlbumById(id);
+    if (!album) return sum;
+    return sum + album.price * qty;
+  }, 0);
+}
+
+function setScreen(screenName) {
+  Object.entries(refs.screens).forEach(([name, node]) => {
+    const active = name === screenName;
+    node.classList.toggle("active", active);
+    node.setAttribute("aria-hidden", String(!active));
+  });
+}
+
+function renderAlbums() {
+  refs.albumList.innerHTML = "";
+
+  albums.forEach((album) => {
+    const card = document.createElement("article");
+    card.className = "album-card";
+    card.innerHTML = `
+      <img class="album-cover" src="${album.photo}.jpg" alt="${album.name}" loading="lazy">
+      <div class="album-body">
+        <h3 class="album-title">${album.name}</h3>
+        <p class="album-price">${money(album.price)}</p>
+        <button class="solid-btn" data-add="${album.id}">Add to cart</button>
+      </div>
+    `;
+
+    const image = card.querySelector("img");
+    image.addEventListener("error", () => {
+      image.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'><rect width='100%' height='100%' fill='#1a1c22'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#d9d9da' font-family='Arial' font-size='40'>${album.name}</text></svg>`)}`;
+    });
+
+    refs.albumList.appendChild(card);
+  });
+}
+
+function renderCart() {
+  refs.cartRows.innerHTML = "";
+  const entries = Object.entries(state.cart).filter(([, qty]) => qty > 0);
+  refs.cartEmpty.style.display = entries.length ? "none" : "block";
+
+  entries.forEach(([id, qty]) => {
+    const album = getAlbumById(id);
+    if (!album) return;
+
+    const row = document.createElement("div");
+    row.className = "cart-row";
+    row.innerHTML = `
+      <img src="${album.photo}.jpg" alt="${album.name}">
+      <div>
+        <h4 class="cart-name">${album.name}</h4>
+        <p class="cart-price">${money(album.price)} each</p>
+        <div class="qty-wrap">
+          <button class="qty-btn" data-down="${album.id}" aria-label="Decrease quantity">−</button>
+          <span>${qty}</span>
+          <button class="qty-btn" data-up="${album.id}" aria-label="Increase quantity">+</button>
+        </div>
+      </div>
+      <button class="remove-btn" data-remove="${album.id}">Delete</button>
+    `;
+
+    const rowImage = row.querySelector("img");
+    rowImage.addEventListener("error", () => {
+      rowImage.src = `data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='100%' height='100%' fill='#22262f'/></svg>")}`;
+    });
+
+    refs.cartRows.appendChild(row);
+  });
+
+  const subtotal = cartSubtotal();
+  const shipping = subtotal > 0 ? SHIPPING_FEE : 0;
+  const total = subtotal + shipping;
+
+  refs.subtotal.textContent = money(subtotal);
+  refs.shipping.textContent = money(shipping);
+  refs.total.textContent = money(total);
+  refs.goCheckoutBtn.disabled = subtotal === 0;
+  refs.cartCount.textContent = String(cartItemsCount());
+}
+
+function addAlbum(id) {
+  state.cart[id] = (state.cart[id] || 0) + 1;
+  renderCart();
+}
+
+function changeQuantity(id, amount) {
+  if (!state.cart[id]) return;
+
+  state.cart[id] += amount;
+  if (state.cart[id] <= 0) {
+    delete state.cart[id];
+  }
+
+  renderCart();
+}
+
+function removeAlbum(id) {
+  delete state.cart[id];
+  renderCart();
+}
+
+function wireEvents() {
+  refs.albumList.addEventListener("click", (event) => {
+    const target = event.target;
+    if (!(target instanceof HTMLElement)) return;
+
+    const albumId = target.dataset.add;
+    if (albumId) {
+      addAlbum(albumId);
+    }
+  });
+
+  refs.openCartBtn.addEventListener("click", () => {
+    setScreen("cart");
+  });
+
+  document.querySelectorAll("[data-go]").forEach((btn) => {
+    btn.addEventListener("click", () => {
+      const destination = btn.getAttribute("data-go");
+      if (destination === "store" || destination === "cart") {
+        setScreen(destination);
+      }
+    });
+  });
+
+  refs.cartRows.addEventListener("click", (event) => {
+    const target = event.target;
+    if (!(target instanceof HTMLElement)) return;
+
+    if (target.dataset.up) {
+      changeQuantity(target.dataset.up, 1);
+    }
+
+    if (target.dataset.down) {
+      changeQuantity(target.dataset.down, -1);
+    }
+
+    if (target.dataset.remove) {
+      removeAlbum(target.dataset.remove);
+    }
+  });
+
+  refs.goCheckoutBtn.addEventListener("click", () => {
+    setScreen("checkout");
+  });
+
+  refs.checkoutForm.addEventListener("submit", (event) => {
+    event.preventDefault();
+
+    const formData = new FormData(refs.checkoutForm);
+    const name = String(formData.get("fullName") || "").trim() || "client";
+
+    refs.checkoutMessage.textContent = `Thank you, ${name}! Your order was placed.`;
+    state.cart = {};
+    refs.checkoutForm.reset();
+    renderCart();
+  });
+}
+
+renderAlbums();
+wireEvents();
+renderCart();
+setScreen("store");
