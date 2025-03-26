const { google } = require('googleapis');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configure Google Drive API
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

// Function to verify file access
async function verifyFileAccess(fileId) {
  try {
    const file = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, owners'
    });
    console.log('File access verified:');
    console.log('File Name:', file.data.name);
    console.log('File ID:', file.data.id);
    console.log('Current Owners:', file.data.owners.map(owner => owner.emailAddress));
    console.log(file.data.pendingOwner)
    return true;
  } catch (error) {
    console.error('File access error:', error.message);
    if (error.message.includes('File not found')) {
      console.log('\nTroubleshooting steps:');
      console.log('1. Make sure the file ID is correct');
      console.log('2. Share the file with the service account email');
      console.log('3. Verify the service account has the correct permissions');
    }
    return false;
  }
}

async function transferOwnershipBetweenEmails(fileId, currentOwnerEmail, newOwnerEmail, pendingOwner) {
  try {
    // First verify file access
    const hasAccess = await verifyFileAccess(fileId);
    if (!hasAccess) {
      throw new Error('Service account does not have access to the file');
    }

    // First, verify the current owner
    const file = await drive.files.get({
      fileId: fileId,
      fields: 'owners'
    });

    const currentOwner = file.data.owners.find(owner => owner.emailAddress === currentOwnerEmail);
    if (!currentOwner) {
      throw new Error(`File is not owned by ${currentOwnerEmail}`);
    }

    // Add the new owner as a writer first
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'writer',
        type: 'user',
        emailAddress: newOwnerEmail,
      },
      fields: 'id',
    });

    // Then, transfer ownership
    await drive.permissions.create({
      fileId: fileId,
      permissionId: currentOwner.permissionId,
      requestBody: {
        role: 'owner',
        transferOwnership: true,
        type: 'user',
        emailAddress: newOwnerEmail,
      },
      fields: 'id, emailAddress, role',
      transferOwnership: true,
    });


    // await drive.pendingOwnershipChanges.create({
    //   fileId: fileId,
    //   requestedOwnerEmailAddress: newOwnerEmail,
    //   fields: 'id',
    // });

    // await drive.pendingActions.update({
    //   fileId: fileId,
    //   removeExpiration: true,
    //   fields: 'id',
    //   requestBody: {
    //     removeExpiration: true,
    //   },
    //   pendingOwner: newOwnerEmail,
    //   transferOwnership: true
    // });

    console.log(newOwnerDetails);
    console.log('Sending ownership transfer email to the new owner...');
    console.log('Ownership transfer initiated...');

    console.log(`Successfully transferred ownership from ${currentOwnerEmail} to ${newOwnerEmail}`);
  } catch (error) {
    console.error('Error transferring ownership:', error.message);
    // console.log('permissions, pendingActions, transferOwnership');
    throw error;
  }
}

// Example usage
async function main() {
  try {
    const fileId = process.env.FILE_ID;
    const currentOwnerEmail = process.env.CURRENT_OWNER_EMAIL;
    const newOwnerEmail = process.env.NEW_OWNER_EMAIL;

    if (!fileId || !currentOwnerEmail || !newOwnerEmail) {
      throw new Error('Please set FILE_ID, CURRENT_OWNER_EMAIL, and NEW_OWNER_EMAIL in your .env file');
    }

    // First verify file access
    const hasAccess = await verifyFileAccess(fileId);
    if (!hasAccess) {
      throw new Error('Cannot proceed with transfer - service account needs access to the file');
    }

    await transferOwnershipBetweenEmails(fileId, currentOwnerEmail, newOwnerEmail);
  } catch (error) {
    console.error('Main error:', error.message);
    process.exit(1);
  }
}

main();