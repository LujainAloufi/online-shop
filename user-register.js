document.getElementById("register-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("user-email").value;
    const password = document.getElementById("user-password").value;

    const response = await fetch("http://localhost:3000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        alert("تم إنشاء الحساب بنجاح، يمكنك الآن تسجيل الدخول.");
        window.location.href = "user-login.html";
    } else {
        alert("حدث خطأ أثناء إنشاء الحساب.");
    }
});
