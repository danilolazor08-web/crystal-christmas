// =====================================================
// CRYSTAL CHRISTMAS — CHECKOUT
// =====================================================


// Товари магазину

const products =
    JSON.parse(
        localStorage.getItem("crystalChristmasProducts")
    ) || [];


// Кошик покупця

let cart =
    JSON.parse(
        localStorage.getItem("crystalChristmasCart")
    ) || [];


// Старі замовлення

let orders =
    JSON.parse(
        localStorage.getItem("crystalChristmasOrders")
    ) || [];


// =====================================================
// ELEMENTS
// =====================================================

const checkoutItems =
    document.getElementById("checkout-items");

const productsTotal =
    document.getElementById("products-total");

const checkoutTotal =
    document.getElementById("checkout-total");

const checkoutForm =
    document.getElementById("checkout-form");

const successOverlay =
    document.getElementById("success-overlay");

const orderNumber =
    document.getElementById("order-number");


// =====================================================
// RENDER ORDER
// =====================================================

function renderOrder() {

    checkoutItems.innerHTML = "";


    // Якщо кошик порожній

    if (cart.length === 0) {

        checkoutItems.innerHTML = `

            <div class="checkout-empty">

                <h3>
                    Кошик порожній
                </h3>

                <p>
                    Поверніться в магазин
                    та додайте іграшки.
                </p>

            </div>

        `;


        productsTotal.textContent = "0 грн";

        checkoutTotal.textContent = "0 грн";


        return;

    }


    cart.forEach(item => {

        const storeProduct =
            products.find(
                product =>
                    product.id === item.id
            );


        const element =
            document.createElement("div");


        element.classList.add(
            "checkout-item"
        );


        let imageHTML = `

            <span>
                CC
            </span>

        `;


        if (
            storeProduct &&
            storeProduct.image
        ) {

            imageHTML = `

                <img
                    src="${storeProduct.image}"
                    alt="${escapeHTML(item.name)}"
                >

            `;

        }


        const itemTotal =
            Number(item.price) *
            Number(item.quantity);


        element.innerHTML = `

            <div class="checkout-item-image">

                ${imageHTML}

            </div>


            <div class="checkout-item-info">

                <h3>
                    ${escapeHTML(item.name)}
                </h3>

                <p>
                    КІЛЬКІСТЬ:
                    ${item.quantity}
                </p>

            </div>


            <strong class="checkout-item-price">

                ${itemTotal.toLocaleString("uk-UA")}
                грн

            </strong>

        `;


        checkoutItems.appendChild(
            element
        );

    });


    updateTotal();

}


// =====================================================
// TOTAL
// =====================================================

function updateTotal() {

    const total =
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


    productsTotal.textContent =
        total.toLocaleString("uk-UA")
        + " грн";


    checkoutTotal.textContent =
        total.toLocaleString("uk-UA")
        + " грн";

}


// =====================================================
// CREATE ORDER
// =====================================================

checkoutForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        if (cart.length === 0) {

            alert(
                "Ваш кошик порожній."
            );

            return;

        }


        const firstName =
            document
                .getElementById("first-name")
                .value
                .trim();


        const lastName =
            document
                .getElementById("last-name")
                .value
                .trim();


        const phone =
            document
                .getElementById("phone")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const city =
            document
                .getElementById("city")
                .value
                .trim();


        const deliveryMethod =
            document
                .getElementById("delivery-method")
                .value;


        const warehouse =
            document
                .getElementById("warehouse")
                .value
                .trim();


        const comment =
            document
                .getElementById("comment")
                .value
                .trim();


        const paymentElement =
            document.querySelector(
                'input[name="payment"]:checked'
            );


        const payment =
            paymentElement
                ? paymentElement.value
                : "cash-on-delivery";


        // -------------------------
        // SIMPLE VALIDATION
        // -------------------------

        if (
            !firstName ||
            !lastName ||
            !phone ||
            !city ||
            !deliveryMethod ||
            !warehouse
        ) {

            alert(
                "Заповніть усі обов'язкові поля."
            );

            return;

        }


        // Перевірка українського телефону

        const phoneNumbers =
            phone.replace(/\D/g, "");


        if (
            phoneNumbers.length < 10 ||
            phoneNumbers.length > 12
        ) {

            alert(
                "Перевірте номер телефону."
            );

            return;

        }


        // -------------------------
        // TOTAL
        // -------------------------

        const total =
            cart.reduce(

                (sum, item) =>
                    sum +
                    Number(item.price) *
                    Number(item.quantity),

                0

            );


        // -------------------------
        // ORDER NUMBER
        // -------------------------

        const number =
            createOrderNumber();


        // -------------------------
        // ORDER OBJECT
        // -------------------------

        const order = {

            id: Date.now(),

            number: number,

            date:
                new Date().toLocaleString(
                    "uk-UA"
                ),

            status: "Нове",

            customer: {

                firstName:
                    firstName,

                lastName:
                    lastName,

                phone:
                    phone,

                email:
                    email

            },

            delivery: {

                city:
                    city,

                method:
                    deliveryMethod,

                warehouse:
                    warehouse

            },

            payment:
                payment,

            comment:
                comment,

            items:
                cart,

            total:
                total

        };


        // -------------------------
        // SAVE ORDER
        // -------------------------

        orders.unshift(order);


        try {

            localStorage.setItem(
                "crystalChristmasOrders",
                JSON.stringify(orders)
            );

        }

        catch (error) {

            console.error(error);

            alert(
                "Не вдалося зберегти замовлення."
            );

            return;

        }


        // -------------------------
        // CLEAR CART
        // -------------------------

        cart = [];


        localStorage.setItem(
            "crystalChristmasCart",
            JSON.stringify(cart)
        );


        // -------------------------
        // SUCCESS
        // -------------------------

        orderNumber.textContent =
            "#" + number;


        successOverlay.classList.add(
            "active"
        );

    }
);


// =====================================================
// ORDER NUMBER
// =====================================================

function createOrderNumber() {

    const date =
        new Date();


    const year =
        String(
            date.getFullYear()
        ).slice(-2);


    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return `CC-${year}-${random}`;

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        String(text);


    return div.innerHTML;

}


// =====================================================
// START
// =====================================================

renderOrder();