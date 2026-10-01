// =====================================================
// CRYSTAL CHRISTMAS — ADMIN PANEL
// =====================================================


// =====================================================
// 1. DATA
// =====================================================

let products =
    JSON.parse(
        localStorage.getItem("crystalChristmasProducts")
    ) || [];

let orders =
    JSON.parse(
        localStorage.getItem("crystalChristmasOrders")
    ) || [];

let editingProductId = null;
let selectedImage = "";
let orderToDelete = null;
let currentOrderFilter = "all";


// =====================================================
// 2. ELEMENTS
// =====================================================

const navButtons =
    document.querySelectorAll(".nav-button");

const sections =
    document.querySelectorAll(".admin-section");

const adminProducts =
    document.getElementById("admin-products");

const ordersList =
    document.getElementById("orders-list");

const productForm =
    document.getElementById("product-form");

const productName =
    document.getElementById("product-name");

const productPrice =
    document.getElementById("product-price");

const productCategory =
    document.getElementById("product-category");

const productDescription =
    document.getElementById("product-description");

const productStock =
    document.getElementById("product-stock");

const productImage =
    document.getElementById("product-image");

const imagePreview =
    document.getElementById("image-preview");

const uploadPlaceholder =
    document.getElementById("upload-placeholder");

const formTitle =
    document.getElementById("form-title");

const goAddProduct =
    document.getElementById("go-add-product");

const cancelProduct =
    document.getElementById("cancel-product");

const notification =
    document.getElementById("notification");

const ordersBadge =
    document.getElementById("orders-badge");

const ordersTotalCount =
    document.getElementById("orders-total-count");

const orderFilters =
    document.querySelectorAll(".order-filter");

const dashboardProducts =
    document.getElementById("dashboard-products");

const dashboardOrders =
    document.getElementById("dashboard-orders");

const dashboardNewOrders =
    document.getElementById("dashboard-new-orders");

const dashboardSales =
    document.getElementById("dashboard-sales");

const dashboardLastOrders =
    document.getElementById("dashboard-last-orders");

const dashboardAddProduct =
    document.getElementById("dashboard-add-product");

const dashboardOpenOrders =
    document.getElementById("dashboard-open-orders");

const deleteOrderModal =
    document.getElementById("delete-order-modal");

const cancelDeleteOrder =
    document.getElementById("cancel-delete-order");

const confirmDeleteOrder =
    document.getElementById("confirm-delete-order");


// =====================================================
// 3. SECTION NAVIGATION
// =====================================================

