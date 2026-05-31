
API Documentation
This project runs locally by default at http://localhost:4000
but accepts port if available in .env

Global Headers
For all protected routes, include these headers in your requests:
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

Initial Test Setup

To test the role-based system, create three different users through the sign up route. Because the app does not have a public route to change user roles to moderator, 
you must manually update the role field inside MongoDB Compass to user or moderator.

Normal User account details for signup: {
    "firstName": "User",
    "lastName": "Test ",
    "email": "admin.codex4@gmail.com",
    "password": "12345678"
}


API Endpoints

1. Public Routes

Home Page: GET /
The expected response is plain text reading Home Page!

Public Message: GET /api/public/message
The expected response is a JSON object with a public confirmation message.

2. Authentication Routes

Sign Up: POST /api/signUp
Pass firstName, lastName, email, and password in the body. The expected response returns a success message and the new user details.

Sign In: POST /api/signIn
Pass email and password in the body. The expected response returns a success message, user details, and a JWT token.

3. Protected User Routes

User Profile: GET /api/user/profile
This route requires a valid token and is accessible by user, moderator, or admin tiers. The expected response returns the authenticated user data and their role.

Get All Users: GET /api/admin/getAllUsers
This route is accessible by admin and moderator tiers only. The expected response returns an array containing all registered users.

4. Moderator Report Routes

Create Report: POST /api/moderator/reports
This route is accessible by moderator tier only. Pass format {
  "contentId": "post_123",
  "contentType": "post",
  "reportType": "spam",
  "description": "Repeated promotional content in the thread",
  "priority": "medium",
  "actionTaken": "flagged for review"
} in the body.
The expected response returns the created report with the status set to open.

Get Reports: GET /api/moderator/reports or /api/admin/reports
The expected response returns an array of all submitted reports.

5. Admin Administrative Routes

Promote User to Admin: POST /api/admin/promote/USER_ID
This route is accessible by admin tier only. Attempting to promote an account that is already an administrator returns an error message.

Delete User: DELETE /api/admin/user/USER_ID
This route is accessible by admin tier only. Self-deletion requests are blocked automatically because admins cannot delete their own accounts.

6. Account Manual Locking

Lock User Account: POST /api/user/USER_ID/lock
This route is accessible by moderator and admin tiers.
A moderator sending an empty body triggers an automatic 1-day lock.
An admin passing durationMinutes locks the user for that specific amount of minutes.
An admin passing a lockUntil ISO timestamp string locks the account until that exact date and time.


Security and Edge Cases

Brute-Force Login Protection

The system tracks consecutive failed login attempts on sign in.
Failed sign in attempts 1 through 4 return an invalid email or password message.
The 5th consecutive failure triggers an automatic account lock for 15 minutes.
Submitting the correct password while the account is locked returns an Account locked message.

Token Validation Errors

Missing Token: Accessing a protected route without a token returns a No token provided message.
Invalid Token: Using a malformed token returns an Invalid token message.
Expired Token: Using an expired token returns a Token expired message asking you to login again.

Database Schema Outline

1. users Collection

firstName and lastName: Strings for profile identification.
email: Unique lowercase string for login identification.
password: Secured bcrypt hash string hidden by default.
role: Access level tracker matching user, moderator, or admin.
failedLoginAttempts: Number counter tracking consecutive failed passwords.
firstFailedLoginAt: Timestamp marking the start of the 10-minute failed-login window.
lockUntil: Timestamp tracking when a login restriction lifts.

2. reports Collection

contentId and contentType: Reference data pointing to the reported item.
reportType and description: Text details explaining the rule infraction.
status and priority: Tracking parameters like open and medium.
moderator: User ID tracking which team member wrote the report.

3. activitylogs Collection

action: String categorization tracker for security operations like FAILED_LOGIN, FORBIDDEN_ACCESS, ACCOUNT_DELETION, or MANUAL_ACCOUNT_LOCK.
user: Optional target account link tracking the associated user ID.
ipAddress: Network string pinpointing where the request originated.
metadata: Extra dynamic data context about the security event.
timestamp: Historical timing log of when the action happened.
