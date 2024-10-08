# E-commerce Node.js Application

## Introduction

This is a simple e-commerce application built with Node.js. This guide will walk you through setting up the project, installing dependencies, and running the development server.

## Prerequisites

- Node.js installed on your machine
- npm (Node Package Manager)

## Setup

### 1. Clone the Node.js Project

Open your terminal and navigate to the project directory. Run the following command to clone this Node.js project:

```bash
git clone https://github.com/YashRevdiwala/ecommerce-node-app.git
```

### 2. Install Dependencies

Install the necessary dependencies for the project from package.json:

```bash
npm install
```

### 3. Configure `package.json` (Optional)

Open the `package.json` file and add custom scripts for starting the server and running the development server:

```json
"scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
}
```

## Running the Server

### 1. Start the Development Server

To start the development server with `nodemon`, run:

```bash
npm run dev
```

### 2. Start the Production Server

To start the production server, run:

```bash
npm start
```
