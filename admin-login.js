document.getElementById("admin-login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;

    const response = await fetch("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        alert("✅ تم تسجيل الدخول بنجاح!");
        window.location.href = "admin.html"; // تحويل المستخدم إلى لوحة التحكم
    } else {
        alert("❌ بيانات الدخول غير صحيحة أو الحساب غير مسجل. الرجاء التسجيل أولاً.");
        window.location.href = "admin-register.html"; // توجيه المستخدم إلى صفحة التسجيل إذا لم يكن مسجلاً
    }
});

// ✅ التحقق من صلاحية الدخول عند فتح لوحة التحكم
document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname.includes("admin.html") && !localStorage.getItem("adminToken")) {
        alert("⚠️ يجب تسجيل الدخول للوصول إلى لوحة التحكم.");
        window.location.href = "admin-login.html"; // إعادة التوجيه إلى صفحة تسجيل الدخول
    }
});
