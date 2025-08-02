# ASR Metrics Calculator

This project is a web-based, interactive calculator for Word Error Rate (WER), Keyword Error Rate (KER), and Keyword Recognition Rate (KRR). It serves as a lead magnet, providing developers with a hands-on tool and a free code download.

## Features

- **Interactive Calculator:** Paste reference and hypothesis texts to instantly calculate key ASR metrics.
- **Keyword-Specific Metrics:** Highlight the importance of KER and KRR for business-critical terms.
- **Templates:** Includes pre-made examples for instant demonstrations.
- **Lead Capture:** Integrates with HubSpot via a Vercel Serverless Function to capture leads.
- **Fully Responsive:** Designed with Tailwind CSS for a great experience on any device.

## Getting Started

### 1. Installation

Clone this repository and install dependencies:

```bash
git clone https://github.com/your-username/asr-metrics-calculator.git
cd asr-metrics-calculator
npm install
```

### 2. Running Locally

To start the development server, run:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 3. Deploying to Vercel

1.  Create a new Vercel project and connect it to your Git repository.
2.  Add the necessary environment variables for the HubSpot integration:
    -   `HUBSPOT_API_KEY`: Your private app access token.
3.  Vercel will automatically build and deploy the application on every push to the `main` branch.

## HubSpot Integration

The project includes a serverless function (`api/submit-form.js`) that securely handles form submissions and sends the data to your HubSpot account. You will need to configure your HubSpot `portalId` and `formId` directly in the `submit-form.js` file. 