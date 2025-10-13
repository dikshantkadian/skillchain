Skillchain: A Decentralized Credentialing Platform
Skillchain is a full-stack, blockchain-powered application designed to revolutionize how skill credentials and certificates are issued, stored, and verified. By leveraging the immutability of the blockchain and the permanence of decentralized storage (IPFS), Skillchain creates a single source of truth for achievements, eliminating fraud and simplifying the verification process for institutions, students, and recruiters.

This project was built for a hackathon and demonstrates a complete, end-to-end, professional-grade Web3 application architecture.

✨ Core Features
Role-Based Access Control: A secure system with three distinct user roles:

Institutions: Can securely log in to issue new certificates for their students.

Students: Can log in to view a personal, consolidated dashboard of all their verified credentials.

Recruiters: Can instantly verify the authenticity of any certificate using its unique file hash.

Decentralized File Storage: Certificate files (PDFs/images) are not stored on a traditional server. They are uploaded to IPFS (InterPlanetary File System) via Pinata, ensuring the file itself is permanent, censorship-resistant, and verifiable by its content hash (CID).

Immutable On-Chain Proof: When a certificate is issued, its essential metadata and IPFS CID are recorded on the Sepolia Testnet via a custom Solidity smart contract. This creates a permanent, tamper-proof public record that serves as the ultimate source of truth.

Secure Authentication: A robust authentication system using email/password and JSON Web Tokens (JWT). Passwords are never stored in plain text; they are securely hashed using bcrypt.

Comprehensive API: A professional backend API built with NestJS that handles all business logic, from user management to blockchain transactions and IPFS uploads.

🏛️ Architecture Deep Dive
Skillchain is built on a modern, separated monorepo structure, promoting clean code and independent deployment workflows for each part of the application.

1. The Frontend (/frontend)
Framework: React (with Vite)

A lightning-fast Single-Page Application (SPA) that provides a seamless and reactive user experience for all three user roles.

Logic: Manages user state, login sessions (using JWTs stored in localStorage), and handles all API communication with the backend. It dynamically renders the correct dashboard based on the logged-in user's role.

2. The Backend (/backend)
The core engine of the application, built with a professional, modular architecture.

Framework: NestJS (on Node.js)

Provides a scalable and maintainable structure for the API, using modules for each feature (Auth, Users, Certificates).

Database & ORM: PostgreSQL (hosted on Vercel) with Prisma

Prisma serves as a next-gen, type-safe ORM for all database interactions. The database stores user profiles and certificate metadata (like hashes and IDs) for fast data retrieval.

Authentication: Passport.js

Implements a secure local strategy for email/password validation and a jwt strategy for protecting secure endpoints. bcrypt is used for password hashing.

Blockchain Interaction: Ethers.js

The backend's secure "company wallet" (with its private key stored as a server-side environment variable) uses Ethers.js to connect to the Sepolia network (via Alchemy) and call the smart contract functions. The backend sponsors all gas fees, creating a frictionless UX.

Decentralized Storage: Pinata & IPFS

When an institution uploads a file, the backend uses the Pinata API to pin the file to IPFS, receiving a permanent CID in return.

3. The Smart Contract (/contracts)
The ultimate source of trust in the system.

Language: Solidity

Framework: Hardhat

A professional development environment used for compiling, testing, and deploying the smart contract.

Functionality: The Skillchain.sol contract contains a struct to define the on-chain data for a certificate and a secure issueCertificate function that can only be called by the owner (our backend's wallet). It permanently records the certificate's title, description, student address, and its IPFS CID on the blockchain.

⚙️ End-to-End Workflow: Certificate Issuance
An Institution logs in via the React frontend, receiving a JWT.

The Institution fills out the "Issue Certificate" form, providing the student's email, certificate details, and uploads a PDF file.

The frontend sends a secure, multipart/form-data API request to the backend, including the JWT in the Authorization header.

The NestJS Backend receives the request:
a. The AuthGuard verifies the JWT, confirming the user is an authenticated Institution.
b. The CertificatesService validates the student's existence in the PostgreSQL database via Prisma.
c. The service uploads the file to IPFS via the Pinata API, receiving an ipfsCid.
d. The service calls the issueCertificate function on the Solidity Smart Contract using Ethers.js, passing the certificate details and the ipfsCid. The backend's wallet pays the gas fee.
e. After the transaction is confirmed, the service receives a transactionHash.
f. The service saves a complete record of the certificate (including ipfsCid and transactionHash) to the PostgreSQL database.

The backend returns the complete certificate object to the frontend, which displays a success message with links to the IPFS file and the Etherscan transaction.
