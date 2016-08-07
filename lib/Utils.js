'use strict';

/**
 * This function generates a string uid.
 *
 * @returns {string}    An hexadecimal string representation of an unique
 *                      id made of 80 bits.of entropy.
 */
function generateUid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + s4() + s4() + s4();
}

/**
 * This function serializes an array of UIDs into a format suitable for any
 * text-based protocol or storage.
 *
 * @param {string[]} uidList    - The array of string UIDs to serialize
 *
 * @returns {string}              The serialized UID array in a string form
 *
 */
function serializeUids(uidList) {
    return uidList.join(':');
}

/**
 * This function unserializes an array of UIDs from a string and returns the
 * generated Array.
 *
 * @param {string} stringdata   - The string data of the serialized array of UIDs
 *
 * @returns {string[]}            The unserialized array of string UIDs
 */
function unserializeUids(stringdata) {
    return stringdata.split(':');
}

/**
* This function copies the properties from the source object to the target object
* @param {...object} target - object to be copied to
* @returns {object} - target object
*/
function objectCopy(target) {
    const len = arguments.length;
    for (let i = 1; i < len; ++i) {
        const source = arguments[i];
        const keys = Object.keys(source);
        const keysLen = keys.length;
        for (let j = 0; j < keysLen; ++j) {
            const key = keys[j];
            target[key] = source[key];
        }
    }
    return target;
}

module.exports = {
    generateUid,
    serializeUids,
    unserializeUids,
    objectCopy,
};
