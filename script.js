document.addEventListener("DOMContentLoaded", function () {
    const productsContainer = document.getElementById("products-container");

    async function fetchProducts() {
        const response = await fetch("http://localhost:3000/api/products");
        const products = await response.json();

        productsContainer.innerHTML = "";
        products.forEach(product => {
            const productElement = document.createElement("div");
            productElement.classList.add("col-md-4", "mb-4", "product-hover");
            productElement.innerHTML = `
                <div class="product card shadow-sm">
                    <img src="${product.image}" alt="${product.name}" class="card-img-top">
                    <div class="card-body text-center">
                        <h3 class="card-title">${product.name}</h3>
                        <p class="card-text">${product.description}</p>
                        <p class="card-text fw-bold text-primary">السعر: ${product.price}</p>
                        <button class="btn btn-success w-100" onclick="addToCart('${product._id}')">إضافة إلى السلة</button>
                    </div>
                </div>
            `;
            productsContainer.appendChild(productElement);
        });
    }

    window.addToCart = function (productId) {
        const token = localStorage.getItem("userToken");
        if (!token) {
            alert("يجب تسجيل الدخول لإضافة المنتجات إلى السلة.");
            window.location.href = "user-login.html";
            return;
        }

        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.push(productId);
        localStorage.setItem("cart", JSON.stringify(cart));

        alert("تمت إضافة المنتج إلى السلة.");
    };

    fetchProducts();

    // 🖋️ إضافة تأثير الكتابة التلقائية على العنوان الرئيسي
    const titleElement = document.querySelector("header h1");
    const titleText = ".. يختصرها عليك";
    let index = 0;

    function typeEffect() {
        if (index < titleText.length) {
            titleElement.textContent += titleText[index];
            index++;
            setTimeout(typeEffect, 100);
        }
    }

    titleElement.textContent = ""; // التأكد من أن النص يبدأ فارغًا
    typeEffect();
});
