document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
        alert("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("userToken", data.token);
            alert("تم تسجيل الدخول بنجاح ✅");
            window.location.href = "index.html"; // إعادة التوجيه للصفحة الرئيسية
        } else {
            if (data.message === "بيانات الدخول غير صحيحة") {
                // 🔹 إذا لم يتم العثور على الحساب، اقتراح التسجيل
                const confirmRegister = confirm("هذا البريد الإلكتروني غير مسجل. هل تريد إنشاء حساب جديد؟");
                if (confirmRegister) {
                    window.location.href = "user-register.html"; // التوجيه لصفحة التسجيل
                }
            } else {
                alert(data.message); // عرض أي رسالة خطأ أخرى
            }
        }
    } catch (error) {
        console.error("خطأ:", error);
        alert("حدث خطأ أثناء تسجيل الدخول.");
    }
});
