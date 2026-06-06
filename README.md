
API Documentation
This project runs locally by default at http://localhost:4000
but accepts port if available in .env document

Global Headers
For all protected routes, include these headers in your requests:
Authorization: Bearer TOKEN
Content-Type: application/json

Initial Test Setup

To test the role-based system, create three different users through the sign up route. Because the app does not have a public route to change user roles to moderator after all why will a ordinary user create an admin ludicrous, 
So you must manually update the role field inside MongoDB Compass to user or moderator.

Normal User account details for signup: {
    "firstName": "User",
    "lastName": "Test ",
    "email": "admin.codex4@gmail.com",
    "password": "12345678" /*sorry the password requirements are quite harsh on the frontend lol for front end use @Rhambasque.1 should work*/
}


API Endpoints

1. Public Routes

Home Page: GET /
The expected response is plain text reading Home Page!

Public Message: GET /api/public/message
The response is a JSON object with a public confirmation message.

2. Authentication Routes

Sign Up: POST /api/signUp
Pass firstName, lastName, email, and password in the body. The expected response returns a success message and the new user details.

Sign In: POST /api/signIn
Pass email and password in the body. The expected response returns a success message, user details, and a JWT token.

3. Protected User Routes

User Profile: GET /api/user/profile
This route requires a valid token and is accessible by user, moderator, or admins. The expected response returns the authenticated user data and their role.

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
The expected response returns an array of all submitted reports for the moderator or all reports submitted for admin i.e moderator only your report admin is all reports.

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

String tracker for security operations like FAILED_LOGIN, FORBIDDEN_ACCESS, ACCOUNT_DELETION, or MANUAL_ACCOUNT_LOCK.
user: Optional target account link tracking the associated user ID.
ipAddress: Network string pinpointing where the request originated.
metadata: Extra dynamic data context about the security event.
timestamp: Historical timing log of when the action happened.


THEORETICAL ANSWERS BELOW:-
1. Why is storing password wrong? : i can consider 3 reasons for this  first is in case of database breaches where by some means someone gains access to your data base and sees user passwords maybe from your computer when a database is open on your system and someone unknowingly to u takes a picture after all the best secret is one you don't know secondly a developer might think there is nothing much on his or her website and not fear data breaches but this perspective is wrong since users can use same password for multiple accounts and this can lead to loss of different user assets a judge would require the developer or company where the data breach occured to compensate as you are to expect this occurence finally we have insider threats from other developers and global compliance laws which must be followed
2. authentication vs authorization : authentication deals with identity verification it ensures you are who you say you are real world example is showing your library card in a school setting to prove that yes you are a student of the school it grants entrance while authorization is what exactly you can do or acess a real world example would be something like which college library you can access in the school if you are a colphys student you can only access colphys libraries that is you are unauthorised to acesss others 
3. why is jwt expiration important:- before talking on why jwt expiration is important the first question is what is it and why jwt, JWT is  used for authentication and authorization and you might be wondering why not write a function for it ? first of all writing a function takes time and gives more room for errors secondly it makes it so we don't have to look up user data for every single request a issue i was previously very worried about since data bases can be quite slow to respond. Good now that you understand you should have an idea why it must expire frankly speaking anything that store user data somewhere that is not the database must expire so as to limit vulnerability to the lowest so as to ensure that anyone that obtains this token will not have the time to decipher and utilize it. Also in role based systems with an authority type system it allows higher authority to enforce rules more effectively e.g if the JWT expires a users browser would be forced to refresh or reobtain a JWT which would allow things like account locking and role changes to be applied effectively and prevent funny things like you can't do anything to me if i don't log out.
4. a hacker touches my JWT? I have talked about this a bit above but let me tell you again what i can do to make my JWT useless and not worth the effort for any hacker 1. short token life span like i said above if my JWT expires in 5 mins what exactly can a hacker do with the limited time 2. token revocation : a suspicious token shuld be revoked by the admin so that my api rejects it 3. IP Adress monitoring: your JWT token should only work with a certain ip address i.e only one device can use the JWT i think i implemented this well but sadly i couldn't fully test if it works
5. Why should logging systems be treated as sensitive? Imagine you are a hacker is there any better thing than being able to see and learn why you fail each time obviously we should not give our hackers such convenience secondly sensitive data can sometimes make it to the logs especially during debugging a smart hacker can create a bug and watch the debug logs finally the logs can give quite a thorough understanding on what everything does giving the hacker a sort of map to our infrastructure
   Thanks for reading 