function showSection(sectionId) {

    sections.forEach(section => {
        section.classList.remove("active");
    });

    navButtons.forEach(button => {
        button.classList.remove("active");
    });


    const selectedSection =
        document.getElementById(sectionId);


    if (selectedSection) {
        selectedSection.classList.add("active");
    }


    navButtons.forEach(button => {

        if (button.dataset.section === sectionId) {
            button.classList.add("active");
        }

    });


    if (sectionId === "orders-section") {

        loadOrders();

        renderOrders();

    }


    if (sectionId === "dashboard-section") {

        loadOrders();

        updateDashboard();

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// =====================================================
// 4. SIDEBAR BUTTONS
// =====================================================

navButtons.forEach(button => {

    button.addEventListener("click", function() {

        const section =
            this.dataset.section;


        if (section === "add-section") {
            resetProductForm();
        }


        showSection(section);

    });

});


goAddProduct.addEventListener("click", function() {

    resetProductForm();

    showSection("add-section");

});


dashboardAddProduct.addEventListener("click", function() {

    resetProductForm();

    showSection("add-section");

});


dashboardOpenOrders.addEventListener("click", function() {

    showSection("orders-section");

});


// =====================================================
// 5. PRODUCT IMAGE
// =====================================================

productImage.addEventListener("change", function(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    if (!file.type.startsWith("image/")) {

        alert("Оберіть фотографію.");

        productImage.value = "";

        return;
    }


    if (file.size > 3 * 1024 * 1024) {

        alert(
            "Фото завелике. Для локальної версії використайте фото до 3 МБ."
        );

        productImage.value = "";

        return;
    }


    const reader =
        new FileReader();


    reader.onload = function(event) {

        selectedImage =
            event.target.result;


        imagePreview.src =
            selectedImage;


        imagePreview.style.display =
            "block";


        uploadPlaceholder.style.display =
            "none";

    };


    reader.readAsDataURL(file);

});


// =====================================================
// 6. SAVE PRODUCT
// =====================================================

productForm.addEventListener("submit", function(event) {

    event.preventDefault();


    const name =
        productName.value.trim();

    const price =
        Number(productPrice.value);

    const category =
        productCategory.value.trim();

    const description =
        productDescription.value.trim();

    const inStock =
        productStock.checked;


    if (!name) {

        alert("Введіть назву товару.");

        return;
    }


    if (!price || price <= 0) {

        alert("Введіть правильну ціну.");

        return;
    }


    if (!category) {

        alert("Введіть категорію.");

        return;
    }


    // EDIT

    if (editingProductId !== null) {

        const index =
            products.findIndex(
                product =>
                    Number(product.id) ===
                    Number(editingProductId)
            );


        if (index !== -1) {

            products[index] = {

                ...products[index],

                name,
                price,
                category,
                description,
                inStock,

                image:
                    selectedImage ||
                    products[index].image ||
                    ""

            };

        }


        showNotification(
            "Товар оновлено"
        );

    }

    // NEW PRODUCT

    else {

        const newProduct = {

            id: Date.now(),

            name,
            price,
            category,
            description,
            inStock,

            image:
                selectedImage || ""

        };


        products.push(newProduct);


        showNotification(
            "Товар додано"
        );

    }


    saveProducts();

    renderProducts();

    updateDashboard();

    resetProductForm();

    showSection("products-section");

});


// =====================================================
// 7. SAVE PRODUCTS
// =====================================================

function saveProducts() {

    try {

        localStorage.setItem(
            "crystalChristmasProducts",
            JSON.stringify(products)
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Не вдалося зберегти товар. Спробуйте використати менше фото або менший файл."
        );

    }

}


// =====================================================
// 8. RENDER PRODUCTS
// =====================================================

function renderProducts() {

    adminProducts.innerHTML = "";


    if (products.length === 0) {

        adminProducts.innerHTML = `

            <div class="no-products">

                <h3>
                    Товарів поки немає
                </h3>

                <p>
                    Додайте першу іграшку
                    Crystal Christmas.
                </p>

            </div>

        `;

        return;
    }


    products.forEach(product => {

        const card =
            document.createElement("article");


        card.classList.add(
            "admin-product"
        );


        let imageHTML = `

            <span class="no-image">
                БЕЗ ФОТО
            </span>

        `;


        if (product.image) {

            imageHTML = `

                <img
                    src="${product.image}"
                    alt="${escapeHTML(product.name)}"
                >

            `;

        }


        card.innerHTML = `

            <div class="admin-product-image">

                ${imageHTML}

            </div>


            <div class="admin-product-info">


                <p class="admin-product-category">

                    ${escapeHTML(product.category)}

                </p>


                <h3>

                    ${escapeHTML(product.name)}

                </h3>


                <p class="admin-product-price">

                    ${Number(product.price)
                        .toLocaleString("uk-UA")}
                    грн

                </p>


                <span class="
                    product-status
                    ${product.inStock
                        ? "in-stock"
                        : "out-stock"}
                ">

                    ${product.inStock
                        ? "В НАЯВНОСТІ"
                        : "НЕМАЄ В НАЯВНОСТІ"}

                </span>


                <div class="admin-product-actions">


                    <button
                        class="edit-product"
                        type="button"
                        onclick="editProduct(${product.id})"
                    >
                        РЕДАГУВАТИ
                    </button>


                    <button
                        class="delete-product"
                        type="button"
                        onclick="deleteProduct(${product.id})"
                    >
                        ВИДАЛИТИ
                    </button>


                </div>


            </div>

        `;


        adminProducts.appendChild(card);

    });

}


// =====================================================
// 9. EDIT PRODUCT
// =====================================================

function editProduct(id) {

    const product =
        products.find(
            product =>
                Number(product.id) ===
                Number(id)
        );


    if (!product) {
        return;
    }


    editingProductId =
        product.id;


    productName.value =
        product.name;

    productPrice.value =
        product.price;

    productCategory.value =
        product.category;

    productDescription.value =
        product.description || "";

    productStock.checked =
        Boolean(product.inStock);


    selectedImage =
        product.image || "";


    if (selectedImage) {

        imagePreview.src =
            selectedImage;

        imagePreview.style.display =
            "block";

        uploadPlaceholder.style.display =
            "none";

    }

    else {

        imagePreview.src = "";

        imagePreview.style.display =
            "none";

        uploadPlaceholder.style.display =
            "flex";

    }


    formTitle.textContent =
        "Редагувати іграшку";


    showSection("add-section");

}


// =====================================================
// 10. DELETE PRODUCT
// =====================================================

function deleteProduct(id) {

    const product =
        products.find(
            product =>
                Number(product.id) ===
                Number(id)
        );


    if (!product) {
        return;
    }


    const confirmed =
        confirm(
            `Видалити товар "${product.name}"?`
        );


    if (!confirmed) {
        return;
    }


    products =
        products.filter(
            product =>
                Number(product.id) !==
                Number(id)
        );


    saveProducts();

    renderProducts();

    updateDashboard();


    showNotification(
        "Товар видалено"
    );

}


// =====================================================
// 11. RESET PRODUCT FORM
// =====================================================

function resetProductForm() {

    productForm.reset();


    productStock.checked =
        true;


    editingProductId =
        null;


    selectedImage =
        "";


    imagePreview.src =
        "";


    imagePreview.style.display =
        "none";


    uploadPlaceholder.style.display =
        "flex";


    productImage.value =
        "";


    formTitle.textContent =
        "Додати нову іграшку";

}


// =====================================================
// 12. CANCEL PRODUCT
// =====================================================

cancelProduct.addEventListener(
    "click",
    function() {

        resetProductForm();

        showSection(
            "products-section"
        );

    }
);


// =====================================================
// 13. LOAD ORDERS
// =====================================================

function loadOrders() {

    orders =
        JSON.parse(
            localStorage.getItem(
                "crystalChristmasOrders"
            )
        ) || [];

}


// =====================================================
// 14. SAVE ORDERS
// =====================================================

function saveOrders() {

    localStorage.setItem(
        "crystalChristmasOrders",
        JSON.stringify(orders)
    );

}


// =====================================================
// 15. RENDER ORDERS
// =====================================================

function renderOrders() {

    ordersList.innerHTML = "";


    ordersTotalCount.textContent =
        orders.length;


    const newOrders =
        orders.filter(
            order =>
                order.status === "Нове"
        );


    ordersBadge.textContent =
        newOrders.length;


    let filteredOrders =
        orders;


    if (currentOrderFilter !== "all") {

        filteredOrders =
            orders.filter(
                order =>
                    order.status ===
                    currentOrderFilter
            );

    }


    // EMPTY

    if (filteredOrders.length === 0) {

        ordersList.innerHTML = `

            <div class="orders-empty">

                <h3>
                    Замовлень немає
                </h3>

                <p>
                    Тут з'являться замовлення,
                    які покупці оформлять
                    у магазині.
                </p>

            </div>

        `;

        return;
    }


    // ORDERS

    filteredOrders.forEach(order => {

        const card =
            document.createElement("article");


        card.classList.add(
            "order-card"
        );


        const customer =
            order.customer || {};


        const delivery =
            order.delivery || {};


        const items =
            Array.isArray(order.items)
                ? order.items
                : [];


        const itemsHTML =
            items.map(item => {

                const itemTotal =
                    Number(item.price) *
                    Number(item.quantity);


                return `

                    <div class="order-product">

                        <div>

                            <strong>
                                ${escapeHTML(item.name)}
                            </strong>

                            <span>
                                × ${item.quantity}
                            </span>

                        </div>

                        <strong>

                            ${itemTotal
                                .toLocaleString("uk-UA")}
                            грн

                        </strong>

                    </div>

                `;

            }).join("");


        const deliveryName =
            getDeliveryName(
                delivery.method
            );


        const paymentName =
            getPaymentName(
                order.payment
            );


        card.innerHTML = `

            <div class="order-card-header">


                <div>

                    <p class="order-number-admin">

                        #${escapeHTML(order.number || "—")}

                    </p>

                    <span class="order-date">

                        ${escapeHTML(order.date || "")}

                    </span>

                </div>


                <span class="
                    admin-order-status
                    ${getStatusClass(order.status)}
                ">

                    ${escapeHTML(order.status || "Нове")}

                </span>


            </div>


            <div class="order-grid">


                <div class="order-column">

                    <p class="order-label">
                        КЛІЄНТ
                    </p>


                    <h3>

                        ${escapeHTML(
                            `${customer.firstName || ""}
                            ${customer.lastName || ""}`
                        )}

                    </h3>


                    <a
                        href="tel:${escapeHTML(customer.phone || "")}"
                        class="order-contact"
                    >

                        ${escapeHTML(customer.phone || "Телефон не вказано")}

                    </a>


                    ${
                        customer.email
                            ? `
                                <a
                                    href="mailto:${escapeHTML(customer.email)}"
                                    class="order-contact"
                                >
                                    ${escapeHTML(customer.email)}
                                </a>
                              `
                            : ""
                    }

                </div>


                <div class="order-column">

                    <p class="order-label">
                        ДОСТАВКА
                    </p>


                    <strong>
                        ${escapeHTML(deliveryName)}
                    </strong>


                    <span>
                        ${escapeHTML(delivery.city || "—")}
                    </span>


                    <span>
                        ${escapeHTML(delivery.warehouse || "—")}
                    </span>

                </div>


                <div class="order-column">

                    <p class="order-label">
                        ОПЛАТА
                    </p>


                    <strong>
                        ${escapeHTML(paymentName)}
                    </strong>

                </div>


            </div>


            <div class="order-products">

                <p class="order-label">
                    ТОВАРИ
                </p>

                ${itemsHTML}

            </div>


            ${
                order.comment
                    ? `

                        <div class="order-comment">

                            <p class="order-label">
                                КОМЕНТАР
                            </p>

                            <p>
                                ${escapeHTML(order.comment)}
                            </p>

                        </div>

                      `
                    : ""
            }


            <div class="order-total-row">

                <span>
                    РАЗОМ
                </span>

                <strong>

                    ${Number(order.total || 0)
                        .toLocaleString("uk-UA")}
                    грн

                </strong>

            </div>


            <div class="order-actions">


                <div class="order-status-control">

                    <label>
                        СТАТУС
                    </label>


                    <select
                        onchange="changeOrderStatus(${order.id}, this.value)"
                    >

                        <option
                            value="Нове"
                            ${order.status === "Нове"
                                ? "selected"
                                : ""}
                        >
                            Нове
                        </option>


                        <option
                            value="В обробці"
                            ${order.status === "В обробці"
                                ? "selected"
                                : ""}
                        >
                            В обробці
                        </option>


                        <option
                            value="Відправлено"
                            ${order.status === "Відправлено"
                                ? "selected"
                                : ""}
                        >
                            Відправлено
                        </option>


                        <option
                            value="Виконано"
                            ${order.status === "Виконано"
                                ? "selected"
                                : ""}
                        >
                            Виконано
                        </option>

                    </select>

                </div>


                <button
                    type="button"
                    class="delete-order-button"
                    onclick="askDeleteOrder(${order.id})"
                >
                    ВИДАЛИТИ
                </button>


            </div>

        `;


        ordersList.appendChild(card);

    });

}


// =====================================================
// 16. ORDER FILTERS
// =====================================================

orderFilters.forEach(button => {

    button.addEventListener(
        "click",
        function() {

            orderFilters.forEach(
                filter => {
                    filter.classList.remove(
                        "active"
                    );
                }
            );


            this.classList.add(
                "active"
            );


            currentOrderFilter =
                this.dataset.status;


            renderOrders();

        }
    );

});


// =====================================================
// 17. CHANGE ORDER STATUS
// =====================================================

function changeOrderStatus(id, newStatus) {

    const order =
        orders.find(
            order =>
                Number(order.id) ===
                Number(id)
        );


    if (!order) {
        return;
    }


    order.status =
        newStatus;


    saveOrders();

    renderOrders();

    updateDashboard();


    showNotification(
        "Статус замовлення змінено"
    );

}


// =====================================================
// 18. DELETE ORDER
// =====================================================

function askDeleteOrder(id) {

    orderToDelete =
        id;


    deleteOrderModal.classList.add(
        "active"
    );

}


cancelDeleteOrder.addEventListener(
    "click",
    closeDeleteModal
);


deleteOrderModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            deleteOrderModal
        ) {

            closeDeleteModal();

        }

    }
);


