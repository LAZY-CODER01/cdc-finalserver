### Backend README File

# **CDC SERVER Backend**

This is the backend service for a coding contest team management system. It allows users to register, log in, manage CRUD operations, create teams, add members, and manage a leaderboard.

---

## **Features**

- User authentication using JWT (JSON Web Tokens).
- Role-based access control (Team Leader, Super Admin).
- CRUD operations for users and teams.
- Leaderboard management by Super Admin.

---

## **Technologies Used**

- **Node.js**: Runtime environment.
- **Express**: Web framework.
- **MongoDB**: Database for storing data.
- **JWT**: Token-based authentication.
- **dotenv**: For managing environment variables.

---

## **Setup Instructions**

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd team-management-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the `.env` file with the following variables:

   ```
   PORT=5000
   MONGO_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_secret_key>
   ```

4. Start the server:

   ```bash
   npm start
   ```

   The server will run at `http://localhost:5000`.

---

## **Endpoints Documentation**

### **Authentication**

#### **1. Register User**
- **Endpoint**: `POST /api/users/register`
- **Description**: Register a new user.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "Team Leader" // or "Member"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Team Leader"
    }
  }
  ```

#### **2. Login User**
- **Endpoint**: `POST /api/users/login`
- **Description**: Authenticate and log in a user.
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "role": "Team Leader"
    }
  }
  ```

---

### **Team Management**

#### **3. Create Team**
- **Endpoint**: `POST /api/teams`
- **Description**: Create a new team (Only accessible to Team Leaders).
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <jwt_token>"
  }
  ```
- **Request Body**:
  ```json
  {
    "name": "Team Alpha"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Team created"
  }
  ```

#### **4. Add Team Member**
- **Endpoint**: `PUT /api/teams/:id/members`
- **Description**: Add a member to a team (Only accessible to Team Leaders).
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <jwt_token>"
  }
  ```
- **Request Body**:
  ```json
  {
    "memberId": "user_id"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Member added"
  }
  ```

---

### **Leaderboard Management**

#### **5. Update Leaderboard**
- **Endpoint**: `PUT /api/leaderboard`
- **Description**: Update the leaderboard rankings (Only accessible to Super Admins).
- **Headers**:
  ```json
  {
    "Authorization": "Bearer <jwt_token>"
  }
  ```
- **Request Body**:
  ```json
  {
    "teamId": "team_id",
    "rank": 1
  }
  ```
- **Response**:
  ```json
  {
    "message": "Leaderboard updated"
  }
  ```

---

## **Middleware**

### **Authentication Middleware**
- **File**: `middleware/auth.js`
- Validates JWT tokens and ensures the user is authenticated.

### **Role Middleware**
- **File**: `middleware/role.js`
- Ensures users have the correct role (e.g., `Team Leader` or `Super Admin`) for specific routes.

---

## **Project Structure**

```
team-management-backend/
├── models/
│   ├── User.js        # User model schema
│   ├── Team.js        # Team model schema
├── routes/
│   ├── userRoutes.js  # Routes for user authentication
│   ├── teamRoutes.js  # Routes for team management
├── middleware/
│   ├── auth.js        # Authentication middleware
│   ├── role.js        # Role-based middleware
├── .env               # Environment variables
├── server.js          # Main entry point
├── package.json       # Dependencies and scripts
```

---

## **Testing with Postman**

1. **Register and Login**:
   - Use the `POST /api/users/register` and `POST /api/users/login` endpoints to create a user and log in.
   - Copy the `jwt_token` from the login response.

2. **Create a Team**:
   - Use the `POST /api/teams` endpoint with the token in the Authorization header.

3. **Add Team Member**:
   - Use the `PUT /api/teams/:id/members` endpoint with the token and the member's ID.

4. **Update Leaderboard**:
   - Use the `PUT /api/leaderboard` endpoint as a Super Admin.

---

## **How to Integrate**

1. **Frontend Integration**:
   - Make API calls from your frontend using tools like Axios or Fetch.
   - Include the JWT token in the `Authorization` header for authenticated requests.

2. **Environment Variables**:
   - Use `.env` to configure the API base URL and secret keys securely.

3. **Deployment**:
   - Host the backend on platforms like Heroku, AWS, or Vercel.
   - Use services like MongoDB Atlas for database hosting.

---

## **Contact**
For any issues or queries, please contact the developer.