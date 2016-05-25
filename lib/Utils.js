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
* This function copies the properties from the source object to the fields map
* @param {map} fields - Map of log entry fields
* @param {object} source - object to copy from
* @returns {map} - map object containing the copied fields
*/
function copyFields(fields, source) {
    Object.keys(source).forEach(f => {
        fields.set(f, source[f]);
    });
    return fields;
}

module.exports = {
    generateUid,
    serializeUids,
    unserializeUids,
    copyFields,
};
