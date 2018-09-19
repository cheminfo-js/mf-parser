'use strict';

const Nucleotide = require('..');

describe('test nucleotide', () => {
    test('sequenceToMF of ATC ', () => {
        expect(Nucleotide.sequenceToMF('ATC')).toEqual(
            'HOAmpTmpCmpH.HOGmpAmpTmpH'
        );
    });

    test('sequenceToMF of AAU ', () => {
        expect(Nucleotide.sequenceToMF('AAU')).toEqual('HOAmpAmpUmpH');
    });

    test('sequenceToMF of circular AAA ', () => {
        expect(Nucleotide.sequenceToMF('AAA', { circular: true })).toEqual(
            'AmpAmpAmp.TmpTmpTmp'
        );
    });

    test('sequenceToMF of DNA AAA ', () => {
        expect(Nucleotide.sequenceToMF('AAA', { kind: 'DNA' })).toEqual(
            'HODampDampDampH'
        );
    });
});