function closeDeleteModal() {

    orderToDelete =
        null;


    deleteOrderModal.classList.remove(
        "active"
    );

}


confirmDeleteOrder.addEventListener(
    "click",
    function() {

        if (orderToDelete === null) {
            return;
        }


        orders =
            orders.filter(
                order =>
                    Number(order.id) !==
                    Number(orderToDelete)
            );


        saveOrders();

        closeDeleteModal();

        renderOrders();

        updateDashboard();


        showNotification(
            "Замовлення видалено"
        );

    }
);


// =====================================================
// 19. DASHBOARD
// =====================================================

function updateDashboard() {

    loadOrders();


    dashboardProducts.textContent =
        products.length;


    dashboardOrders.textContent =
        orders.length;


    const newOrders =
        orders.filter(
            order =>
                order.status === "Нове"
        );


    dashboardNewOrders.textContent =
        newOrders.length;


    ordersBadge.textContent =
        newOrders.length;


    ordersTotalCount.textContent =
        orders.length;


    const totalSales =
        orders.reduce(
            (sum, order) =>
                sum +
                Number(order.total || 0),
            0
        );


    dashboardSales.textContent =
        totalSales.toLocaleString("uk-UA")
        + " грн";


    renderDashboardOrders();

}


// =====================================================
// 20. DASHBOARD LAST ORDERS
// =====================================================

