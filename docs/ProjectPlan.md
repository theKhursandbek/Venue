# **Backend Developer Task: Venue Booking System**

## **Project Name: `venue-booking-backend`**

## **Overview**

Build a REST API backend for a venue/spot booking application. The system includes user authentication via OTP, venue management, and booking functionality with a full admin panel.

---

## **Tech Stack (Required)**

* **Language**: Python 3.11+  
* **Framework**: Django 5.0+  
* **API**: Django REST Framework  
* **Database**: PostgreSQL  
* **Cache/OTP Storage**: Redis  
* **Internationalization**: django-modeltranslation, django-parler, or similar  
* **API Documentation**: drf-spectacular, drf-yasg, or similar (Swagger UI)  
* **Containerization**: Docker with Docker Compose  
* **Optional**: Celery for async tasks

---

## **Data Models**

### **Venue**

* Name (translatable)  
* Address (translatable)  
* Description (translatable)  
* Price per hour  
* Images (list of URLs)  
* Amenities (list, translatable)  
* Active status  
* Timestamps (created, updated)

### **User**

* Phone number (unique, format: \+998XXXXXXXXX)  
* Name  
* Active status  
* Verified status  
* Timestamp (created)

### **Booking**

* User reference  
* Venue reference  
* Booking date  
* Start time  
* End time  
* Total price  
* Status (pending, confirmed, cancelled, completed)  
* Timestamps (created, updated)

---

## **API Endpoints**

