# Google Apps Script -- Blood Pressure Readings

This repository is a Google Apps Script project for a Google Sheet.
The script automatically insert the current date and time after the readings (systolic, diastolic, and pulse) are added.
It also inserts a new row after the readings.

The script is written in TypeScript to help with autocompletion and type-safety.
It relies on the https://github.com/google/clasp to transpile the code and pushing it to Google Apps Script.

## Initialization

### Authorizing access to Google Apps Script

Before Clasp can be used, it needs to be authorized to access Google Apps Script.
Use the following command to login and authorize access to Google Apps Script.

```shell
npx clasp login
```

### Clone

After access has been granted, use the following command to clone the Google Apps Script using the ID of script.

```shell
npx clasp clone [scriptId]
```

The cloning should create a [.clasp.json](./.clasp.json).

## Pulling the code

If the Google Apps Script was changed directly, then use the following command to pull the changes.

```shell
npx clasp pull
```

## Updating the code

To update the code, use the following command to push the changes to Google Apps Script.

```shell
npx clasp push
```
