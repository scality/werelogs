'use strict'; // eslint-disable-line strict

/**
 * @constant
 * @type {String[]} - The lookup table to generate the UID
 */
const lut = [];
for (let i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
}

/**
 * This function generates a string uid.
 *
 * The base algorithm is taken from here: http://jcward.com/UUID.js
 * And is explained here: http://stackoverflow.com/a/21963136
 *
 * @returns {string}    An hexadecimal string representation of an unique
 *                      id made of 80 bits.of entropy.
 */
function generateUid() {
    const d0 = Math.random() * 0xffffffff | 0;
    const d1 = Math.random() * 0xffffffff | 0;
    const d2 = Math.random() * 0xffffffff | 0;
    return lut[d0 & 0xff]
        + lut[d0 >> 8 & 0xff]
        + lut[d0 >> 16 & 0xff]
        + lut[d1 & 0xff]
        + lut[d1 >> 8 & 0xff]
        + lut[d1 >> 16 & 0x0f | 0x40]
        + lut[d2 & 0x3f | 0x80]
        + lut[d2 >> 8 & 0xff]
        + lut[d2 >> 16 & 0xff]
        + lut[d2 >> 24 & 0xff];
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
 * @param {string} stringdata - The string data of the serialized array of UIDs
 *
 * @returns {string[]}        - The unserialized array of string UIDs
 */
function unserializeUids(stringdata) {
    return stringdata.split(':');
}

/**
* This function copies the properties from the source object to the target
* object.
*
* @param {...object} target - object to be copied to
* @returns {object} - target object
*/
function objectCopy(target) {
    const result = target;
    /* eslint-disable prefer-rest-params */
    const nb = arguments.length;
    for (let i = 1; i < nb; i++) {
        const source = arguments[i];
        const keys = Object.keys(source);
        const keysNb = keys.length;
        for (let j = 0; j < keysNb; j++) {
            const key = keys[j];
            result[key] = source[key];
        }
    }
    /* eslint-enable prefer-rest-params */
    return result;
}

module.exports = {
    generateUid,
    serializeUids,
    unserializeUids,
    objectCopy,
};
