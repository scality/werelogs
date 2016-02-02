'use strict';

/**
 * This function generates a string uid.
 *
 * @return uid {string} An hexadecimal string representation of an unique id
 *                      made of 80 bits.of entropy.
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
 * @param {Array[string]} The array of string UIDs
 *
 */
function serializeUids(uidList) {
    return uidList.join(':');
}

/**
 * This function unserializes an array of UIDs from a string and returns the
 * generated Array.
 *
 * @param {string} The string data of the serialized array of UIDs
 *
 * @returns {Array[string]} The unserialized array of string UIDs
 */
function unserializeUids(stringdata) {
    return stringdata.split(':');
}

module.exports = {
    generateUid,
    serializeUids,
    unserializeUids,
};
