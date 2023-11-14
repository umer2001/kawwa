export const toFormData = (payload) => {
    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
        if (payload[key] !== null && payload[key] !== undefined) {
            if (Array.isArray(payload[key])) {
                payload[key].forEach((value) => formData.append(key, value));
            } else {
                formData.append(key, payload[key]);
            }
        }
    });
    return formData;
};