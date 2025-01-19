# IronCloak - Your Very Own Password Manager

IronCloak is a password management application built using React. It allows users to securely store and manage their passwords using the browser's local storage.

## Features

- **Secure Password Storage**: Store passwords securely in your browser's local storage.
- **Add and Manage Passwords**: Easily add, update, and delete stored passwords.
- **User-Friendly Interface**: Simple and intuitive design for a smooth user experience.
- **Client-Side Storage**: No external database required; all data is stored locally on the user's device.

## Installation

Follow these steps to set up the project on your local machine:

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/)

### Steps

1. **Clone the Repository**

    ```bash
    git clone https://github.com/rohitghosh1763/IronCloak.git
    cd ironcloak
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

    Or if you are using Yarn:

    ```bash
    yarn install
    ```

3. **Set Up MongoDB Connection**

    Locate the configuration file (usually `.env` or `config.js`) in the root of your project. Change the `MONGO_URI` variable to the desired address of your MongoDB server:

    ```env
    MONGO_URI=mongodb://<username>:<password>@<host>:<port>/<database>
    ```

    Replace `<username>`, `<password>`, `<host>`, `<port>`, and `<database>` with your MongoDB server's credentials and details.

4. **Start the Development Server**

    ```bash
    npm run dev
    ```

    Or with Yarn:

    ```bash
    yarn dev
    ```

5. **Access the Application**

   Open your browser and navigate to the URL displayed in the terminal (usually `http://localhost:5173`) to use IronCloak.

## Usage

- Add a new password by providing the required details and saving it.
- View, edit, or delete passwords directly from the dashboard.
- All changes are stored in your browser's local storage and persist across sessions.

## Technologies Used

- **Frontend**: React, Tailwind CSS, Vite
- **Storage**: Local Storage

## Contribution

If you'd like to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix:
    ```bash
    git checkout -b feature-name
    ```
3. Commit your changes and push the branch:
    ```bash
    git commit -m "Add feature description"
    git push origin feature-name
    ```
4. Create a pull request on the main repository.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

Feel free to customize and improve IronCloak to suit your needs. Happy coding!
