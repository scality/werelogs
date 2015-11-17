/**
 * This function generates a string uid.
 *
 * @return uid {string} An hexadecimal string representation of an unique id
 *                      made of 80 bits.of entropy.
 */
export function generateUid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + s4() + s4() + s4();
}
