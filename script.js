// =====================================================
// CRYSTAL CHRISTMAS
// MAIN STORE SCRIPT
// =====================================================


// =====================================================
// 1. ЗАВАНТАЖУЄМО ТОВАРИ З АДМІНКИ
// =====================================================

let products = [];


// =====================================================
// 2. ЗАВАНТАЖУЄМО КОШИК
// =====================================================

let cart =
    JSON.parse(
        localStorage.getItem("crystalChristmasCart")
    ) || [];


// =====================================================
// 3. ЕЛЕМЕНТИ СТОРІНКИ
// =====================================================

const productsContainer =
    document.getElementById("products");

const openCartButton =
    document.getElementById("open-cart");

const closeCartButton =
    document.getElementById("close-cart");

const cartPanel =
    document.getElementById("cart-panel");

const cartOverlay =
    document.getElementById("cart-overlay");

const cartItems =
    document.getElementById("cart-items");

const cartCount =
    document.getElementById("cart-count");

const cartTotal =
    document.getElementById("cart-total");

const checkoutButton =
    document.getElementById("checkout-button");


// =====================================================
// 4. ПОКАЗУЄМО ТОВАРИ
// =====================================================

function renderProducts() {

    productsContainer.innerHTML = "";


    // Якщо товарів немає

    if (products.length === 0) {

        productsContainer.innerHTML = `

            <div class="catalog-empty">

                <h3>
                    Колекція готується
                </h3>

                <p>
                    Скоро тут з'являться
                    нові різдвяні прикраси.
                </p>

            </div>

        `;

        return;
    }


    // Створюємо картки товарів

    products.forEach(product => {

        const article =
            document.createElement("article");


        article.classList.add("product");


        // =============================================
        // ФОТО
        // =============================================

        let imageHTML = `

            <div class="product-no-image">

                CRYSTAL CHRISTMAS

            </div>

        `;


        if (product.image) {

            imageHTML = `

                <img
                    src="${product.image}"
                    alt="${escapeHTML(product.name)}"
                >

            `;

        }


        // =============================================
        // НАЯВНІСТЬ
        // =============================================

        let stockHTML = "";


        if (product.inStock) {

            stockHTML = `

                <span class="store-stock in-stock">

                    В НАЯВНОСТІ

                </span>

            `;

        }

        else {

            stockHTML = `

                <span class="store-stock out-stock">

                    НЕМАЄ В НАЯВНОСТІ

                </span>

            `;

        }


        // =============================================
        // КНОПКА КОШИКА
        // =============================================

        let buttonHTML = "";


        if (product.inStock) {

            buttonHTML = `

                <button
                    class="add-cart"
                    type="button"
                    data-id="${product.id}"
                    title="Додати у кошик"
                >

                    +

                </button>

            `;

        }

        else {

            buttonHTML = `

                <button
                    class="add-cart disabled"
                    type="button"
                    disabled
                >

                    ×

                </button>

            `;

        }


        // =============================================
        // КАРТКА ТОВАРУ
        // =============================================

        article.innerHTML = `

            <div class="product-image">

                ${imageHTML}

            </div>


            <div class="product-info">


                <p class="product-category">

                    ${escapeHTML(product.category)}

                </p>


                <h3>

                    ${escapeHTML(product.name)}

                </h3>


                ${stockHTML}


                <p class="product-description">

                    ${escapeHTML(
                        product.description ||
                        "Скляна різдвяна прикраса ручної роботи."
                    )}

                </p>


                <div class="product-bottom">


                    <strong>

                        ${Number(product.price)
                            .toLocaleString("uk-UA")}

                        грн

                    </strong>


                    ${buttonHTML}


                </div>


            </div>

        `;


        productsContainer.appendChild(article);

    });


    connectAddButtons();
    connectProductDetails();

}


// =====================================================
// 5. ПІДКЛЮЧАЄМО КНОПКИ +
// =====================================================

function connectAddButtons() {

    const buttons =
        document.querySelectorAll(
            ".add-cart:not(.disabled)"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function() {


                const productId =
                    Number(this.dataset.id);


                addToCart(productId);


                // Маленька анімація

                this.textContent = "✓";


                setTimeout(() => {

                    this.textContent = "+";

                }, 600);

            }
        );

    });

}


// =====================================================
// 6. ДОДАТИ ТОВАР У КОШИК
// =====================================================

