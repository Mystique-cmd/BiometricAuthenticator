# BiometricAuthenticator

# Setup.

```
pnpm install
```

# Environment Variables

Add a .env.local file at the root of the directory(Biometric)

```
MONGODB_URI=connection_string
RP_ID=localhost
RP_NAME=My App
EXPECTED_ORIGIN=http://localhost:3000
JWT_SECRET=your_jwt_secret
JWT_TTL=1h
```

# Get Started.

# Auth Flow (Sequence Diagram)

```mermaid
sequenceDiagram
  participant Client
  participant API
  participant WebAuthn
  participant DB as MongoDB

  Note over Client,API: Registration (password + fingerprint)
  Client->>API: POST /auth/register-options {email}
  API->>DB: find user
  API->>WebAuthn: generateRegistrationOptions
  API->>DB: upsert challenge (TTL)
  API-->>Client: {options}
  Client->>WebAuthn: startRegistration(options)
  Client->>API: POST /auth/register-verify {email, password, credential}
  API->>DB: consume challenge
  API->>WebAuthn: verifyRegistrationResponse
  API->>DB: store hashed password + authenticator
  API-->>Client: {verified: true}

  Note over Client,API: Login (fingerprint)
  Client->>API: POST /auth/login-options {email}
  API->>DB: find user + authenticators
  API->>WebAuthn: generateAuthenticationOptions
  API->>DB: upsert challenge (TTL)
  API-->>Client: {options}
  Client->>WebAuthn: startAuthentication(options)
  Client->>API: POST /auth/login-verify {email, credential}
  API->>DB: consume challenge
  API->>WebAuthn: verifyAuthenticationResponse
  API->>DB: update counter
  API-->>Client: set-cookie session=JWT

  Note over Client,API: Login (password fallback)
  Client->>API: POST /auth/login-password {email, password, webauthnUnsupported:true}
  API->>DB: find user
  API-->>Client: set-cookie session=JWT
```
