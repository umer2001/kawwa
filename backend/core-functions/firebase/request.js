const { Firestore, FieldValue } = require('@google-cloud/firestore');

const firestore = new Firestore({
    databaseId: process.env.FIRESTORE_DB_NAME,
});

class BlendRequest {
    id = null;
    request = null;

    constructor(request) {
        if (request?.id) {
            this.id = request.id;
            this.request = this.getRequest();
        }
        this.request = request;
    }

    createRequest = async () => {
        const docRef = firestore.collection('requests');
        const doc = await docRef.add(this.request);
        this.id = doc.id;
        return doc.id;
    }

    getRequest = async () => {
        const docRef = firestore.collection('requests').doc(this.id);
        const doc = await docRef.get();
        this.request = doc.data();
        return doc.data();
    }

    updateRequest = async (request) => {
        const docRef = firestore.collection('requests').doc(this.id);
        const doc = await docRef.update(request);
        return doc;
    }

    addLog = async (message) => {
        const docRef = firestore.collection('requests').doc(this.id);
        await docRef.update({
            logs: FieldValue.arrayUnion({
                message,
                timestamp: new Date().toISOString(),
            })
        });
    }

    find = async ({ field, operator = "==", value }) => {
        const docRef = firestore.collection('requests');
        return docRef.where(field, operator, value).get().then((snapshot) => {
            const requests = [];
            snapshot.forEach((doc) => {
                requests.push({ id: doc.id, ...doc.data() });
            });
            return requests;
        });
    }
}


module.exports = { BlendRequest, firestore, FieldValue };