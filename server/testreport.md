# TableTap Backend - Comprehensive Test Cases & API Execution Report

This report provides a detailed overview of the backend unit testing suite designed and executed for TableTap. It maps service-level unit tests directly to their respective API HTTP endpoints, request payloads, middleware integrations, expected outcomes, and actual execution statuses.

---
``
## 1. Executive Summary

* **Testing Tool**: Vitest (v4.1.7)
* **Total Test Files**: 3
* **Total Executed Tests**: 12
* **Passed Tests**: 11
* **Failed Tests**: 1 (Intentionally simulated/designed to fail for demonstration purposes)
* **System Type Safety**: 100% compliant (`tsc --noEmit` resolved with zero errors)

---

## 2. API Security & Global Middleware Verification

### Rate Limiting Middleware
* **Middleware**: `globalRateLimiter` (`src/middleware/rateLimiter.ts`)
* **Endpoint Protection**: Applied globally to all routes (`app.use(globalRateLimiter)` in `server.ts`).
* **Configuration**:
  * **Window**: 15 minutes (`15 * 60 * 1000` ms)
  * **Threshold**: 100 requests per IP address.
  * **Exceeded Response**: HTTP Status `429 Too Many Requests`
  * **JSON Payload**:
    ```json
    {
      "success": false,
      "error": "Too many requests from this IP, please try again after 15 minutes"
    }
    ```

---

## 3. Detailed Test Cases Matrix

The following table documents each test case, the corresponding API endpoint, controller, input payloads, expected responses, and results:

| Test Suite File | API Endpoint / Context | Controller / Handler | Input Parameters / Payloads | Expected Outcome | Actual Outcome | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`report_demo.test`** | *N/A (Business Math Utility)* | *Internal Math helper* | `basePrice = 12.99`<br>`quantity = 3` | Returns total `38.97` | Returns total `38.97` | **🟢 PASSED** |
| **`report_demo.test`** | *N/A (Verification Failure)* | *Token verification helper* | `isTokenVerified = false` | Assertion: expect `true` | Assertion failed: expected `true` but got `false` | **🔴 FAILED** *(Designed)* |
| **`auth.service.test`** | `POST /api/auth/register` | `registerUserController` | **Body:**<br>`{ "fName": "John", "lName": "Doe", "email": "unique@example.com", "password": "Password123", "role": "USER" }` | HTTP 201 Created<br>`{ "success": true, "message": "User registered..." }` | HTTP 201 Created<br>`{ "success": true, "message": "User registered..." }` | **🟢 PASSED** |
| **`auth.service.test`** | `POST /api/auth/register` | `registerUserController` | **Body:**<br>`{ "email": "existing@example.com", ... }` | HTTP 409 Conflict<br>`{ "success": false, "error": "User already exists" }` | HTTP 409 Conflict<br>`{ "success": false, "error": "User already exists" }` | **🟢 PASSED** |
| **`auth.service.test`** | `POST /api/auth/register` | `registerUserController` | **Body:**<br>`{ "email": "john.fail@example.com", ... }`<br>*Simulated SMTP network error* | HTTP 500 Internal Error<br>`{ "success": false, "error": "Registration Email sent failed..." }`<br>*Triggers DB User delete fallback* | HTTP 500 Internal Error<br>`{ "success": false, "error": "Registration Email sent failed..." }`<br>*Triggers DB User delete fallback* | **🟢 PASSED** |
| **`auth.service.test`** | `POST /api/auth/login` | `loginController` | **Body:**<br>`{ "email": "john.doe@example.com", "password": "Password123" }` | HTTP 200 OK<br>`{ "success": true, "token": "mock_jwt_token" }` | HTTP 200 OK<br>`{ "success": true, "token": "mock_jwt_token" }` | **🟢 PASSED** |
| **`auth.service.test`** | `POST /api/auth/login` | `loginController` | **Body:**<br>`{ "email": "unverified@example.com", "password": "Password123" }`<br>*User DB record exists but is unverified* | HTTP 401 Unauthorized<br>`{ "success": false, "error": "Email not verified..." }` | HTTP 401 Unauthorized<br>`{ "success": false, "error": "Email not verified..." }` | **🟢 PASSED** |
| **`auth.service.test`** | `POST /api/auth/login` | `loginController` | **Body:**<br>`{ "email": "john.doe@example.com", "password": "WrongPassword" }` | HTTP 401 Unauthorized<br>`{ "success": false, "error": "Invalid password" }` | HTTP 401 Unauthorized<br>`{ "success": false, "error": "Invalid password" }` | **🟢 PASSED** |
| **`restaurant.service`** | `POST /api/resturant/create` | `createResturantController`<br>*(Middlewares: `protect('admin')`, `validate`)* | **Headers:** Cookie: `token=valid_admin_token`<br>**Body:** `{ "name": "Tasty Burger", "streetAddress": "123 Main St", "city": "NY", ... }` | HTTP 200 OK<br>`{ "success": true, "message": "Resturant created successfully" }` | HTTP 200 OK<br>`{ "success": true, "message": "Resturant created successfully" }` | **🟢 PASSED** |
| **`restaurant.service`** | `POST /api/resturant/create` | `createResturantController` | **Headers:** Cookie: `token=valid_admin_token`<br>**Body:** `{ ... }`<br>*Database unique constraint exception* | HTTP 500 Internal Error<br>`{ "success": false, "error": "Resturant creation failed" }` | HTTP 500 Internal Error<br>`{ "success": false, "error": "Resturant creation failed" }` | **🟢 PASSED** |
| **`restaurant.service`** | `PATCH /api/resturant/update` | `updateMyResturantController`<br>*(Middlewares: `protect('admin')`, `validate`)* | **Headers:** Cookie: `token=valid_admin_token`<br>**Body:** `{ "name": "Tasty Burger Updated", ... }` | HTTP 200 OK<br>`{ "success": true, "message": "Resturant updated successfully" }` | HTTP 200 OK<br>`{ "success": true, "message": "Resturant updated successfully" }` | **🟢 PASSED** |
| **`restaurant.service`** | `PATCH /api/resturant/update` | `updateMyResturantController` | **Headers:** Cookie: `token=valid_admin_token`<br>**Body:** `{ ... }`<br>*Exception: Record not found in DB* | HTTP 500 Internal Error<br>`{ "success": false, "error": "Resturant update failed" }` | HTTP 500 Internal Error<br>`{ "success": false, "error": "Resturant update failed" }` | **🟢 PASSED** |

