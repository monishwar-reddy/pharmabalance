# PharmaBalance 🧪

**Advanced AI-Driven Drug Discovery & Serverless Load Balancing Platform**

PharmaBalance is a cutting-edge web application designed to simulate and visualize the complex process of pharmaceutical drug discovery. It leverages a simulated serverless architecture to demonstrate efficient load balancing, mass balance optimization, and accurate efficacy testing.
## 🚀 Live Demo

[🔗 Try it out](https://pharmabalance.netlify.app/pharma-main/index.html)


## 🚀 Key Features

*   **🧪 Drug Import & Configuration**: Easily import drug datasets via CSV/JSON or manually configure compound parameters (Complexity, Priority, Expected Efficacy).
*   **📊 Advanced Analysis Dashboard**: Real-time visualization of simulation results using dynamic charts (Mass Balance Distribution, Efficacy vs. Side Effects, Priority Queue Status).
*   **⚖️ Serverless Load Balancer Simulation**: A sophisticated simulation engine that routes drug processing tasks to different "instances" based on computed weights, mimicking real-world cloud scaling.
*   **🔐 Secure Authentication**: Built-in login/register system with session management (simulated via LocalStorage) ensuring only authorized personnel access the dashboard.

## 🛠️ Technology Stack

*   **Frontend**: HTML5, JavaScript (ES6+), CSS3
*   **Styling**: Tailwind CSS (CDN), Custom Glassmorphism UI
*   **Visualization**: Chart.js for data analytics
*   **AI Engine**: Google Gemini API (1.5 Flash)
*   **Icons**: FontAwesome 6, Material Symbols
*   **Persistence**: LocalStorage (Client-side mocking of database)

## 📂 Project Structure

```
pharma-main/
├── index.html          # Public Landing Page
├── login.html          # Authentication Page
├── analysis.html       # Main Dashboard & Analytics
├── import.html         # Drug Data Import Interface
├── main.js             # Core Application Logic
├── analysis.js         # Simulation & Charting Logic
├── auth-check.js       # Security & Session Management
└── config.js           # API Keys (Not included in repo)
```

## ⚙️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/monishwar-reddy/pharmabalance.git
    cd pharmabalance/pharma-main
    ```

2.  **Configure API Key**
    *   Create a file named `config.js` in the root folder.
    *   Add your Google Gemini API key:
        ```javascript
        const config = {
            API_KEY: "YOUR_GEMINI_API_KEY_HERE"
        };
        ```

3.  **Run the Application**
    You can use any local web server. We recommend `http-server`:
    ```bash
    npx -y http-server -p 8080
    ```

4.  **Access the Platform**
    *   Open your browser and navigate to: `http://localhost:8080/`

## 📖 Usage Guide

1.  **Login**: Start from the Home page and click "Login". You can create a new account or use the demo login.
2.  **Import**: Navigate to "Drug Import" to upload sample data or add drugs manually.
3.  **Simulate**: Click "Start Simulation" to run the serverless load balancing algorithm.
4.  **Analyze**: View the "Analysis" dashboard to see how tasks were distributed and scored.
