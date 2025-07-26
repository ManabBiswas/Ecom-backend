# ShopHub - E-Commerce Backend Application

A comprehensive Node.js e-commerce backend application built with Express.js and
MongoDB, featuring user authentication, product management, shopping cart
functionality, and owner administration.

## 🚀 Features

### User Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Product Browsing**: Browse products with search, filter, and sort
  functionality
- **Shopping Cart**: Add/remove products from cart with quantity management
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### Owner/Admin Features

- **Single Owner System**: Secure owner account creation and management
- **Product Management**: Create products with images, pricing, and categories
- **Admin Dashboard**: Dedicated admin interface for product creation

### Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Token-based authentication with HTTP-only cookies
- **Session Management**: Express sessions with flash messaging
- **Input Validation**: Comprehensive input validation and sanitization

## 📁 Project Structure

```
backend_e-commerce/
│
├── config/
│   ├── development.json       # Development configuration
│   ├── keys.js               # Environment keys
│   ├── mongooseConnection.js  # Database connection setup
│   └── multerConfig.js       # File upload configuration
├── controllers/
│   └── authController.js     # Authentication logic
├── middlewares/
│   └── isLoggedIn.js         # Authentication middleware
├── models/
│   ├── ownermodels.js        # Owner schema
│   ├── productmodels.js      # Product schema
│   └── usermodels.js         # User schema
├── routes/
│   ├── index.js              # Main routes (shop, cart)
│   ├── ownerRouter.js        # Owner/admin routes
│   ├── productRouter.js      # Product management routes
│   └── userRouter.js         # User authentication routes
├── utils/
│   └── generateToken.js      # JWT token generation utility
├── public/
│   ├── CSS/
│   │   └── createProduct.css 
│   └── JS/
│       ├── script.js         # Index page frontend functionality
│       ├── shop.js           # Shop page interactions
│       ├── ownerDashbord.js  # Owner's Dashbord page interactions
│       ├── createProduct.js  # createProduct page interactions
│       └── cart.js           # Cart management
├── views/                    
│   ├── index.ejs             # Home page templates
│   ├── shop.ejs              # Shop page templates
│   ├── cart.ejs              # Cart page templates
│   ├── createProduct.ejs     # owner's product creation page templates
│   ├── ownerDashbord.ejs     # owner's dashbord.js page templates
│   ├── contact.ejs           # Contact page templates
│   └── about.ejs             # About page templates
│
├── .env                      #Environment file
├── .gitignore
├── app.js                    # Main application entry point
├── package.json              # Dependencies and scripts
├── package-lock.json
└── README.md                 # Readme file
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)
- npm or yarn package manager

### Step-by-Step Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend_e-commerce
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup** Create a `.env` file in the root directory:

   ```env
   JWT_KEY=your-super-secret-jwt-key-change-in-production
   SESSION_SECRET=your-session-secret-key-here
   NODE_ENV=development
   ```

4. **Database Configuration** Ensure your `config/development.json` contains:

   ```json
   {
     "MONGODB_URL": "mongodb://127.0.0.1:27017"
   }
   ```

5. **Start MongoDB** Make sure MongoDB is running on your system

6. **Run the application**

   ```bash
   npm start
   ```

   or for development with auto-reload:

   ```bash
   nodemon app.js
   ```

7. **Access the application** Open your browser and navigate to
   `http://localhost:3000`

## 📊 Database Schemas

### User Schema

```javascript
{
  fullName: String (required, min: 3 chars),
  email: String (required, unique),
  password: String (required, hashed),
  location: String (required),
  contactNo: Number (required),
  cart: [ObjectId] (references Product),
  wishlist: Array,
  order: Array,
  profileImage: String
}
```

### Owner Schema

```javascript
{
  fullName: String (required, min: 3 chars),
  email: String (required, unique),
  password: String (required, hashed),
  gstno: String (required),
  products: Array,
  profileImage: String
}
```

### Product Schema

```javascript
{
  name: String (required),
  description: String,
  rate: Number (default: 4.5),
  price: Number (required),
  discount: Number (default: 0),
  image: Buffer (required),
  bgColor: String (required),
  textColor: String (required),
  panelColor: String (required),
  category: String (required)
}
```

## 🛣️ API Endpoints

### User Routes (`/users`)

- `POST /users/register` - Register new user
- `POST /users/login` - User login
- `GET /users/logout` - User logout

### Owner Routes (`/owners`)

- `GET /owners/admin` - Admin dashboard
- `POST /owners/create` - Create owner (restricted to one)
- `POST /owners/login` - Owner login
- `GET /owners/logout` - Owner logout