function addToCart(productId) {

    const product =
        products.find(
            product =>
                Number(product.id) ===
                Number(productId)
        );


    if (!product) {

        return;

    }


    if (!product.inStock) {

        return;

    }


    const existingProduct =
        cart.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    // Якщо вже є

    if (existingProduct) {

        existingProduct.quantity++;

    }

    // Якщо ще немає

    else {

        cart.push({

            id: product.id,

            name: product.name,

            price: Number(product.price),

            quantity: 1

        });

    }


    saveCart();

    updateCart();

}


// =====================================================
// 7. ЗБЕРІГАЄМО КОШИК
// =====================================================

function saveCart() {

    localStorage.setItem(
        "crystalChristmasCart",
        JSON.stringify(cart)
    );

}


// =====================================================
// 8. ОНОВЛЮЄМО КОШИК
// =====================================================

function updateCart() {

    cartItems.innerHTML = "";


    // =============================================
    // ПОРОЖНІЙ КОШИК
    // =============================================

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <p>
                    Ваш кошик порожній
                </p>

                <span>
                    Додайте щось особливе ✨
                </span>

            </div>

        `;

    }


    // =============================================
    // ТОВАРИ В КОШИКУ
    // =============================================

    cart.forEach((item, index) => {

        const element =
            document.createElement("div");


        element.classList.add(
            "cart-item"
        );


        const itemTotal =
            Number(item.price) *
            Number(item.quantity);


        element.innerHTML = `

            <div class="cart-item-top">


                <h3>

                    ${escapeHTML(item.name)}

                </h3>


                <span class="cart-item-price">

                    ${itemTotal
                        .toLocaleString("uk-UA")}

                    грн

                </span>


            </div>


            <div class="cart-controls">


                <button
                    type="button"
                    onclick="changeQuantity(${index}, -1)"
                >

                    −

                </button>


                <span>

                    ${item.quantity}

                </span>


                <button
                    type="button"
                    onclick="changeQuantity(${index}, 1)"
                >

                    +

                </button>


                <button
                    type="button"
                    class="remove-item"
                    onclick="removeFromCart(${index})"
                >

                    ВИДАЛИТИ

                </button>


            </div>

        `;


        cartItems.appendChild(
            element
        );

    });


    // =============================================
    // КІЛЬКІСТЬ ТОВАРІВ
    // =============================================

    const totalQuantity =
        cart.reduce(

            (sum, item) => {

                return (
                    sum +
                    Number(item.quantity)
                );

            },

            0

        );


    cartCount.textContent =
        totalQuantity;


    // =============================================
    // ЗАГАЛЬНА СУМА
    // =============================================

    const totalPrice =
        cart.reduce(

            (sum, item) => {

                return (
                    sum +
                    Number(item.price) *
                    Number(item.quantity)
                );

            },

            0

        );


    cartTotal.textContent =
        totalPrice.toLocaleString("uk-UA")
        + " грн";

}


// =====================================================
// 9. ЗМІНА КІЛЬКОСТІ
// =====================================================

function changeQuantity(index, amount) {

    if (!cart[index]) {

        return;

    }


    cart[index].quantity += amount;


    // Якщо стало 0

    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }


    saveCart();

    updateCart();

}


// =====================================================
// 10. ВИДАЛИТИ З КОШИКА
// =====================================================

function removeFromCart(index) {

    if (!cart[index]) {

        return;

    }


    cart.splice(index, 1);


    saveCart();

    updateCart();

}


// =====================================================
// 11. ВІДКРИТИ КОШИК
// =====================================================

function openCart() {

    cartPanel.classList.add(
        "active"
    );


    cartOverlay.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


// =====================================================
// 12. ЗАКРИТИ КОШИК
// =====================================================

function closeCart() {

    cartPanel.classList.remove(
        "active"
    );


    cartOverlay.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


// =====================================================
// 13. КНОПКИ КОШИКА
// =====================================================

openCartButton.addEventListener(
    "click",
    openCart
);


closeCartButton.addEventListener(
    "click",
    closeCart
);


cartOverlay.addEventListener(
    "click",
    closeCart
);


// ESC

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeCart();

        }

    }
);


// =====================================================
// 14. ОФОРМЛЕННЯ ЗАМОВЛЕННЯ
// =====================================================

checkoutButton.addEventListener(
    "click",
    function() {


        // Якщо кошик порожній

        if (cart.length === 0) {

            alert(
                "Ваш кошик порожній."
            );

            return;

        }


        // Зберігаємо кошик ще раз

        saveCart();


        // ПЕРЕХІД НА CHECKOUT

        window.location.href =
            "checkout.html";

    }
);


// =====================================================
// 15. ЗАХИСТ ТЕКСТУ
// =====================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        String(text);


    return div.innerHTML;

}


// =====================================================
// 16. ОНОВЛЕННЯ ТОВАРІВ ПІСЛЯ ПОВЕРНЕННЯ НА СТОРІНКУ
// =====================================================

window.addEventListener(
    "pageshow",
    function() {


        products =
            JSON.parse(
                localStorage.getItem(
                    "crystalChristmasProducts"
                )
            ) || [];


        cart =
            JSON.parse(
                localStorage.getItem(
                    "crystalChristmasCart"
                )
            ) || [];


        renderProducts();

        updateCart();

    }
);


// =====================================================
// 17. START
// =====================================================

// FIRESTORE — товари однакові на всіх пристроях
db.collection("products").onSnapshot((snapshot) => {
    products = snapshot.docs.map(doc => ({
        id: Number(doc.id) || doc.id,
        ...doc.data()
    }));
    renderProducts();
}, (error) => {
    console.error("Помилка завантаження товарів:", error);
    productsContainer.innerHTML = `<div class="catalog-empty"><h3>Не вдалося завантажити колекцію</h3><p>Перевірте підключення до Firebase.</p></div>`;
});

updateCart();

/* Product detail gallery — photos remain within their frame. */
function connectProductDetails() {
    document.querySelectorAll(".product").forEach(card => {
        const id = card.querySelector(".add-cart")?.dataset.id;
        const product = products.find(p => String(p.id) === String(id));
        if (!product) return;
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", "Переглянути " + product.name);
        card.addEventListener("click", event => {
            if (event.target.closest(".add-cart")) return;
            showProductDetails(product);
        });
        card.addEventListener("keydown", event => {
            if ((event.key === "Enter" || event.key === " ") && !event.target.closest(".add-cart")) {
                event.preventDefault(); showProductDetails(product);
            }
        });
    });
}
function showProductDetails(product) {
    document.getElementById("crystal-product-modal")?.remove();
    const photos = Array.isArray(product.images) && product.images.length ? product.images : (product.image ? [product.image] : []);
    const overlay = document.createElement("div");
    overlay.id = "crystal-product-modal";
    overlay.className = "crystal-product-overlay";
    const panel = document.createElement("section");
    panel.className = "crystal-product-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", product.name || "Товар");
    const close = document.createElement("button");
    close.className = "crystal-product-close";
    close.type = "button"; close.textContent = "×"; close.setAttribute("aria-label", "Закрити");
    const gallery = document.createElement("div"); gallery.className = "crystal-gallery";
    const picture = document.createElement("div"); picture.className = "crystal-product-picture";
    const main = document.createElement("img"); main.alt = product.name || "Фото товару";
    if (photos.length) { main.src = photos[0]; picture.appendChild(main); }
    else picture.textContent = "CRYSTAL CHRISTMAS";
    gallery.appendChild(picture);
    if (photos.length > 1) {
        const thumbs = document.createElement("div"); thumbs.className = "crystal-gallery-thumbs";
        photos.forEach((url, i) => {
            const b = document.createElement("button"); b.type = "button";
            b.className = "crystal-gallery-thumb" + (i === 0 ? " active" : "");
            const img = document.createElement("img"); img.src = url; img.alt = "Фото " + (i + 1);
            b.appendChild(img); b.onclick = () => {
                main.src = url;
                thumbs.querySelectorAll("button").forEach(t => t.classList.remove("active"));
                b.classList.add("active");
            };
            thumbs.appendChild(b);
        });
        gallery.appendChild(thumbs);
    }
    const info = document.createElement("div"); info.className = "crystal-product-details";
    for (const [tag, value] of [["small",product.category || "CRYSTAL CHRISTMAS"],["h2",product.name || "Прикраса"],["p",product.description || ""],["strong",Number(product.price || 0).toLocaleString("uk-UA") + " грн"]]) {
        const el = document.createElement(tag); el.textContent = value; info.appendChild(el);
    }
    if (product.inStock) {
        const buy = document.createElement("button"); buy.className = "crystal-product-buy";
        buy.textContent = "Додати в кошик"; buy.onclick = () => { addToCart(product.id); dismiss(); };
        info.appendChild(buy);
    }
    panel.append(close, gallery, info); overlay.appendChild(panel); document.body.appendChild(overlay);
    const oldOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    const esc = e => { if (e.key === "Escape") dismiss(); };
    function dismiss() { overlay.remove(); document.body.style.overflow = oldOverflow; document.removeEventListener("keydown",esc); }
    close.onclick = dismiss;
    overlay.addEventListener("click",e => { if (e.target === overlay) dismiss(); });
    document.addEventListener("keydown",esc); close.focus();
}
