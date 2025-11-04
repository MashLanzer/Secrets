# Social App

A modern, responsive social web application built with Firebase and vanilla JavaScript.

## Features

- User authentication (Email/Password and Google Sign-In)
- Secret sharing functionality
- User profiles
- Responsive design
- Real-time data synchronization

## Project Structure

```
social-app/
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   └── modules/
│   │       ├── auth.js
│   │       ├── profile.js
│   │       ├── social.js
│   │       ├── ui.js
│   │       ├── utils.js
│   │       └── validation.js
│   └── images/
│       ├── placeholder.jpg
│       └── favicon.ico
├── index.html
├── firebase.json
└── firestore.rules
```

## Getting Started

1. Clone the repository
2. Update the Firebase configuration in `assets/js/firebase-config.js` with your own credentials
3. Deploy to Firebase Hosting or run locally

## Firebase Configuration

To use this application, you need to:

1. Create a Firebase project at https://console.firebase.google.com/
2. Copy your project's configuration details
3. Replace the configuration in `assets/js/firebase-config.js`

## Deployment

To deploy this application:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize the project: `firebase init`
4. Deploy: `firebase deploy`

## Technologies Used

- Firebase (Authentication, Firestore, Hosting)
- HTML5
- CSS3
- Vanilla JavaScript (ES6+ modules)
- Responsive design principles

## License

This project is open source and available under the MIT License.