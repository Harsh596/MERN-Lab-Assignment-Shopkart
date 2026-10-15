# 🛒 ShopKart — Full-Stack E-Commerce Web Application

> **ShopKart** is a modern, full-stack e-commerce web application featuring user authentication, real-time product discovery, interactive shopping cart and wishlist systems, end-to-end Razorpay payment gateway integration with cryptographic signature verification, and customer order management.

---

## 🌐 Live Deployment Links

- **Frontend (Client):** [Deploy on Vercel](#frontend-deployment-vercel) *(Add your live link here, e.g., `https://shopkart-client.vercel.app`)*
- **Backend (API):** [Deploy on Render](#backend-deployment-render) *(Add your live link here, e.g., `https://shopkart-api.onrender.com`)*
- **API Health Check:** `https://<your-backend-domain>/`

---

## 📋 Submission Checklist

- [x] Complete Frontend implementation (React 19 + Vite)
- [x] Complete Backend implementation (Node.js + Express 5)
- [x] Working MongoDB Atlas Database integration with Mongoose
- [x] Secure authentication with JWT & HTTP-only cookies
- [x] Razorpay Payment Gateway integration (Standard Checkout + HMAC-SHA256 verification)
- [x] Comprehensive `README.md` with setup and deployment instructions
- [x] Git `.gitignore` properly configured — **no API keys, secrets, or `.env` files committed**

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 8
- **Routing:** React Router v7
- **HTTP Client:** Axios (with credentials and centralized base URL configuration)
- **Styling:** Custom CSS with responsive layouts and modern design tokens
- **Payment SDK:** Razorpay Standard Checkout

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB Atlas (via Mongoose ODM)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` for password hashing
- **Payments:** Official `razorpay` Node SDK & `crypto` for HMAC-SHA256 signature verification
- **Security:** `cors` with credentials support, `cookie-parser`, `dotenv`

---

## 📁 Project Structure

```text
LAB 1/
├── .gitignore                      # Root Git ignore (prevents .env and node_modules from being tracked)
├── README.md                       # Comprehensive project documentation
├── backend/
│   ├── .env.example                # Sample environment variables for backend
│   ├── .gitignore                  # Backend-specific Git ignore
│   ├── index.js                    # Express application entry point & MongoDB Atlas connection
│   ├── package.json                # Backend scripts and dependencies
│   ├── config/
│   │   └── razorpay.js             # Razorpay SDK initialization
│   ├── controllers/
│   │   ├── customer.controller.js  # Registration, login, profile, logout
│   │   ├── product.controller.js   # Product listing, search, filters, details
│   │   ├── cart.controller.js      # Cart retrieval, item addition, updates, removals
│   │   ├── wishlist.controller.js  # Wishlist retrieval, toggling, removals
│   │   └── order.controller.js     # Razorpay order generation, HMAC verification, order history
│   ├── middlewares/
│   │   └── auth.middleware.js      # JWT token verification (supports cookies and Bearer headers)
│   ├── models/
│   │   ├── customer.model.js       # Customer schema with embedded cart & wishlist references
│   │   ├── product.model.js        # Product schema (name, price, stock, category, image)
│   │   └── order.model.js          # Order schema (items, shippingAddress, paymentStatus, total)
│   ├── routes/
│   │   ├── customer.routes.js      # Customer authentication routes
│   │   ├── product.routes.js       # Product discovery routes
│   │   ├── cart.routes.js          # Cart management routes
│   │   ├── wishlist.routes.js      # Wishlist routes
│   │   └── order.routes.js         # Orders and checkout routes
│   └── utils/
│       ├── generateToken.js        # JWT generation and HTTP-only cookie helper
│       └── seedProducts.js         # Database seeding script (100 products from DummyJSON API)
└── frontend/
    └── vite-project/
        ├── .env.example            # Sample environment variables for frontend
        ├── vercel.json             # SPA routing rewrite rule for Vercel
        ├── vite.config.js          # Vite config with local dev proxy
        ├── package.json            # Frontend scripts and dependencies
        └── src/
            ├── App.jsx             # Route definitions and application layout
            ├── context/
            │   ├── AuthContext.jsx # Authentication state provider
            │   └── CartContext.jsx # Cart count and synchronization provider
            ├── services/
            │   ├── api.js          # Centralized Axios instance with VITE_API_URL support
            │   ├── cartService.js  # Cart API integration
            │   ├── orderService.js # Order and payment API integration
            │   ├── productService.js# Product fetch and filtering API
            │   └── wishlistService.js# Wishlist API integration
            └── pages/
                ├── Home.jsx        # Landing page with hero banner & featured items
                ├── Products.jsx    # Product catalog with search, category & sort
                ├── ProductDetails.jsx# Detailed product view with stock checks
                ├── Cart.jsx        # Shopping cart view with quantity controls
                ├── Wishlist.jsx    # Wishlist management
                ├── Checkout.jsx    # Shipping form & Razorpay payment trigger
                ├── OrderSuccess.jsx# Payment confirmation screen
                ├── Orders.jsx      # Order history & status progression
                ├── Login.jsx       # Customer login
                └── Register.jsx    # Customer registration
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

Create a `.env` file inside the `backend/` directory based on `backend/.env.example`:

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopkart?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=yyyyyyyyyyyyyyyyyyyy
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> [!IMPORTANT]
> - Never commit your `.env` file to GitHub.
> - Ensure your MongoDB Atlas cluster has IP Whitelist set to `0.0.0.0/0` (Allow Access from Anywhere) so cloud servers can reach the database.

### Frontend (`frontend/vite-project/.env`)

In local development, leave `VITE_API_URL` empty to automatically use the Vite proxy. For production deployment (e.g. on Vercel), set:

```env
VITE_API_URL=https://<your-backend-service>.onrender.com
```

---

## 🚀 Local Setup & Installation

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd "LAB 1"
```

### 2. Backend Setup
```bash
cd backend
npm install
# Ensure backend/.env is created with valid MongoDB and Razorpay credentials
npm run seed     # (Optional) Seeds 100 products from DummyJSON into your database
npm run dev      # Starts the backend server with auto-reload on http://localhost:5001
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend/vite-project
npm install
npm run dev      # Launches Vite dev server on http://localhost:5173
```

Now open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 Key API Endpoints

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Health check endpoint | No |
| `POST` | `/customers/register` | Register a new customer | No |
| `POST` | `/customers/login` | Login and receive HTTP-only auth cookie | No |
| `GET` | `/customers/me` | Fetch currently logged-in customer profile | Yes |
| `POST` | `/customers/logout` | Clear auth cookie | Yes |
| `GET` | `/products` | List products (supports `search`, `category`, `sort`) | No |
| `GET` | `/products/:id` | Fetch single product details | No |
| `GET` | `/cart` | Retrieve customer's active cart | Yes |
| `POST` | `/cart/:productId` | Add item to cart | Yes |
| `PATCH` | `/cart/:productId` | Update item quantity in cart | Yes |
| `DELETE` | `/cart/:productId` | Remove item from cart | Yes |
| `GET` | `/wishlist` | Retrieve customer's wishlist | Yes |
| `POST` | `/wishlist/:productId` | Add item to wishlist | Yes |
| `DELETE` | `/wishlist/:productId` | Remove item from wishlist | Yes |
| `PATCH` | `/wishlist/:productId/toggle` | Toggle item in wishlist | Yes |
| `POST` | `/orders/create-payment-order` | Validate stock, create order & Razorpay order | Yes |
| `POST` | `/orders/verify-payment` | Verify HMAC-SHA256 signature & mark order paid | Yes |
| `GET` | `/orders` | Fetch customer order history | Yes |
| `GET` | `/orders/:id` | Fetch single order details | Yes |
| `PATCH` | `/orders/:id/status` | Update order fulfillment status | Yes |

---

## ☁️ Deployment Guide

You can deploy **both Frontend and Backend directly on Vercel** (recommended — zero cold starts and single dashboard), or deploy the backend on Render.

### Step 1: MongoDB Atlas Configuration
1. Log into your [MongoDB Atlas](https://cloud.mongodb.com/) dashboard.
2. Go to **Network Access** in the left sidebar.
3. Click **Add IP Address** and choose **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Under **Database Access**, ensure your database user has read/write permissions.

---

### Step 2: Push Your Code to GitHub
1. Stage and commit your files:
   ```bash
   git add .
   git commit -m "feat: complete ShopKart full-stack lab project"
   ```
2. Create a new repository on [GitHub](https://github.com/).
3. Push your code:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
4. Verify on GitHub that `backend/.env` is **not** present in your repository.

---

### Step 3: Deploy the Backend on Vercel (Recommended)

1. Log into your [Vercel](https://vercel.com/) dashboard.
2. Click **Add New...** > **Project** and import your GitHub repository.
3. In the configuration screen:
   - **Project Name:** `shopkart-backend` (or your preferred name)
   - **Framework Preset:** `Other`
   - **Root Directory:** Click **Edit** and choose `backend`.
4. Expand **Environment Variables** and add the following keys from your `.env`:
   - `MONGO_URI`: *(your MongoDB Atlas connection string)*
   - `JWT_SECRET`: *(your JWT secret key)*
   - `RAZORPAY_KEY_ID`: *(your Razorpay test key ID)*
   - `RAZORPAY_KEY_SECRET`: *(your Razorpay test secret)*
   - `NODE_ENV`: `production`
5. Click **Deploy**.
6. Once deployed, note down your live backend URL (e.g. `https://shopkart-backend.vercel.app`).
7. Open `https://<your-backend-url>/` in your browser. You will see:
   ```json
   { "status": "healthy", "message": "ShopKart API is running smoothly" }
   ```

*(Alternative: You can also deploy `backend` on Render.com as a Web Service using Build Command `npm install` and Start Command `npm start`).*

---

### Step 4: Deploy the Frontend on Vercel

1. Return to your [Vercel](https://vercel.com/) dashboard.
2. Click **Add New...** > **Project**.
3. Import your GitHub repository.
4. In the Project Configuration:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click `Edit` and select `frontend/vite-project`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Expand **Environment Variables** and add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://<your-backend-service-name>.onrender.com` *(use your live Render backend URL, without a trailing slash)*
6. Click **Deploy**.
7. After deployment, copy your live frontend URL (e.g. `https://shopkart-client.vercel.app`).
8. Return to Render and update `CLIENT_URL` in your backend environment variables to match your live Vercel URL.

---

## 💳 Testing Payments with Razorpay Test Mode

1. Register a new user or login.
2. Browse products, add them to your cart, and proceed to **Checkout**.
3. Fill in the delivery address and click **Pay with Razorpay**.
4. In the Razorpay modal:
   - Select **Cards**, enter test card details (e.g. standard Razorpay test card `card: 4111 1111 1111 1111`, expiry `12/30`, CVV `123`).
   - Or select **NetBanking** > **Success**.
5. Upon successful payment verification, you will be redirected to the **Order Success** confirmation page, and the order will appear under **My Orders**.

---

## 🔒 Security & Best Practices

- **Zero Secret Leakage:** All secrets, database connection strings, and API keys are stored exclusively in environment variables and are excluded from Git version control via `.gitignore`.
- **Cryptographic Verification:** Razorpay webhook/client payment signatures are verified server-side using SHA-256 HMAC before fulfilling orders and decrementing inventory.
- **Role & Scope Protection:** All customer endpoints (cart, wishlist, checkout, orders) are protected by JWT authentication middleware with both HTTP-only cookies and Bearer token fallback.
