document.addEventListener("DOMContentLoaded", function () {
    const cartContainer = document.getElementById("cart-container");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    async function displayCart() {
        cartContainer.innerHTML = "";

        if (cart.length === 0) {
            cartContainer.innerHTML = "<p class='text-center'>🛒 السلة فارغة.</p>";
            return;
        }

        for (let productId of cart) {
            console.log("📌 محاولة جلب المنتج:", productId); // ✅ طباعة المنتج في Console

            try {
                const response = await fetch(`http://localhost:3000/api/products/${productId}`);

                if (!response.ok) {
                    console.error(`❌ خطأ في جلب المنتج ${productId}:`, response.statusText);
                    continue; // تخطي المنتجات التي لم يتم العثور عليها
                }

                const product = await response.json();

                const productElement = document.createElement("div");
                productElement.classList.add("col-md-4", "mb-3");
                productElement.innerHTML = `
                    <div class="product card shadow-sm">
                        <img src="${product.image}" alt="${product.name}" class="card-img-top">
                        <div class="card-body text-center">
                            <h3 class="card-title">${product.name}</h3>
                            <p class="card-text">${product.description}</p>
                            <p class="fw-bold text-primary">السعر: ${product.price} ريال</p>
                            <button class="btn btn-danger w-100" onclick="removeFromCart('${product._id}')">🗑️ إزالة</button>
                        </div>
                    </div>
                `;
                cartContainer.appendChild(productElement);
            } catch (error) {
                console.error(`❌ خطأ أثناء تحميل المنتج ${productId}:`, error);
            }
        }
    }

    // ✅ وظيفة إزالة المنتج من السلة
    window.removeFromCart = function (productId) {
        cart = cart.filter(id => id !== productId);
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCart();
    };

    // ✅ وظيفة إتمام الطلب
    window.checkout = function () {
        const token = localStorage.getItem("userToken");
        if (!token) {
            alert("⚠️ يجب تسجيل الدخول لإتمام الطلب.");
            window.location.href = "user-login.html";
            return;
        }

        alert("✅ تم إتمام الطلب بنجاح!");
        localStorage.removeItem("cart");
        displayCart();
    };

    displayCart();
});