function renderDashboardOrders() {

    dashboardLastOrders.innerHTML =
        "";


    if (orders.length === 0) {

        dashboardLastOrders.innerHTML = `

            <p class="dashboard-empty">
                Замовлень поки немає.
            </p>

        `;

        return;
    }


    orders
        .slice(0, 5)
        .forEach(order => {


            const customer =
                order.customer || {};


            const item =
                document.createElement("div");


            item.classList.add(
                "dashboard-order"
            );


            item.innerHTML = `

                <div>

                    <strong>

                        #${escapeHTML(order.number || "—")}

                    </strong>

                    <span>

                        ${escapeHTML(
                            `${customer.firstName || ""}
                            ${customer.lastName || ""}`
                        )}

                    </span>

                </div>


                <div>

                    <strong>

                        ${Number(order.total || 0)
                            .toLocaleString("uk-UA")}
                        грн

                    </strong>

                    <span>

                        ${escapeHTML(order.status || "Нове")}

                    </span>

                </div>

            `;


            dashboardLastOrders.appendChild(
                item
            );

        });

}


// =====================================================
// 21. DELIVERY NAME
// =====================================================

function getDeliveryName(method) {

    if (method === "nova-poshta") {
        return "Нова пошта";
    }


    if (method === "ukrposhta") {
        return "Укрпошта";
    }


    return method || "Не вказано";

}


