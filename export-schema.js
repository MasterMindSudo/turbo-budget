const admin = require('firebase-admin');

// --- CONFIGURATION ---
// The script will now read credentials from an environment variable.
const serviceAccountString = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

if (!serviceAccountString) {
  console.error('ERROR: The GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set.');
  console.error('Please set it to the content of your Firebase service account JSON file and re-run the script.');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(serviceAccountString);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Failed to parse or initialize Firebase Admin SDK. Please ensure the environment variable contains the valid, unescaped JSON content.', error);
  process.exit(1);
}

const db = admin.firestore();
const schema = {};

/**
 * Infers the data type of a given value.
 * @param {*} value The value to inspect.
 * @returns {string} The inferred data type.
 */
function getDataType(value) {
  if (value instanceof admin.firestore.Timestamp) {
    return 'Timestamp';
  }
  if (value instanceof admin.firestore.GeoPoint) {
    return 'GeoPoint';
  }
  if (value instanceof admin.firestore.DocumentReference) {
    return 'DocumentReference';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  if (value === null) {
    return 'null';
  }
  return typeof value;
}

/**
 * Recursively processes a collection to infer its schema from documents and subcollections.
 * @param {FirebaseFirestore.CollectionReference} collectionRef Reference to the collection.
 * @param {object} currentSchemaLevel The part of the schema object to populate.
 */
async function processCollection(collectionRef, currentSchemaLevel) {
  console.log(`Processing collection: ${collectionRef.path}`);
  const documentsSnapshot = await collectionRef.limit(5).get();

  if (documentsSnapshot.empty) {
    console.log(`  -> Collection is empty or does not exist.`);
    return;
  }

  for (const doc of documentsSnapshot.docs) {
    const docSchema = {};
    const data = doc.data();

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        docSchema[key] = getDataType(data[key]);
      }
    }
    
    // Check for subcollections
    const subcollections = await doc.ref.listCollections();
    for (const subcollectionRef of subcollections) {
      docSchema[subcollectionRef.id] = {};
      await processCollection(subcollectionRef, docSchema[subcollectionRef.id]);
    }
    
    // Use a sample document ID to show the structure
    currentSchemaLevel[`(sampleDoc: ${doc.id})`] = docSchema;
  }
}

async function exportSchema() {
  console.log('Starting schema export...');
  const rootCollections = await db.listCollections();

  for (const collectionRef of rootCollections) {
    schema[collectionRef.id] = {};
    await processCollection(collectionRef, schema[collectionRef.id]);
  }

  console.log('\n--- Schema Export Complete ---');
  console.log('The following JSON represents the inferred schema of your database:');
  console.log(JSON.stringify(schema, null, 2));
  console.log('\nNote: This schema was inferred from a sample of documents and may not be exhaustive.');
}

exportSchema().catch(error => {
  console.error('An error occurred during schema export:', error);
});
