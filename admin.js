document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("add-product-form");
    const productsContainer = document.getElementById("admin-products-container");

    // تحميل المنتجات من قاعدة البيانات عند تشغيل الصفحة
    async function fetchProducts() {
        const response = await fetch("http://localhost:3000/api/products");
        const products = await response.json();

        productsContainer.innerHTML = "";
        products.forEach(product => {
            const productElement = document.createElement("div");
            productElement.classList.add("col-md-4");
            productElement.innerHTML = `
                <div class="product">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p>السعر: ${product.price}</p>
                    <button class="btn btn-warning" onclick="editProduct('${product._id}', '${product.name}', '${product.description}', '${product.price}', '${product.image}')">تعديل</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">حذف</button>
                </div>
            `;
            productsContainer.appendChild(productElement);
        });
    }

    // إضافة منتج جديد
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        const token = localStorage.getItem("adminToken");
        if (!token) {
            alert("يجب تسجيل الدخول كمدير لإضافة المنتجات");
            window.location.href = "admin-login.html";
            return;
        }

        const productData = {
            name: document.getElementById("name").value,
            description: document.getElementById("description").value,
            price: document.getElementById("price").value,
            image: document.getElementById("image").value
        };

        const response = await fetch("http://localhost:3000/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            alert("تمت إضافة المنتج بنجاح");
        } else {
            alert("حدث خطأ أثناء إضافة المنتج");
        }

        form.reset();
        fetchProducts();
    });

    // تعديل منتج
    async function editProduct(id, name, description, price, image) {
        const newName = prompt("تعديل اسم المنتج:", name);
        const newDescription = prompt("تعديل الوصف:", description);
        const newPrice = prompt("تعديل السعر:", price);
        const newImage = prompt("تعديل رابط الصورة:", image);

        if (!newName || !newDescription || !newPrice || !newImage) {
            alert("لم يتم تعديل المنتج");
            return;
        }

        const token = localStorage.getItem("adminToken");
        if (!token) {
            alert("يجب تسجيل الدخول كمدير");
            window.location.href = "admin-login.html";
            return;
        }

        const updatedProduct = {
            name: newName,
            description: newDescription,
            price: newPrice,
            image: newImage
        };

        const response = await fetch(`http://localhost:3000/api/products/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedProduct)
        });

        if (response.ok) {
            alert("تم تحديث المنتج بنجاح");
        } else {
            alert("حدث خطأ أثناء التعديل");
        }

        fetchProducts();
    }

    // حذف منتج
    async function deleteProduct(id) {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            alert("يجب تسجيل الدخول كمدير");
            window.location.href = "admin-login.html";
            return;
        }

        if (!confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟")) return;

        const response = await fetch(`http://localhost:3000/api/products/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert("تم حذف المنتج بنجاح");
        } else {
            alert("حدث خطأ أثناء الحذف");
        }

        fetchProducts();
    }

    // تحميل المنتجات عند تشغيل الصفحة
    fetchProducts();
});
