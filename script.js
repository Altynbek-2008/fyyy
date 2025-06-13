document.addEventListener("DOMContentLoaded", function () {
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeBtn = document.getElementById("closeBtn");

  burger.addEventListener("click", function () {
    mobileMenu.style.right = "0";
    burger.style.display = "none"; // Бургерді жасыру
  });

  closeBtn.addEventListener("click", function () {
    mobileMenu.style.right = "-100%";
    burger.style.display = "block"; // Бургерді қайта шығару
  });
});








function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(item, quantity) {
  let cart = getCart();
  const index = cart.findIndex(i => i.id === item.id);

  if (index !== -1) {
    cart[index].quantity += quantity;
  } else {
    cart.push({ ...item, quantity });
  }

  saveCart(cart);
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
}

function updateCartItemQuantity(id, quantity) {
  const cart = getCart();
  const index = cart.findIndex(i => i.id === id);
  if (index !== -1) {
    cart[index].quantity = quantity;
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      saveCart(cart);
    }
  }
}



// ================= Слайд мәтіндері =================
const headings = [
  "Why is the JIHC College canteen so great?",
  "Where do our snacks come from?",
  "How expensive is the JIHC College canteen?"
];

const descriptions = [
  `Because here, you can find sweet, sour, spicy, and even icy cold drinks – all in one place!
Feeling hungry? Don’t worry – our canteen has special snacks made just for you.
It’s more than just food – it’s your favorite corner of comfort at JIHC College!`,
  `All our food, drinks, and snacks at the JIHC College canteen are 100% halal, carefully checked, and certified.
Every item has been tested and approved for safety and quality.
You can enjoy your meals with confidence – no worries, just great taste!`,
  `They match the prices of outside stores, so there’s no big difference.
Since the canteen is right inside the college, you don’t need to waste time going out — everything is nearby and easy to access!`
];

let index = 0;

function changeContent(direction) {
  index = (index + direction + headings.length) % headings.length;
  document.getElementById('heading').innerHTML = headings[index];
  document.getElementById('description').innerHTML = descriptions[index].replace(/\n/g, '<br>');
  updateDots();
}

function updateDots() {
  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// Dot-ты басқанда слайдты өзгерту
const dots = document.querySelectorAll('.dot');
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    index = i;
    document.getElementById('heading').innerHTML = headings[index];
    document.getElementById('description').innerHTML = descriptions[index].replace(/\n/g, '<br>');
    updateDots();
  });
});


// ================= Google Sheets-тан карталар =================
let allData = [];
let filteredData = [];
let currentColumn = 0;
const visibleColumns = 5; // бір қатарда қанша карточка көрінеді

async function fetchCanteenData() {
  const url = 'https://script.google.com/macros/s/AKfycbwBGah63VH12rlcASq_VgN-c73H3HzlD3SWz4B2uatNosRhfuibmjAD4JGWSlyp_HxbGw/exec';

  try {
    const response = await fetch(url);
    const data = await response.json();
    allData = data;

    // Алғашқы категория - sweets
    filterCategory('sweets');
    renderBakeryOnly(data);
  } catch (error) {
    console.error("Қате:", error);
  }
}

function filterCategory(category, event) {
  currentColumn = 0;
  filteredData = allData.filter(item => item.category === category);
  renderCards();

  // Батырмалар үшін визуалды белгілеу
  document.querySelectorAll('.buttons button').forEach(btn => btn.classList.remove('active'));
  if (event) event.target.classList.add('active');
}


function renderCards() {
  const container = document.getElementById("cards");
  container.innerHTML = "";

  const cardsToShow = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < visibleColumns; col++) {
      const index = (currentColumn + col) + row * visibleColumns;
      if (index < filteredData.length) {
        cardsToShow.push(filteredData[index]);
      }
    }
  }

  cardsToShow.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "card";

    // Әр карточкаға арналған санды сақтау
    let quantity = 0;

    card.innerHTML = `
      ${item.image ? `<img src="${item.image}" alt="${item.title}">` : `<div class="no-image">No image</div>`}
      <div class="myidea">
      <div class="quantity-controls">
        <h4 class="decrease">-</h4>
        <span class="quantity">0</span>
        <h4 class="increase">+</h4>
      </div>

      <button class="add-to-cart">🛒 ADD</button>
      </div>
      <div class="title">${item.title}</div>
      <div class="price">${item.price}</div>
      
    `;

    container.appendChild(card);

    // Контроллерлерді табу
    const decreaseBtn = card.querySelector(".decrease");
    const increaseBtn = card.querySelector(".increase");
    const quantitySpan = card.querySelector(".quantity");
    const addToCartBtn = card.querySelector(".add-to-cart");

    // Қосу/азайту логикасы
    increaseBtn.addEventListener("click", () => {
      quantity++;
      quantitySpan.textContent = quantity;
    });

    decreaseBtn.addEventListener("click", () => {
      if (quantity > 0) {
        quantity--;
        quantitySpan.textContent = quantity;
      }
    });

    // "Қосу" батырмасы
    addToCartBtn.addEventListener("click", () => {
      if (quantity > 0) {
        const cartItem = {
          id: item.title + item.price, // бірегей ID
          title: item.title,
          price: item.price,
          image: item.image || '',
        };
        addToCart(cartItem, quantity);
        alert(`🛒 ${item.title} (${quantity} wise) added to cart!`);
      } else {
        alert("⚠ Please select at least 1 piece first!");
      }
    });
    
  });
}


