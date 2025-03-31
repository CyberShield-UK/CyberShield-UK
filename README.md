# CyberShield UK Website

A modern, responsive website for CyberShield UK's cybersecurity services.

## Features

- Responsive design for all devices
- Modern UI with smooth animations
- Contact form with email integration
- Mobile-friendly navigation
- SEO optimized

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Gmail account (for email functionality)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/cybershield-uk/CyberShield-UK.git
cd CyberShield-UK
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
- Set your Gmail credentials for the contact form
- Configure the server port if needed

## Development

To run the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:5000`

## Production

To build and run the production server:

```bash
npm run build
npm start
```

## Project Structure

```
cybershield-uk/
├── public/              # Static files
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   └── images/         # Image assets
├── src/                # Source files
│   ├── components/     # React components
│   ├── pages/         # Page components
│   └── styles/        # SCSS styles
├── server.js          # Express server
├── package.json       # Project dependencies
└── README.md         # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Contact

CyberShield UK - [contact@cybershield-uk.com](mailto:contact@cybershield-uk.com)

Project Link: [https://github.com/cybershield-uk/CyberShield-UK](https://github.com/cybershield-uk/CyberShield-UK) 