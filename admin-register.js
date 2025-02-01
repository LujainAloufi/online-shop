document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("admin-register-form");

    if (!form) {
        console.error("❌ لم يتم العثور على الفورم! تأكد أن لديك id=admin-register-form في HTML.");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const emailInput = document.getElementById("admin-register-email");
        const passwordInput = document.getElementById("admin-register-password");

        if (!emailInput || !passwordInput) {
            console.error("❌ لم يتم العثور على حقول الإدخال! تأكد أن لديك id صحيح في HTML.");
            return;
        }

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch("http://localhost:3000/api/admin/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, isAdmin: true })
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ تم تسجيل الحساب بنجاح، يمكنك تسجيل الدخول الآن.");
                window.location.href = "admin-login.html";
            } else {
                alert("❌ خطأ أثناء التسجيل: " + (data.message || "يرجى المحاولة مرة أخرى"));
            }
        } catch (error) {
            console.error("❌ خطأ في الطلب:", error);
            alert("❌ حدث خطأ في الاتصال بالسيرفر.");
        }
    });
});
