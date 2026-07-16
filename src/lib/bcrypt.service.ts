import bcrypt from 'bcrypt';

/**
 * never store plain text passwords
 * For full-stack authentication flow we use bcrypt (hashing password) and jwt (token generation) [jwt is execution is covered in 'jwt.service.ts' file]
 * bcrypt:
 * - securely hashes and verifies passwords in your db
 * - designed to be computatinallyintensive and slow, making it more resistent to brute-force attacks
 * - What happens here?
 * -- a random string (salt) is first added to password and then bcrypt hashes the whole string of the combined salt and password
 * -- then, the hashing cycle/round is repeated accoding to the number of salt rounds 
 * - - Round 1: Has(Password + Salty String) -> Hash1
 * - - Round 2: Hash(Hash1 + Salty String) -> Hash2
 * - - Round n: Hash(Hash n-1 + Salty String) -> FinalHash
 */

const saltRounds = process.env.SALT_ROUNDS
    ? parseInt(process.env.SALT_ROUNDS)
    : 11

export const BcryptService = {
    //hashpassword with bcrypt
    hashPassword: async (password: string): Promise<string> => {
        return bcrypt.hash(password, saltRounds);
    },

    //compare entered password with hashPassword
    comparePassword: async (password: string, hashPassword: string) => {
        return bcrypt.compare(password, hashPassword);
    },
}

//for environment (.env) variables to read properly, you can run the below to ensure things like process.env.JWT_SECRETS successfully feads from your .env file anywhere
// npx tsx --env-file=.env index.ts
//this will flag at runtime