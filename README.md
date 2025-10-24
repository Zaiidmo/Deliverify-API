# 🚚 Deliverify API

The **Deliverify API** powers the Deliverify delivery management ecosystem — handling authentication, deliveries, users, and roles.  
It’s built with **Node.js**, **Express.js**, and **MongoDB**, with full JWT-based security and over 130 Jest test cases for reliability.

<p align="left">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18.x-green">
  <img alt="Express.js" src="https://img.shields.io/badge/Express.js-Backend-black">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Database-brightgreen">
  <img alt="Jest" src="https://img.shields.io/badge/Testing-Jest-red">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue">
</p>

---

## Prerequisites

Before setting up this API, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (as the database)
- [Postman](https://www.postman.com/) (for testing the API)
- [npm](https://www.npmjs.com/) (Node Package Manager)

---

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/Zaiidmo/deliverify-API.git
   cd deliverify-API
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

---

## Environment Variables

You need to set up environment variables in a `.env` file at the root of your project. Create a `.env` file based on the `.env.example`:

```bash
cp .env.example .env
```

Then update the `.env` file with the needed variables

## Running the API

Start the development server:

```bash
node server
```

The API will run on `http://localhost:3000`.

---

## API Endpoints

**Documentation**
Please check the official API documentation to get to know all functionnalities and endpoints, on the following link
[Documentation](https://documenter.getpostman.com/view/32635893/2sAY4rFkfi)

## Authentication

The **Deliverify API** uses **JWT (JSON Web Tokens)** for securing its endpoints.

1. **Login** to receive a JWT:

   ```bash
   POST /auth/login
   ```

   Use the JWT received in the response for all protected routes by including it in the `Authorization` header:

   ```
   Authorization: Bearer <your_token>
   ```

2. **Token Verification** is done automatically by middleware for protected routes.

---

## Testing

The API has been tested using [Jest](https://jestjs.io/). To run the test suites:

```bash
npm test
```

Tests include:

- Authentication tests.
- Role management tests.
- User and delivery operations.
- Error handling tests.
  Any many others of a count of 32 Test Suite, almost 132 tests

---

## Error Handling

The API uses consistent error handling. Errors are returned with appropriate HTTP status codes and JSON response structure:

- **400 Bad Request**: Returned when a request is malformed.
- **401 Unauthorized**: Returned when authentication fails (e.g., missing or invalid JWT).
- **404 Not Found**: Returned when a resource (e.g., user, order) is not found.
- **500 Internal Server Error**: Returned when a server-side error occurs.

---

## Contributing

[CONTRIBUTING](CONRTIBUTING.md)

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---