---

## 4. Test Execution & Setup

### Environment Prerequisites
* **Runtime**: Node.js v20+
* **Package Manager**: pnpm (v10+)
* **Dependencies**: `vitest`, `express-rate-limit`

### Command to Re-Run Tests
To execute this suite and verify the outputs, open your terminal at `/server` and run:
```bash
pnpm test
```

### Complete Vitest Output Logs
```text
> server@1.0.0 test /Users/pratikdhimal/Developer/TableTap/server
> vitest run

 RUN  v4.1.7 /Users/pratikdhimal/Developer/TableTap/server

 ❯ src/test/report_demo.test.ts (2 tests | 1 failed) 5ms
     ✓ SUCCESS CASE: mathematical operations on pricing should be accurate 1ms
     × FAILURE CASE: simulated verification error (designed to fail for report screenshot) 3ms
 ✓ src/test/restaurant.service.test.ts (4 tests) 3ms
 ✓ src/test/auth.service.test.ts (6 tests) 5ms

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/test/report_demo.test.ts > TableTap Backend - Demo Test Suite for Report > FAILURE CASE: simulated verification error (designed to fail for report screenshot)
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/test/report_demo.test.ts:20:29
     18|     // This assertion will fail to demonstrate the test runner's failure output in the report.
     19|     // It asserts that the unverified token is true, causing a failure.
     20|     expect(isTokenVerified).toBe(true);
       |                             ^
     21|   });
     22| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 Test Files  1 failed | 2 passed (3)
      Tests  1 failed | 11 passed (12)
   Start at  09:13:07
   Duration  247ms
```