function nextColumn() {
  const maxColumns = Math.ceil(filteredData.length / 2);
  if ((currentColumn + 1) * visibleColumns < filteredData.length) {
    currentColumn++;
    renderCards();
  }
}

function prevColumn() {
  if (currentColumn > 0) {
    currentColumn--;
    renderCards();
  }
}


// ============ Bakery категориясын бөлек шығару =============
function renderBakeryOnly(data) {
  const container = document.getElementById("bakery-section");
  if (!container) return;

  container.innerHTML = "";

  const bakeryItems = data.filter(item => item.category === "bakery");

  bakeryItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "bakery-card";
    
    let quantity = 0;

    card.innerHTML = `
    <div class="box-bake">
  
      ${item.image ? `<img src="${item.image}" alt="${item.title}">` : `<div class="no-image">No image</div>`}
      <div class="popop">
      <div class="baker-main">
      <div class="title">${item.title}</div>
      <div class="price">${item.price}</div>
      </div>
      <div class="myidea2">
        <div class="quantity-controls2">
          <h4 class="decrease">-</h4>
          <span class="quantity">0</span>
          <h4 class="increase">+</h4>
        </div>
        <button class="add-to-cart2">🛒 ADD</button>
      </div>
      </div>
      
      </div>
    `;
    container.appendChild(card);
    const decreaseBtn = card.querySelector(".decrease");
    const increaseBtn = card.querySelector(".increase");
    const quantitySpan = card.querySelector(".quantity");
    const addToCartBtn = card.querySelector(".add-to-cart2");

    increaseBtn.addEventListener("click", () => {
      quantity++;
      quantitySpan.textContent = quantity;
    });

    decreaseBtn.addEventListener("click", () => {
      if (quantity > 0) {
        quantity--;
        quantitySpan.textContent = quantity;
      }
    });

    addToCartBtn.addEventListener("click", () => {
      if (quantity > 0) {
        const cartItem = {
          id: item.title + item.price, // бірегей ID
          title: item.title,
          price: item.price,
          image: item.image || '',
        };
        addToCart(cartItem, quantity);
        alert(`🛒 ${item.title} (${quantity} wise) added to cart!`);
      } else {
        alert("⚠ Please select at least 1 piece first");
      }
    });
    
  });
}




// ================= Жүктелгенде =================
document.addEventListener("DOMContentLoaded", () => {
  fetchCanteenData();
});




// merch 
 sheetURL = "https://docs.google.com/spreadsheets/d/1B4loM0legi-tOamA2a60OQSYxDJOCdQ2IwjMkJay1Fo/gviz/tq?tqx=out:json";

let allCards = [];
let startIndex = 0;
const cardsPerPage = 10;

async function fetchMerchData() {
  const res = await fetch(sheetURL);
  const text = await res.text();
  const json = JSON.parse(text.substring(47).slice(0, -2));

  const rows = json.table.rows;

  allCards = rows
    .slice(1) // 👈 Тақырып жолын алып тастаймыз
    .map(row => {
      return {
        img: row.c[0]?.v || '',
        category: row.c[1]?.v || '',
        name: row.c[2]?.v || '',
        price: row.c[3]?.v || ''
      };
    });

  showCards();
}

function showCards() {
  const container2 = document.getElementById('kortalar');
  container2.innerHTML = '';

  const visibleCards = allCards.slice(startIndex, startIndex + cardsPerPage);
  visibleCards.forEach(data => {
    const card = document.createElement('div');
    card.className = 'box';

    let quantity = 0;

    card.innerHTML = `
      <img src="${data.img}" alt="Сурет" />
      <div class="myidea">
        <div class="quantity-controls">
          <h4 class="decrease">-</h4>
          <span class="quantity">0</span>
          <h4 class="increase">+</h4>
        </div>
        <button class="add-to-cart">🛒 ADD</button>
      </div>
      <p>${data.category}</p>
      <h2>${data.name}</h2>
      <div class="zhyldyz">⭐⭐⭐⭐⭐</div>
      <h3>${data.price}</h3>

      
    `;

    container2.appendChild(card);

    const decreaseBtn = card.querySelector(".decrease");
    const increaseBtn = card.querySelector(".increase");
    const quantitySpan = card.querySelector(".quantity");
    const addToCartBtn = card.querySelector(".add-to-cart");

    increaseBtn.addEventListener("click", () => {
      quantity++;
      quantitySpan.textContent = quantity;
    });

    decreaseBtn.addEventListener("click", () => {
      if (quantity > 0) {
        quantity--;
        quantitySpan.textContent = quantity;
      }
    });


    addToCartBtn.addEventListener("click", () => {
      if (quantity > 0) {
        const cartItem = {
          id: data.name + data.price, // бірегей ID
          title: data.name,
          price: data.price,
          image: data.img || '',
        };
        addToCart(cartItem, quantity);
        alert(`🛒 ${data.name} (${quantity} wise) added to cart!`);
      } else {
        alert("⚠ Please select at least 1 piece first!");
      }
    });
    
  });
}


document.getElementById('ongka').addEventListener('click', () => {
  if (startIndex + cardsPerPage < allCards.length) {
    startIndex += 5;
    showCards();
  }
});

document.getElementById('solga').addEventListener('click', () => {
  if (startIndex - 5 >= 0) {
    startIndex -= 5;
    showCards();
  }
});

fetchMerchData();




