'use strict'; // eslint-disable-line strict

const assert = require('assert');

const DefaultFields = require('../../lib/DefaultFields.js');

describe('class DefaultFields', () => {
    describe('Basic Fields logic', () => {
        it('Can get the resulting fields', done => {
            const df = new DefaultFields();
            const fields = df._dfGetFields();
            assert(fields !== null && typeof fields === 'object');
            done();
        });

        it('No fields are set by default', done => {
            const df = new DefaultFields();
            assert.deepStrictEqual(df._dfGetFields(), {});
            done();
        });

        it('Validate defensive coding prevents undefined parentFields',
            done => {
                const df = new DefaultFields();
                df._dfSetParentFields();
                assert.deepStrictEqual(df._dfGetFields(), {});
                done();
            });

        describe('With fields', () => {
            let df = null;
            const fields = {
                name: 'Testing',
                testing: true,
                count: 4,
                data: 'doggy',
            };

            beforeEach(done => {
                df = new DefaultFields();
                df.addDefaultFields(fields);
                done();
            });

            it('Can add a dictionary of new fields', done => {
                assert.deepStrictEqual(df._dfGetFields(), fields);
                done();
            });

            it('Can remove a list of invalid fields', done => {
                df.removeDefaultFields(['invalid', 'notthere']);
                done();
            });

            it('Can remove a list of fields', done => {
                df.removeDefaultFields(['data', 'count']);
                assert.strictEqual(df._dfGetFields().data, undefined);
                assert.strictEqual(df._dfGetFields().count, undefined);
                assert.strictEqual(df._dfGetFields().name, 'Testing');
                assert.strictEqual(df._dfGetFields().testing, true);
                done();
            });


            it('Can reset the fields', done => {
                df.resetDefaultFields();
                assert.deepStrictEqual(df._dfGetFields(), {});
                done();
            });
        });
    });

    describe('Basic Parent-Child logic', () => {
        let parentNode = null;

        beforeEach(done => {
            parentNode = new DefaultFields();
            done();
        });

        function linkedChild(pNode) {
            const childNode = new DefaultFields();
            childNode.setParent(pNode);
            return childNode;
        }

        it('Can set a parent to a node', done => {
            const childNode = linkedChild(parentNode);
            assert.strictEqual(childNode.parent, parentNode);
            assert.notStrictEqual(parentNode.children.indexOf(childNode), -1);
            done();
        });

        it('Can remove a child from a node', done => {
            const childNode = linkedChild(parentNode);
            parentNode._dfUnregisterChild(childNode);
            assert.strictEqual(parentNode.children.indexOf(childNode), -1);
            done();
        });

        it('Can reset the parent of a node (w/ undefined)', done => {
            const childNode = linkedChild(parentNode);
            childNode.setParent(undefined);
            assert.strictEqual(childNode.parent, null);
            assert.strictEqual(parentNode.children.indexOf(childNode), -1);
            done();
        });

        it('Can reset the parent of a node (w/ null)', done => {
            const childNode = linkedChild(parentNode);
            childNode.setParent(null);
            assert.strictEqual(childNode.parent, null);
            assert.strictEqual(parentNode.children.indexOf(childNode), -1);
            done();
        });
    });

    describe('Single parent-child relationship', () => {
        let parentNode = null;
        let childNode = null;

        beforeEach(done => {
            parentNode = new DefaultFields();
            childNode = new DefaultFields();
            childNode.setParent(parentNode);
            done();
        });

        it('Child can define its own fields', done => {
            const fields = {
                child: true,
                parent: false,
                test: 1,
            };
            childNode.addDefaultFields(fields);
            assert.deepStrictEqual(childNode._dfGetFields(), fields);
            done();
        });

        it('Parent can define its own fields', done => {
            const fields = {
                child: false,
                parent: true,
                test: 2,
            };
            parentNode.addDefaultFields(fields);
            assert.deepStrictEqual(parentNode._dfGetFields(), fields);
            done();
        });

        it('Child inherits parents fields', done => {
            const fields = {
                child: true,
                parent: false,
                test: 3,
            };
            parentNode.addDefaultFields(fields);
            assert.deepStrictEqual(childNode._dfGetFields(), fields);
            done();
        });

        it('Child inherits successive parent field updates', done => {
            const pFields1 = {
                parent: true,
                test: 4,
            };
            const rFields1 = {
                parent: true,
                test: 4,
            };
            const pFields2 = { child: false };
            const rFields2 = {
                parent: true,
                test: 4,
                child: false,
            };
            const pFields3 = {
                data: 'pouet',
            };
            const rFields3 = {
                parent: true,
                test: 4,
                child: false,
                data: 'pouet',
            };
            parentNode.addDefaultFields(pFields1);
            assert.deepStrictEqual(childNode._dfGetFields(), rFields1);
            parentNode.addDefaultFields(pFields2);
            assert.deepStrictEqual(childNode._dfGetFields(), rFields2);
            parentNode.addDefaultFields(pFields3);
            assert.deepStrictEqual(childNode._dfGetFields(), rFields3);
            done();
        });

        it('Child inherits reset parent fields', done => {
            const pFields = {
                parent: true,
                test: 5,
            };
            parentNode.addDefaultFields(pFields);
            assert.deepStrictEqual(childNode._dfGetFields(), pFields);
            parentNode.resetDefaultFields();
            assert.deepStrictEqual(childNode._dfGetFields(), {});
            done();
        });

        it('Child mixes parent and own fields', done => {
            const pFields = { parent: true };
            const cFields = {
                child: true,
                test: 6,
            };
            const rFields = {
                parent: true,
                child: true,
                test: 6,
            };
            parentNode.addDefaultFields(pFields);
            childNode.addDefaultFields(cFields);
            assert.deepStrictEqual(childNode._dfGetFields(), rFields);
            done();
        });

        it('Child overrides conflicting parent fields', done => {
            const pFields = {
                parent: true,
                child: false,
                test: 0,
            };
            const cFields = {
                child: true,
                test: 7,
            };
            const rFields = {
                parent: true,
                child: true,
                test: 7,
            };
            parentNode.addDefaultFields(pFields);
            childNode.addDefaultFields(cFields);
            assert.deepStrictEqual(childNode._dfGetFields(), rFields);
            done();
        });
    });

    describe('Multiple-level parent-child relationship', () => {
        let ggpNode = null;
        let gpNode = null;
        let pNode = null;
        let childNode = null;

        beforeEach(done => {
            ggpNode = new DefaultFields();
            gpNode = new DefaultFields();
            gpNode.setParent(ggpNode);
            pNode = new DefaultFields();
            pNode.setParent(gpNode);
            childNode = new DefaultFields();
            childNode.setParent(pNode);
            done();
        });

        it('Child inherits from whole hierarchy (newer -> older)',
            done => {
                const ggpFields = { great: true };
                const gpFields = { grand: true };
                const pFields = { parent: true };
                const rFields = {
                    great: true,
                    grand: true,
                    parent: true,
                };
                pNode.addDefaultFields(pFields);
                gpNode.addDefaultFields(gpFields);
                ggpNode.addDefaultFields(ggpFields);
                assert.deepStrictEqual(childNode._dfGetFields(), rFields);
                done();
            });

        it('Child inherits from whole hierarchy (older -> newer)',
            done => {
                const ggpFields = { great: true };
                const gpFields = { grand: true };
                const pFields = { parent: true };
                const rFields = {
                    great: true,
                    grand: true,
                    parent: true,
                };
                ggpNode.addDefaultFields(ggpFields);
                gpNode.addDefaultFields(gpFields);
                pNode.addDefaultFields(pFields);
                assert.deepStrictEqual(childNode._dfGetFields(), rFields);
                done();
            });

        it('Nodes inherit in-hierarchy fields reset', done => {
            const ggpFields = { great: true };
            const gpFields = { grand: true };
            const pFields = { parent: true };
            const rFields = {
                great: true,
                // grand: true, // Part 'reset'
                parent: true,
            };
            ggpNode.addDefaultFields(ggpFields);
            gpNode.addDefaultFields(gpFields);
            pNode.addDefaultFields(pFields);
            gpNode.resetDefaultFields();
            assert.deepStrictEqual(childNode._dfGetFields(), rFields);
            done();
        });

        it('Field overriding is cascading through generations (newer -> older)',
            done => {
                const ggpFields = { generation: 0 };
                const gpFields = { generation: 1 };
                const pFields = { generation: 2 };
                const cFields = { generation: 3 };
                childNode.addDefaultFields(cFields);
                pNode.addDefaultFields(pFields);
                gpNode.addDefaultFields(gpFields);
                ggpNode.addDefaultFields(ggpFields);
                assert.deepStrictEqual(childNode._dfGetFields(), cFields);
                assert.deepStrictEqual(pNode._dfGetFields(), pFields);
                assert.deepStrictEqual(gpNode._dfGetFields(), gpFields);
                assert.deepStrictEqual(ggpNode._dfGetFields(), ggpFields);
                done();
            });

        it('Field overriding is cascading through generations (older -> newer)',
            done => {
                const ggpFields = { generation: 0 };
                const gpFields = { generation: 1 };
                const pFields = { generation: 2 };
                const cFields = { generation: 3 };
                ggpNode.addDefaultFields(ggpFields);
                gpNode.addDefaultFields(gpFields);
                pNode.addDefaultFields(pFields);
                childNode.addDefaultFields(cFields);
                assert.deepStrictEqual(childNode._dfGetFields(), cFields);
                assert.deepStrictEqual(pNode._dfGetFields(), pFields);
                assert.deepStrictEqual(gpNode._dfGetFields(), gpFields);
                assert.deepStrictEqual(ggpNode._dfGetFields(), ggpFields);
                done();
            });

        it('Destroying intermediate level breaks relationships', done => {
            const ggpFields = { ggp: 1 };
            const gpFields = { gp: 1 };
            const pFields = { p: 1 };
            const cFields = { c: 1 };
            ggpNode.addDefaultFields(ggpFields);
            gpNode.addDefaultFields(gpFields);
            pNode.addDefaultFields(pFields);
            childNode.addDefaultFields(cFields);
            pNode._dfDestroy();
            assert.strictEqual(gpNode.children.indexOf(pNode), -1);
            assert.strictEqual(pNode.parent, null);
            assert.strictEqual(pNode.children.indexOf(childNode), -1);
            assert.strictEqual(childNode.parent, null);
            assert.deepStrictEqual(pNode._dfGetFields(), pFields);
            assert.deepStrictEqual(childNode._dfGetFields(), cFields);
            done();
        });

        it('Destroying intermediate level(2) breaks relationships', done => {
            const ggpFields = { ggp: 1 };
            const gpFields = { gp: 1 };
            const pFields = { p: 1 };
            const cFields = { c: 1 };
            const rCFields = { p: 1, c: 1 };
            ggpNode.addDefaultFields(ggpFields);
            gpNode.addDefaultFields(gpFields);
            pNode.addDefaultFields(pFields);
            childNode.addDefaultFields(cFields);
            gpNode._dfDestroy();
            assert.strictEqual(ggpNode.children.indexOf(gpNode), -1);
            assert.strictEqual(gpNode.parent, null);
            assert.strictEqual(gpNode.children.indexOf(pNode), -1);
            assert.strictEqual(pNode.parent, null);
            assert.deepStrictEqual(gpNode._dfGetFields(), gpFields);
            assert.deepStrictEqual(childNode._dfGetFields(), rCFields);
            done();
        });
    });

    describe('Topology changes', () => {
        let ggpNode1 = null;
        let ggpNode2 = null;
        let gpNode1 = null;
        let gpNode2 = null;
        let pNode1 = null;
        let pNode2 = null;
        let cNode = null;

        const ggp1Fields = { ggp1: true, generation: 0 };
        const ggp2Fields = { ggp2: true, generation: 0 };
        const gp1Fields = { gp1: true, generation: 1 };
        const gp2Fields = { gp2: true, generation: 1 };
        const p1Fields = { p1: true, generation: 2 };
        const p2Fields = { p2: true, generation: 2 };
        const cFields = { c: true, generation: 3 };

        const startFields = {
            ggp1: true,
            gp1: true,
            p1: true,
            c: true,
            generation: 3,
        };

        beforeEach(done => {
            ggpNode1 = new DefaultFields();
            gpNode1 = new DefaultFields();
            gpNode1.setParent(ggpNode1);
            pNode1 = new DefaultFields();
            pNode1.setParent(gpNode1);

            ggpNode2 = new DefaultFields();
            gpNode2 = new DefaultFields();
            gpNode2.setParent(ggpNode2);
            pNode2 = new DefaultFields();
            pNode2.setParent(gpNode2);

            cNode = new DefaultFields();
            cNode.setParent(pNode1);

            ggpNode1.addDefaultFields(ggp1Fields);
            ggpNode2.addDefaultFields(ggp2Fields);
            gpNode1.addDefaultFields(gp1Fields);
            gpNode2.addDefaultFields(gp2Fields);
            pNode1.addDefaultFields(p1Fields);
            pNode2.addDefaultFields(p2Fields);
            cNode.addDefaultFields(cFields);

            done();
        });

        it('Nodes are updated accordingly when a parent changes '
           + '(change whole upper hierarchy)',
            done => {
                const rFields = {
                    ggp2: true,
                    gp2: true,
                    p2: true,
                    c: true,
                    generation: 3,
                };
                assert.deepStrictEqual(cNode._dfGetFields(), startFields);
                cNode.setParent(pNode2);
                assert.deepStrictEqual(cNode._dfGetFields(), rFields);
                done();
            });

        it('Nodes are updated accordingly when a parent changes '
           + '(change part of the upper hierarchy)',
            done => {
                const rFields = {
                    ggp2: true,
                    gp2: true,
                    p1: true,
                    c: true,
                    generation: 3,
                };
                assert.deepStrictEqual(cNode._dfGetFields(), startFields);
                pNode1.setParent(gpNode2);
                assert.deepStrictEqual(cNode._dfGetFields(), rFields);
                done();
            });

        it('Nodes are updated accordingly when a parent changes '
           + '(shortcut hierarchy)',
            done => {
                const rFields = {
                    ggp2: true,
                    c: true,
                    generation: 3,
                };
                assert.deepStrictEqual(cNode._dfGetFields(), startFields);
                cNode.setParent(ggpNode2);
                assert.deepStrictEqual(cNode._dfGetFields(), rFields);
                done();
            });

        it('Nodes are updated accordingly when a parent is unset '
           + '(remove whole hierarchy)',
            done => {
                const rFields = {
                    c: true,
                    generation: 3,
                };
                assert.deepStrictEqual(cNode._dfGetFields(), startFields);
                cNode.setParent(null);
                assert.deepStrictEqual(cNode._dfGetFields(), rFields);
                done();
            });

        it('Nodes are updated accordingly when a parent is unset '
           + '(remove upper hierarchy)',
            done => {
                const rFields = {
                    gp1: true,
                    p1: true,
                    c: true,
                    generation: 3,
                };
                assert.deepStrictEqual(cNode._dfGetFields(), startFields);
                gpNode1.setParent(null);
                assert.deepStrictEqual(cNode._dfGetFields(), rFields);
                done();
            });
    });
});

