const characters = "ABCEFGHIJKLMNOPQRTUVWYZabcdefghijlmnoqrstuvwxyz1234567890";

//if no length value is provided, then default length of 6 is given (used for confirmation codes)
export function generateRandomString(length: number = 6): string {
    let result = "";

    for (let i = 0; i < length; ++i) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}