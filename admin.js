
// Firebase sign-in: Firestore writes are allowed only for this account.
const ADMIN_UID = "v69rs6QQh8QI4YbFb3sHlqmKQdj2";
const adminAuthGate = document.getElementById("admin-auth-gate");
const adminLoginForm = document.getElementById("admin-login-form");
const adminLoginError = document.getElementById("admin-login-error");
let adminAuthorized = false;

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.error);
firebase.auth().onAuthStateChanged(user => {
    adminAuthorized = !!user && user.uid === ADMIN_UID;
    adminAuthGate.style.display = adminAuthorized ? "none" : "flex";
    const uidEl = document.getElementById("admin-login-uid");
    if (user && !adminAuthorized) {
        adminLoginError.textContent = "Google-вхід успішний, але цей Google-акаунт ще не має прав адміністратора. Замініть UID у FIRESTORE-RULES.txt та ADMIN_UID в admin.js на UID нижче.";
        uidEl.textContent = "UID Google: " + user.uid + " (скопіюй цей UID для правил Firebase)";
    } else {
        adminLoginError.textContent = "";
        uidEl.textContent = "";
    }
});
adminLoginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const button = document.getElementById("admin-login-submit");
    button.disabled = true;
    adminLoginError.textContent = "";
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({prompt: "select_account"});
        const current = firebase.auth().currentUser;
        if (current && current.uid !== ADMIN_UID) await firebase.auth().signOut();
        await firebase.auth().signInWithPopup(provider);
    } catch (error) {
        adminLoginError.textContent = "Помилка Google-входу: " + (error.message || error.code);
    } finally {
        button.disabled = false;
    }
});

document.getElementById("logout-button").addEventListener("click", () => firebase.auth().signOut());

// =====================================================
// CRYSTAL CHRISTMAS — ADMIN PANEL
// =====================================================


// =====================================================
// 1. DATA
// =====================================================

let products = [];

let orders = [];

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

// Multiple photos are stored in Firebase Storage, not in Firestore documents.
let galleryImages = [];
let pendingPhotoFiles = [];
const galleryPreview = document.getElementById("gallery-preview");
function drawGalleryPreview() {
    galleryPreview.innerHTML = "";
    galleryImages.forEach((url, index) => addGalleryThumb(url, index, false));
    pendingPhotoFiles.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        addGalleryThumb(url, index, true);
    });
    uploadPlaceholder.style.display = galleryImages.length || pendingPhotoFiles.length ? "none" : "flex";
}
function addGalleryThumb(url, index, pending) {
    const box = document.createElement("div");
    box.className = "gallery-thumb";
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Фото товару";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.title = "Прибрати фото";
    remove.onclick = () => {
        if (pending) pendingPhotoFiles.splice(index, 1);
        else galleryImages.splice(index, 1);
        drawGalleryPreview();
    };
    box.append(img, remove);
    galleryPreview.appendChild(box);
}
productImage.addEventListener("change", event => {
    const incoming = Array.from(event.target.files || []);
    for (const file of incoming) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            alert("Дозволені JPG, PNG або WEBP."); continue;
        }
        if (file.size > 25 * 1024 * 1024) {
            alert("Максимальний розмір одного фото — 25 МБ."); continue;
        }
        pendingPhotoFiles.push(file);
    }
    event.target.value = "";
    drawGalleryPreview();
});
// Keep photos inside the Firestore product document: no paid Storage bucket required.
function compressPhoto(file, maxSide = 900, quality = 0.72) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
            try {
                const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
                canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            } catch (error) { reject(error); }
            finally { URL.revokeObjectURL(objectUrl); }
        };
        img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Не вдалося прочитати фото.")); };
        img.src = objectUrl;
    });
}
async function uploadGalleryFiles() {
    const result = [];
    // Keep the complete Firestore document comfortably below the 1 MiB limit.
    for (const file of pendingPhotoFiles) {
        let encoded = "";
        for (const [side, quality] of [[700, .65], [560, .56], [420, .48], [320, .4], [240, .32]]) {
            encoded = await compressPhoto(file, side, quality);
            if (encoded.length < 85000) break;
        }
        result.push(encoded);
    }
    return result;
}
function imageBytes(images) {
    return new Blob([JSON.stringify(images)]).size;
}

// =====================================================
// 6. SAVE PRODUCT
// =====================================================

productForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    if (!adminAuthorized) { alert("Спочатку увійдіть як адміністратор."); return; }
    const name = productName.value.trim();
    const price = Number(productPrice.value);
    const category = productCategory.value.trim();
    const description = productDescription.value.trim();
    const inStock = productStock.checked;
    if (!name || !Number.isFinite(price) || price <= 0 || !category) {
        alert("Заповніть назву, категорію та правильну ціну."); return;
    }
    const id = editingProductId !== null ? editingProductId : Date.now();
    const saveButton = productForm.querySelector('[type="submit"]');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "ЗБЕРІГАЄМО...";
    }
    try {
        const uploaded = await uploadGalleryFiles(id);
        const images = [...galleryImages, ...uploaded];
        // The first image is also stored in `image` for the catalog, so count it twice.
        if (imageBytes(images) + (images[0] || "").length > 650000) {
            throw new Error("Загальний розмір фотографій завеликий. Приберіть частину фото й повторіть.");
        }
        const product = { id, name, price, category, description, inStock, images, image: images[0] || "" };
        // Wait for the actual Firestore write before reporting success.
        await Promise.race([
            db.collection("products").doc(String(id)).set({
                name, price, category, description, inStock,
                images, image: product.image, updatedAt: serverTimestamp()
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase не відповідає. Перевірте інтернет і права доступу.")), 20000))
        ]);
        const index = products.findIndex(p => String(p.id) === String(id));
        if (index >= 0) products[index] = product;
        else products.push(product);
        renderProducts(); updateDashboard(); resetProductForm();
        showSection("products-section");
        showNotification("Товар і фотографії збережено");
    } catch (error) {
        console.error("Не вдалося зберегти товар", error);
        alert("Помилка збереження: " + (error.message || error) + ". Перевірте вхід адміністратора та правила Firestore.");
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = "ЗБЕРЕГТИ ТОВАР";
        }
    }
});

// =====================================================
// 7. SAVE PRODUCTS
// =====================================================

function saveProducts() {
    products.forEach(product => {
        db.collection("products")
            .doc(String(product.id))
            .set({
                name: product.name || "",
                price: Number(product.price) || 0,
                category: product.category || "",
                description: product.description || "",
                inStock: Boolean(product.inStock),
                image: product.image || "",
                images: product.images || (product.image ? [product.image] : []),
                updatedAt: serverTimestamp()
            })
            .catch(error => {
                console.error(error);
                alert("Не вдалося зберегти товар у Firebase.");
            });
    });
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


    galleryImages = Array.isArray(product.images) && product.images.length ? [...product.images] : (product.image ? [product.image] : []);
    pendingPhotoFiles = [];
    drawGalleryPreview();
    selectedImage = product.image || "";


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

    db.collection("products").doc(String(id)).delete().catch(console.error);

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
    galleryImages = [];
    pendingPhotoFiles = [];
    drawGalleryPreview();

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

    galleryImages = [];
    pendingPhotoFiles = [];
    drawGalleryPreview();


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
    // Дані приходять автоматично з Firestore.
}


// =====================================================
// 14. SAVE ORDERS
// =====================================================

function saveOrders() {
    orders.forEach(order => {
        if (!order.id) return;
        db.collection("orders").doc(String(order.id)).set(order, { merge: true }).catch(console.error);
    });
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


        const deletedOrderId = orderToDelete;

        orders =
            orders.filter(
                order =>
                    Number(order.id) !==
                    Number(orderToDelete)
            );

        db.collection("orders").doc(String(deletedOrderId)).delete().catch(console.error);

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
// 26. FIRESTORE REALTIME
// =====================================================

db.collection("products").onSnapshot((snapshot) => {
    products = snapshot.docs.map(doc => ({ id: Number(doc.id) || doc.id, ...doc.data() }));
    renderProducts();
    updateDashboard();
}, error => console.error("Products Firestore:", error));

let unsubscribeOrders = null;
firebase.auth().onAuthStateChanged(user => {
    if (unsubscribeOrders) { unsubscribeOrders(); unsubscribeOrders = null; }
    if (!user || user.uid !== ADMIN_UID) { orders = []; renderOrders(); updateDashboard(); return; }
    unsubscribeOrders = db.collection("orders").onSnapshot((snapshot) => {
    orders = snapshot.docs.map(doc => ({ id: Number(doc.id) || doc.id, ...doc.data() }));
    orders.sort((a, b) => Number(b.id) - Number(a.id));
    renderOrders();
    updateDashboard();
}, error => { console.error("Orders Firestore:", error); showNotification("Помилка читання замовлень: " + error.message); });
});

// Automatic localStorage migration disabled to protect existing products.
