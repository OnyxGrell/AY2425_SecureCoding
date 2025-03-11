# Secure Coding Assignment - Snapsell Web Application
 AY2425 Secure Coding Assignment

 This project is a vulnerability assessment and mitigation exercise performed on the Snapsell web application. The security evaluation follows the OWASP Top 10 (2021), identifying critical security flaws and implementing secure coding practices to mitigate them.

 The final program has been patched from the original source code given by the school.
 
## Setting up the program
 Configure the backend server:
 In the root directory of the program folder, run the following commands
 ```js
 cd /Backend
 npm i
 npm run start
 ```

 Configure the frontend server:
 In the root directory of the program folder, run the following commands
 ```js
 cd /Frontend
 npm i
 npm run start
 ```

 Setting up .env:
 Create the .env file in the /Backend folder
 ```
 JWT_SECRET_KEY=""
 JWT_EXPIRES_IN=1m || Any duration
 JWT_ALGORITHM=HS256 || Any algorithm
 ```

 Run the application by navigating to `https://localhost:3001/loginpage.html`
 
 ## OWASP Top 10 (2021) Vulnerabilities and fixes
 
 ### Broken Access Control (A01:2021)
**Vulnerability:**  
Users could edit/delete other users' listings due to missing authentication checks.

**Fix:**  
- Implemented **JWT-based authentication & authorization middleware**.

### Injection (A03:2021)
**Vulnerability:**  
SQL Injection via search bar and Stored XSS in listing fields.

**Fix:**  
- Used **parameterized queries** to prevent SQL Injection.  
- Implemented **input sanitization** with **RegEx** to prevent XSS attacks.

### Identification & Authentication Failures (A07:2021)
**Vulnerability:**  
Plaintext password storage and weak/default passwords allowed.

**Fix:**  
- Enforced **bcrypt hashing** for password storage.  
- Implemented **password strength validation** using **RegEx**.

### Cryptographic Failures (A02:2021)
**Vulnerability:**  
Hardcoded JWT secret key and plaintext login credentials transmitted over HTTP.

**Fix:**  
- Moved **JWT secret key to environment variables**.  
- Enabled **HTTPS with OpenSSL certificates** for **encrypted communication**.

### Security Logging & Monitoring Failures (A09:2021)
**Vulnerability:**  
No logging for authentication attempts or sensitive actions.

**Fix:**  
- Implemented **Winston & Morgan logging libraries** for **audit trails**.  
- Logged **failed login attempts, unauthorized access, and high-value transactions**.
 