### **Authentication**

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| POST | `/api/auth/send-otp/` | Send OTP to phone number |
| POST | `/api/auth/verify-otp/` | Verify OTP and receive JWT tokens |
| POST | `/api/auth/complete-registration/` | Complete first-time registration (set name + password after OTP verification) |
| POST | `/api/auth/login/` | Login with phone number + password |
| POST | `/api/auth/login-otp/` | Login with OTP as an alternative to password |
| POST | `/api/auth/logout/` | Logout current session/device (invalidate refresh token) |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/auth/me/` | Get current user profile |
| PATCH | `/api/auth/me/` | Update user profile |

### **Venues**

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| GET | `/api/venues/` | List all venues with pagination and filters |
| GET | `/api/venues/{id}/` | Get single venue details |
| GET | `/api/venues/{id}/availability/` | Get available time slots for a specific date |

### **Bookings**

| Method | Endpoint | Description |
| ----- | ----- | ----- |
| GET | `/api/bookings/` | List current user's bookings |
| POST | `/api/bookings/` | Create new booking |
| GET | `/api/bookings/{id}/` | Get booking details |
| PATCH | `/api/bookings/{id}/cancel/` | Cancel a booking |

---

## **Functional Requirements**

### **Authentication & Session Flow (Hybrid: Password + OTP)**

#### **First-time user flow (registration)**

* User enters phone number and requests OTP  
* OTP is verified  
* System checks if user is new (no password set yet)  
* New user must complete registration by providing:  
   * `name`  
   * `password`  
* After successful registration, authentication tokens are issued and user is logged in

#### **Returning user flow (login)**

User can choose one of two login options:

1. **Phone number + password**  
2. **Phone number + OTP**

Both login methods must return access + refresh tokens and authenticated user profile.

#### **Logout & session handling**

* Implement logout endpoint that invalidates the submitted refresh token (JWT blacklist)  
* Frontend must clear local auth state/tokens on logout  
* Support normal refresh-token session lifecycle (access rotation via refresh)

#### **OTP-specific requirements (kept)**

* Accept phone number and send OTP (mock SMS by logging OTP to console)  
* Store OTP in Redis with 5-minute expiration  
* Implement rate limiting: maximum 3 OTP requests per phone number per 10 minutes

### **Venue Management**

* Full CRUD operations (Create, Update, Delete restricted to admin)  
* List endpoint with pagination (10 items per page)  
* Filter by price range  
* Search by venue name  
* Multi-language support for name, address, and description fields

### **Booking System**

* Check venue availability before allowing booking  
* Prevent double booking for same time slot  
* Automatically calculate total price based on duration and hourly rate  
* Validate booking time (example: only allow bookings between 9 AM and 10 PM)  
* Users can only view and cancel their own bookings  
* Only pending or confirmed bookings can be cancelled

### **Admin Panel**

* Django admin interface for all models  
* Venue management with ability to add/edit images  
* Booking management with status update functionality  
* User management and verification  
* Translation management for multilingual fields

---

## **Internationalization (i18n)**

Support three languages in API responses:

* Uzbek \- `uz`  
* Russian \- `ru`  
* English \- `en`

Requirements:

* Accept `Accept-Language` header to determine response language  
* Translatable fields: venue name, address, description, amenities  
* Admin interface must support entering translations  
* Default language: Russian

---

## **Security Requirements**

* JWT authentication with access and refresh tokens  
* Password-based login support (secure password hashing using Django auth system)  
* Rate limiting on authentication endpoints  
* Input validation and sanitization on all endpoints  
* Proper CORS configuration  
* All secrets stored in environment variables  
* Use Django ORM to prevent SQL injection

---

## **Detailed Implementation Structure for New Auth Feature**

### **Backend changes**

1. **User model / auth rules**
   * Keep phone number as primary login identifier  
   * Ensure password can be set for phone-authenticated users  
   * Add helper flag/logic to detect whether registration is fully completed

2. **Serializers**
   * `CompleteRegistrationSerializer` (`phone_number`, `name`, `password`)  
   * `PasswordLoginSerializer` (`phone_number`, `password`)  
   * `OTPLoginSerializer` (`phone_number`, `otp`)  
   * `LogoutSerializer` (`refresh`)

3. **Views / services**
   * `complete-registration`: after OTP verification context, set user name/password securely  
   * `login`: authenticate with phone number + password  
   * `login-otp`: verify OTP and login  
   * `logout`: blacklist refresh token

4. **Permissions & validation**
   * Block password login if registration not completed  
   * Enforce password policy (min length + basic strength)  
   * Preserve ownership and existing API permission behavior

5. **Tests**
   * First-time registration flow test  
   * Password login success/failure tests  
   * OTP login success/failure tests  
   * Logout token blacklist test

### **Frontend changes**

1. **Auth screens**
   * Step 1: phone + OTP flow (existing)  
   * Step 2 (first-time only): complete profile with `name` + `password`  
   * Returning users: login screen with two tabs/modes:  
     * `Phone + Password`  
     * `Phone + OTP`

2. **Auth service/store**
   * Add API methods for complete registration, password login, OTP login, logout  
   * Keep token persistence and refresh behavior  
   * Clear store and redirect on logout

3. **UX rules**
   * Use phone number as the login field label  
   * Show clear mode switch between Password and OTP login  
   * Keep i18n strings for both flows in all supported languages

### **Acceptance criteria for this feature**

* New user must complete `name + password` after first OTP verification  
* Returning user can login with either password or OTP  
* Logout invalidates refresh token and ends local session  
* Existing OTP behavior remains functional and rate-limited  
* All auth flows are documented in Swagger and README

---

## **Docker Requirements**

Create Docker Compose setup that includes:

* Django application service  
* PostgreSQL database service  
* Redis service

Provide environment variable configuration through .env file.

---

## **Documentation Requirements**

Create a comprehensive README.md including:

1. **Project Description** \- What the API does  
2. **Tech Stack** \- List of all technologies used  
3. **Features** \- Complete list of implemented features  
4. **Architecture** \- Brief system design overview  
5. **Getting Started**  
   * Prerequisites  
   * Environment setup with .env file  
   * Running with Docker  
   * Running locally without Docker  
   * Running database migrations  
   * Creating superuser account  
6. **API Documentation**  
   * Link to Swagger/ReDoc interface  
   * Authentication flow explanation  
   * Example requests and responses for main endpoints  
7. **Admin Panel** \- How to access and use the admin interface  
8. **Internationalization** \- How translations work  
9. **Testing** \- How to run tests  
10. **AI Tools Used** \- Detailed documentation of AI assistance (see below)

---

## **AI Usage Requirement**

**Using AI tools is mandatory** for this task. You must use tools like ChatGPT, Claude, Cursor, GitHub Copilot, or similar.

Document in your README:

* Which AI tools you used  
* What specific tasks you used them for  
* Examples of prompts you used  
* Your personal evaluation of how AI assisted your development

---

## **Deliverables**

* Public GitHub repository  
* Working Docker Compose setup  
* Complete README documentation  
* Swagger UI for API documentation  
* All endpoints fully functional  
* Three languages implemented for translatable fields  
* Admin panel with translation support  
* Seed data script with minimum 10 venues  
* Basic tests for critical endpoints

---

## **Estimated Time: 1 day**

---

## **Reference**

* [Bron24.uz](https://bron24.uz/) \- Use for understanding the domain

---

**Good luck\!**

