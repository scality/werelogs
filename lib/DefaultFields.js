'use strict'; // eslint-disable-line strict

const Utils = require('./Utils.js');
const objectCopy = Utils.objectCopy;

/**
 * This class manages the internal `default fields` for logging classes, with a
 * notion of parent/child relationships and hierarchy.
 * A Child element will inherit the fields from the Parent element, and
 * complete (or even override part of it) with its own fields. For instance,
 * a child can redefine (and thus override in the final result) a field that is
 * already defined by its parent.
 *
 * This class shall be used embedded within loggers, to provide the `Default
 * fields` and hierarchy logics.
 *
 * @private @property {DefaultFields} parent     - The parent node in the
 *                                                 hierarchy
 * @private @property {DefaultFields[]} children - The list of children nodes
 *                                                 in the hierarchy
 * @private @property {Object} fields            - The dictionary of fields
 *                                                 defined for this node
 * @private @property {Object} parentFields      - The dictionary of fields
 *                                                 inherited by this node from
 *                                                 its parent node
 * @private @property {Object} precomputedFields - The prepared dictionary of
 *                                                 aggregated fields containing
 *                                                 the parent's fields
 *                                                 overriden with the node's
 *                                                 own fields. This is used as
 *                                                 a trick to reduce the
 *                                                 computational need.
 *
 * @mixin
 */
class DefaultFields {
    constructor() {
        this.parent = null;
        this.children = [];
        this.fields = {};
        this.parentFields = {};
        this.precomputedFields = {};
    }

    /**
     * Add a node to the list of children of the current node, effectively
     * making it one of the node's children.
     *
     * @param {DefaultFields} child - The node to add as a child of the current
     *                                node
     *
     * @return {undefined}
     */
    _dfRegisterChild(child) {
        this.children.push(child);
        this._dfNotifyChild(child);
    }

    /**
     * Remove a node from the list of children of the current node, effectively
     * cutting off the relationship between the two.
     *
     * @param {DefaultFields} toRemove - The node to remove from the list of
     *                                   children of the current node.
     *
     * @return {undefined}
     */
    _dfUnregisterChild(toRemove) {
        this.children = this.children.filter(child => child !== toRemove);
    }

    /**
     * Utility function to notify one child node of an update of the node's
     * precomputed fields.
     *
     * @param {DefaultField} child - The child node to notify
     *
     * @return {undefined}
     */
    _dfNotifyChild(child) {
        child._dfSetParentFields(this.precomputedFields);
    }

    /**
     * Utility function to notify every children node of an update of the
     * node's precomputed fields.
     *
     * @return {undefined}
     */
    _dfNotifyChildren() {
        this.children.forEach(child => this._dfNotifyChild(child));
    }

    /**
     * This function allows changing the Parent node of the current node,
     * consequently changing the resulting aggregation of the hierarchy of
     * fields. This can be used for a temporary switch of parent node.
     *
     * @param {DefaultFields} parent - The new parent node to set for the
     *                                 current node
     *
     * @return {DefaultFields|null} The previous parent
     */
    setParent(parent) {
        const oldParent = this.parent;
        if (parent === oldParent) {
            return oldParent;
        }
        if (oldParent) {
            oldParent._dfUnregisterChild(this);
        }
        this.parent = parent || null;
        if (this.parent) {
            this.parent._dfRegisterChild(this);
        } else {
            this._dfSetParentFields();
        }
        return oldParent;
    }

    /**
     * Internal function to partially recompute the precomputedFields through
     * inclusion of the newly defined fields into the precomputed ones. This
     * inclusion may override some already defined fields.
     *
     * This function shall always be the last one called when updating the
     * internal fields, as it also triggers the update of the children nodes.
     *
     * @param {Object} newFields - The dictionary of newFields to include into
     *                             the precomputedFields
     *
     * @return {undefined}
     */
    _dfAugmentPrecomputedFields() {
        objectCopy(this.precomputedFields, this.fields);
        this._dfNotifyChildren();
    }

    /**
     * Internal function to update the fields provided by the parent node in
     * the DefaultFields hierarchy. It serves as a notification hook to refresh
     * the precomputed fields depending on the parent node's fields.
     * Two situations may lead to calling this function:
     *  1. The parent node's updated its preComputed fields and notified its
     *     children, including the current node
     *  2. The node reset its own fields, and we must re-compute to remove
     *     obsolete fields previously provided by the current node.
     *
     * @param {Object} parentFields - the precomputedFields from the parent node
     *
     * @return {undefined}
     */
    _dfSetParentFields(parentFields) {
        this.parentFields = parentFields || {};
        this.precomputedFields = objectCopy({}, this.parentFields);
        this._dfAugmentPrecomputedFields();
    }

    /**
     * This function allows to reset the fields managed by the DefaultFields
     * instance. It automatically triggers the re-computation of the
     * precomputed fields, cascading through the node and its children.
     *
     * /!\ This function may lead to an important use of the computational
     * resources if over-used.
     *
     * @return {undefined}
     */
    resetDefaultFields() {
        const oldFields = this.fields;
        this.fields = {};
        // Automatically triggers the recomputation of precomputedFields
        this._dfSetParentFields(this.parentFields);
        return oldFields;
    }

    /**
     * This function allows the user to remove one or more items from the
     * defaultFields's dict.
     *
     * @param {String[]} fields - List of the names of the fields to be removed
     *                            from the internal dictionary of default
     *                            fields
     *
     * @return {Object}           The previous set of default fields
     */
    removeDefaultFields(fields) {
        const toRemove = {};
        fields.forEach(key => {
            toRemove[key] = undefined;
        });
        return this.addDefaultFields(toRemove);
    }

    /**
     * This function allows the user to add default fields to include into all
     * JSON log entries generated through this request logger. As this function
     * attempt not to modify the provided fields object, it copies the field
     * into a new object for safe keeping.
     *
     * @param {Object} fields   The dictionnary of additional fields to include
     *                          by default for this instance of the
     *                          RequestLogger.
     *
     * @return {Object}        The previous set of default fields (can be
     *                          safely ignored).
     */
    addDefaultFields(fields) {
        const oldFields = this.fields;
        this.fields = objectCopy({}, this.fields, fields);
        this._dfAugmentPrecomputedFields(fields);
        return oldFields;
    }

    /**
     * This function returns the node's precomputed fields, that includes all
     * of its hierarchy's fields and its own. This is intended to retrieve the
     * final form of the fields managed by the object.
     *
     * @return {Object} The precomputed fields to be added to a log entry
     */
    _dfGetFields() {
        return this.precomputedFields;
    }
}

module.exports = DefaultFields;
