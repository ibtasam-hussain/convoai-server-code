
export default function validateEmail(email) {
    // A simple regex for email validation:
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}