// A Vercel Serverless Function to securely send form data to HubSpot.

import { URLSearchParams } from 'url';

export default async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Ensure the HubSpot API key is set in Vercel's environment variables
  if (!process.env.HUBSPOT_API_KEY) {
    return res.status(500).json({ message: 'HubSpot API Key not configured.' });
  }

  // Extract form data from the request body
  const { firstname, lastname, company, email } = req.body;
  const HUBSPOT_PORTAL_ID = 'YOUR_HUBSPOT_PORTAL_ID'; // Replace with your Portal ID
  const HUBSPOT_FORM_ID = 'YOUR_HUBSPOT_FORM_ID';   // Replace with your Form ID

  const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;

  try {
    const hubspotFormData = {
      fields: [
        { name: 'firstname', value: firstname },
        { name: 'lastname', value: lastname },
        { name: 'company', value: company },
        { name: 'email', value: email }
      ],
      context: {
        // You can add context like page URL here if needed
      }
    };

    const response = await fetch(hubspotUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}` // Use the private app token
      },
      body: JSON.stringify(hubspotFormData)
    });

    if (response.ok) {
      return res.status(200).json({ message: 'Form submitted successfully!' });
    } else {
      const errorData = await response.json();
      console.error('HubSpot API error:', errorData);
      return res.status(response.status).json({ message: 'Error submitting form to HubSpot.', details: errorData });
    }

  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}; 