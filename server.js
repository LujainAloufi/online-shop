require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:5500"], // السماح بنطاقات محددة
    credentials: true
}));

// الاتصال بقاعدة البيانات مع التعامل مع الأخطاء
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ متصل بقاعدة البيانات"))
  .catch(err => console.error("❌ فشل الاتصال بقاعدة البيانات:", err));

// مخطط بيانات المستخدم
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false } // ✅ إضافة isAdmin للحسابات الإدارية
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

// مخطط بيانات المنتج
const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: String,
    image: String
});
const Product = mongoose.model("Product", ProductSchema);

// ✅ مخطط بيانات الطلبات
const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", OrderSchema);

// ✅ تسجيل مستخدم جديد
app.post("/api/users/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "يجب إدخال البريد الإلكتروني وكلمة المرور" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "المستخدم موجود مسبقًا" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: "تم إنشاء الحساب بنجاح" });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
});

// ✅ تسجيل دخول المستخدم
app.post("/api/users/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "يجب إدخال البريد الإلكتروني وكلمة المرور" });
        }

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "secretkey", { expiresIn: "1h" });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
});

// ✅ التحقق من تسجيل الدخول قبل إتمام الطلب
function verifyUser(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(403).json({ message: "يجب تسجيل الدخول للمتابعة" });
    }
    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET || "secretkey");
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "الجلسة منتهية أو غير صالحة" });
    }
}

// ✅ جلب جميع المنتجات
app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
});

// ✅ إضافة منتج جديد
app.post("/api/products", async (req, res) => {
    try {
        const { name, description, price, image } = req.body;
        if (!name || !description || !price || !image) {
            return res.status(400).json({ message: "يجب إدخال جميع البيانات المطلوبة" });
        }

        const newProduct = new Product({ name, description, price, image });
        await newProduct.save();
        res.status(201).json({ message: "تمت إضافة المنتج بنجاح" });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
});

// ✅ إتمام الطلب وتخزينه في قاعدة البيانات
app.post("/api/orders", verifyUser, async (req, res) => {
    try {
        const { products } = req.body;
        if (!products || products.length === 0) {
            return res.status(400).json({ message: "السلة فارغة، لا يمكن إتمام الطلب" });
        }

        const newOrder = new Order({ userId: req.userId, products });
        await newOrder.save();
        
        res.json({ message: "تم إتمام الطلب بنجاح", order: newOrder });
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ أثناء إتمام الطلب", error: error.message });
    }
});

//✅ إضافة مسار جديد لجلب منتج معين حسب الـ ID:

app.get("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "المنتج غير موجود" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
});


// ✅ جلب جميع الطلبات للمستخدم الحالي
app.get("/api/orders", verifyUser, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId }).populate("products");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ أثناء جلب الطلبات", error: error.message });
    }
});


//كود تسجيل الدخول للمدير
app.post("/api/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await User.findOne({ email, isAdmin: true }); // ✅ البحث عن مدراء فقط
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({ message: "❌ بيانات الدخول غير صحيحة أو الحساب غير مسجل كمدير." });
        }

        const token = jwt.sign({ userId: admin._id, isAdmin: true }, process.env.JWT_SECRET || "secretkey", { expiresIn: "1h" });

        res.json({ token });
    } catch (error) {
        console.error("❌ خطأ أثناء تسجيل الدخول:", error);
        res.status(500).json({ message: "❌ خطأ في السيرفر", error: error.message });
    }
});


//كود تسجيل المديرين
app.post("/api/admin/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "❌ يجب إدخال البريد الإلكتروني وكلمة المرور" });
        }

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "❌ الحساب مسجل مسبقًا." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new User({ email, password: hashedPassword, isAdmin: true }); // ✅ حفظ الحساب كمدير
        await newAdmin.save();

        res.status(201).json({ message: "✅ تم تسجيل الحساب بنجاح، يمكنك تسجيل الدخول الآن." });
    } catch (error) {
        console.error("❌ خطأ أثناء التسجيل:", error);
        res.status(500).json({ message: "❌ خطأ في السيرفر", error: error.message });
    }
});



// ✅ تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`));
