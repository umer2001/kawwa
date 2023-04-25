## Deployment

### Functions

To deploy a new function

```bash
  gcloud functions deploy < function-name > --runtime=nodejs14 --trigger-< trigger type > --allow-unauthenticated --entry-point=< function-name in code > --source=< path to folder where functions.js file is located >

```

### Common Triggers

- `--trigger-http`: The function is triggered by an HTTP request.

- `--trigger-topic`: The function is triggered by a message published to a Cloud Pub/Sub topic.

- `--trigger-bucket`: The function is triggered by a file uploaded to a Cloud Storage bucket.
