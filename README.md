# Venue Booking Backend API

A REST API backend for a venue/spot booking application inspired by [Bron24.uz](https://bron24.uz/). The system includes user authentication via OTP, venue management, and booking functionality with a full admin panel.

## Tech Stack

- **Language**: Python 3.11+
- **Framework**: Django 5.0+
- **API**: Django REST Framework
- **Database**: PostgreSQL 15
- **Cache/OTP Storage**: Redis 7
- **Internationalization**: django-modeltranslation
- **API Documentation**: drf-spectacular (Swagger UI & ReDoc)
- **Containerization**: Docker with Docker Compose
- **Authentication**: JWT (SimpleJWT)

## Features

- **OTP Authentication**: Phone number-based authentication with OTP verification
- **Venue Management**: Full CRUD with multi-language support (Uzbek, Russian, English)
- **Booking System**: Create, view, and cancel bookings with availability checking
- **Admin Panel**: Django admin with translation support
- **API Documentation**: Interactive Swagger UI and ReDoc
- **Rate Limiting**: Protection against abuse on authentication endpoints
- **Docker Support**: Complete Docker Compose setup for easy deployment

## Getting Started

### Prerequisites

- Docker and Docker Compose
- OR Python 3.11+ and PostgreSQL 15+, Redis 7+

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd venue-booking-backend
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your settings (for production, change SECRET_KEY).

### Running with Docker (Recommended)

1. Build and start the containers:
```bash
docker-compose up --build
```

2. The API will be available at `http://localhost:8000`

3. Create a superuser:
```bash
docker-compose exec web python manage.py createsuperuser
```

### Running Locally (Without Docker)

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements/development.txt
```

3. Update `.env` with local database settings:
```
POSTGRES_HOST=localhost
REDIS_URL=redis://localhost:6379/0
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

### Running Database Migrations

```bash
# With Docker
docker-compose exec web python manage.py migrate

# Without Docker
python manage.py migrate
```

## API Documentation

Once the server is running, access the API documentation at:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

### Authentication Flow

1. **Send OTP**: `POST /api/auth/send-otp/`
   ```json
   {
     "phone_number": "+998901234567"
   }
   ```
   OTP will be logged to the console (mock SMS).

2. **Verify OTP**: `POST /api/auth/verify-otp/`
   ```json
   {
     "phone_number": "+998901234567",
     "otp": "123456"
   }
   ```
   Returns access and refresh JWT tokens.

3. **Use Access Token**: Include in headers:
   ```
   Authorization: Bearer <access_token>
   ```

4. **Refresh Token**: `POST /api/auth/refresh/`
   ```json
   {
     "refresh": "<refresh_token>"
   }
   ```

### Example Requests

**List Venues with Filters:**
```bash
curl -X GET "http://localhost:8000/api/venues/?min_price=50000&search=sport" \
  -H "Accept-Language: uz"
```

**Create Booking:**
```bash
curl -X POST "http://localhost:8000/api/bookings/" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "venue": 1,
    "booking_date": "2026-02-15",
    "start_time": "10:00",
    "end_time": "12:00"
  }'
```

## Admin Panel

Access the Django admin at: http://localhost:8000/admin/

Features:
- User management with verification status
- Venue management with inline translation editing
- Booking management with status update actions
- Image preview for venues

## Internationalization

The API supports three languages:
- **Russian (ru)** - Default
- **Uzbek (uz)**
- **English (en)**

Set the language using the `Accept-Language` header:
```
Accept-Language: uz
```

Translatable fields:
- Venue: name, address, description

## Testing

Run tests with pytest:
```bash
# With Docker
docker-compose exec web pytest

# Without Docker
pytest

# With coverage
pytest --cov=apps --cov-report=html
```

## Project Structure

```
venue-booking-backend/
├── apps/
│   ├── users/          # User model & OTP authentication
│   ├── venues/         # Venue management
│   └── bookings/       # Booking system
├── config/
│   ├── settings/       # Django settings (base, development, production)
│   ├── urls.py         # Root URL configuration
│   └── wsgi.py
├── core/               # Shared utilities, exceptions, permissions
├── docker/             # Docker configuration
├── requirements/       # Python dependencies
├── docker-compose.yml
├── manage.py
└── README.md
```

## AI Tools Used

This project was built with assistance from:

- **GitHub Copilot (Claude)**: Used for:
  - Project structure planning and architecture design
  - Code generation for models, serializers, and views
  - Docker configuration
  - Documentation writing

## License

MIT License
