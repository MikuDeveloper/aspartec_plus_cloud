# Aspartec+ Cloud Functions

Trigger functions for Aspartec+ App in order to provide push notifications and more.

## How start?

1. Read [Cloud Functions for Firebase](https://firebase.google.com/docs/functions?hl=es) to understand a bit of this project.
2. To deploy all functions run the command: ```firebase deploy --only functions``` or ```firebase deploy --only functions:nameFunction1,functions:nameFunction2``` to specific the functions to deploy.

## Configuration

If you have iOS users, you must upload the APNs certificate to your Firebase project configuration; otherwise, push notifications will not be able to reach your users.

For Android users, nothing else is required.
