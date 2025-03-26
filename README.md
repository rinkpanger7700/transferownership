# Google Drive Ownership Transfer Tool

This Node.js application automates the process of transferring ownership of Google Drive files to another user.

## Prerequisites

1. Node.js installed on your system
2. Google Cloud Project with Google Drive API enabled
3. Service account credentials from Google Cloud Console

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Google Cloud Project:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Drive API
   - Create a service account and download the credentials JSON file
   - Rename the downloaded credentials file to `credentials.json` and place it in the project root

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the following variables:
     - `FILE_ID`: The ID of the Google Drive file you want to transfer
     - `NEW_OWNER_EMAIL`: The email address of the new owner

## Usage

Run the application:
```bash
npm start
```

## How to Get File ID

1. Open the Google Drive file in your browser
2. The file ID is in the URL: `https://drive.google.com/file/d/{FILE_ID}/view`

## Important Notes

- The service account must have sufficient permissions to transfer ownership
- The new owner must have a Google account
- The file must be shared with the new owner before ownership can be transferred
- The original owner will become an editor after the transfer

## Error Handling

The application includes error handling for common scenarios:
- Missing credentials
- Invalid file ID
- Insufficient permissions
- Network errors

## Security

- Never commit your `credentials.json` or `.env` files
- Keep your service account credentials secure
- Use appropriate scopes for your use case 