### Product Routes (`/products`)

- `POST /products/create` - Create new product (with image upload)

### Main Routes (`/`)

- `GET /` - Home page with login/register modals
- `GET /shop` - Product browsing page (protected)
- `GET /cart` - Shopping cart page (protected)
- `GET /addtoCart/:productId` - Add product to cart (protected)
- `GET /removeFromCart/:productId` - Remove product from cart (protected)

## 📱 Page Templates

The application includes the following EJS templates:

- **`index.ejs`** - Landing page with authentication modals
- **`shop.ejs`** - Product catalog with search, filter, and sort
- **`cart.ejs`** - Shopping cart with quantity management
- **`createProduct.ejs`** - Admin form for adding new products
- **`about.ejs`** - About page with company/app information

## 💻 Frontend Features

### Shop Page 🛍️

- **Category Filtering**: Filter products by category
- **Sorting Options**: Sort by name, price (low to high, high to low)
- **Responsive Grid**: Product cards with hover effects
- **Add to Cart**: One-click add to cart functionality

### Cart Page 🛒

- **Quantity Management**: Increase/decrease product quantities
- **Price Calculation**: Real-time total calculation with discounts
- **Remove Items**: Remove products from cart
- **Checkout Ready**: Prepared for payment integration

### Authentication

- **Modal-based Login/Register**: Clean, user-friendly authentication
<!-- - **Flash Messages**: Success and error message system -->
- **Session Persistence**: Maintain login state across browser sessions

## 🔒 Security Measures

- **Password Security**: bcrypt with salt rounds for password hashing
- **JWT Tokens**: Secure token-based authentication
- **HTTP-Only Cookies**: Prevent XSS attacks
- **Input Validation**: Mongoose schema validation
- **Single Owner Policy**: Prevents unauthorized admin creation
- **Route Protection**: Middleware-based route protection

## 📱 Technologies Used

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Multer** - File upload handling

### Frontend

- **EJS** - Template engine
- **Tailwind CSS** - Utility-first CSS framework
- **Vanilla JavaScript** - Frontend interactions
- **Responsive Design** - Mobile-first approach

### Additional Tools

- **express-session** - Session management
- **connect-flash** - Flash messaging
- **cookie-parser** - Cookie handling
- **dotenv** - Environment variable management

## 🚀 Usage Guide

### For Users

1. **Registration**: Create account with personal details
2. **Browse Products**: Use search, filter, and sort features
3. **Shopping Cart**: Add products and manage quantities
4. **Account Management**: Secure login/logout functionality

### For Owners/Admins

1. **Initial Setup**: Create the first (and only) owner account
2. **Product Management**: Add products with images and details
3. **Admin Dashboard**: Access dedicated admin interface

## 📝 Development Notes

### Key Features Implemented

- Complete user authentication system
- Shopping cart with persistent storage
- Product management with image upload
- Responsive design with modern UI
- Secure session management
<!-- - Flash messaging system -->

### Environment Configuration

- Uses `config` package for environment-specific settings
- Supports development and production configurations
- Environment variables for sensitive data

### File Upload

- Configured with Multer for product image uploads
- Images stored as Buffer in MongoDB
- Memory storage for efficient handling

## 🔧 Customization

### Adding New Features

1. **Wishlist**: Already structured in user schema
2. **Order Management**: Order array ready for implementation
3. **Payment Integration**: Prepared cart system for payment APIs
4. **Product Reviews**: Rate field in product schema

### Styling Customization

- Tailwind CSS for easy style modifications
- Responsive breakpoints already configured
- Dark mode ready structure

## 📚 Dependencies

```json
{
  "bcrypt": "^6.0.0",
  "config": "^4.0.0",
  "connect-flash": "^0.1.1",
  "cookie-parser": "^1.4.7",
  "debug": "^4.4.1",
  "dotenv": "^17.2.0",
  "ejs": "^3.1.10",
  "express": "^5.1.0",
  "express-session": "^1.18.2",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.16.3",
  "multer": "^2.0.1"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🐛 Known Issues & Future Enhancements

### Current Limitations

- Images stored in database (consider cloud storage for production)
- Basic error handling (can be enhanced)

### Planned Features

- Order processing system (razorpay)
- Payment gateway integration
- Email notifications
- Advanced admin analytics
- Product review system
- Wishlist functionality

## 📞 Support

For support, please create an issue in the repository or contact the me (Email).

---

**Built By Manab using Node.js, Express.js, EJS and MongoDB**
