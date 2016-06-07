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

/** This function checks if a field name collides with internal data field name
* @param {string} field - field name being logged
*
* @returns {bool} - Returns true if it collides with reserved fields
* and false otherwise
*/
const _reservedFields = new Set([ 'name', 'level', 'time', 'message',
    'req_id', 'hostname', 'elapsed_ms', 'pid', 'tags', '@timestamp' ]);
function _isReservedField(field) {
    return _reservedFields.has(field);
}
/**
* This function copies the properties from the source object to the target object
* @param {...object} target - object to be copied to
* @returns {object} - target object
*/
function objectCopy(target) {
    const result = target;
    let source;
    function copy(f) {
        // do not copy reserved fields
        if (!_isReservedField(f)) {
            result[f] = source[f];
        }
    }
    for (let i = 1; i < arguments.length; i++) {
        source = arguments[i];
        Object.keys(source).forEach(copy);
    }
    return result;
}

module.exports = {
    generateUid,
    serializeUids,
    unserializeUids,
    objectCopy,
};
