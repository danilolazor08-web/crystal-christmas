// =====================================================
// CRYSTAL CHRISTMAS
// MAIN STORE SCRIPT
// =====================================================


// =====================================================
// 1. ЗАВАНТАЖУЄМО ТОВАРИ З АДМІНКИ
// =====================================================

let products =
    JSON.parse(
        localStorage.getItem("crystalChristmasProducts")
    ) || [];


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

renderProducts();

updateCart();