// =====================================================
// 22. PAYMENT NAME
// =====================================================

function getPaymentName(payment) {

    if (payment === "cash-on-delivery") {
        return "Післяплата";
    }


    if (payment === "online") {
        return "Оплата онлайн";
    }


    return payment || "Не вказано";

}


// =====================================================
// 23. STATUS CLASS
// =====================================================

function getStatusClass(status) {

    if (status === "Нове") {
        return "status-new";
    }


    if (status === "В обробці") {
        return "status-processing";
    }


    if (status === "Відправлено") {
        return "status-shipped";
    }


    if (status === "Виконано") {
        return "status-completed";
    }


    return "";

}


// =====================================================
// 24. NOTIFICATION
// =====================================================

function showNotification(message) {

    notification.textContent =
        message;


    notification.classList.add(
        "show"
    );


    setTimeout(
        function() {

            notification.classList.remove(
                "show"
            );

        },
        2500
    );

}


// =====================================================
// 25. ESCAPE HTML
// =====================================================

function escapeHTML(text) {

    const element =
        document.createElement("div");


    element.textContent =
        String(text);


    return element.innerHTML;

}


// =====================================================
// 26. REFRESH DATA WHEN RETURNING TO ADMIN
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


        loadOrders();


        renderProducts();

        renderOrders();

        updateDashboard();

    }
);


// =====================================================
// 27. START
// =====================================================

renderProducts();

loadOrders();

renderOrders();

updateDashboard();