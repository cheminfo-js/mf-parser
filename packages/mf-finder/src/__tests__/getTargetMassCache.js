'use strict';

const getTargetMassCache = require('../getTargetMassCache');
const preprocessRanges = require('../preprocessRanges');

describe('getTargetMassCache', () => {

    it('check the result with one atom', () => {
        let possibilities = preprocessRanges(
            [
                { mf: 'C', min: 0, max: 2 },
            ]
        );
        let cache = getTargetMassCache(100, possibilities);
        expect(cache.minCharge).toBe(0);
        expect(cache.maxCharge).toBe(0);
    });

    it('check the result with charge', () => {
        let possibilities = preprocessRanges(
            [
                { mf: 'C', min: 0, max: 2 },
                { mf: 'H+', min: 0, max: 2 },
                { mf: 'O', min: 0, max: 0 },
            ]
        );
        let cache = getTargetMassCache(100, possibilities);
        expect(cache).toMatchObject({
            minCharge: 0,
            maxCharge: 2,
        });
    });

    it('check the result with min, max charge', () => {
        let possibilities = preprocessRanges(
            [
                { mf: 'C+', min: -10, max: 5 },
            ]
        );
        let cache = getTargetMassCache(100, possibilities, { minCharge: -1, maxCharge: 2 });
        expect(cache.minCharge).toBe(-1);
        expect(cache.maxCharge).toBe(2);
    });

    it('check the result with neutral', () => {
        let possibilities = preprocessRanges(
            [
                { mf: 'C', min: 0, max: 2 },
            ]
        );
        let cache = getTargetMassCache(100, possibilities, { minCharge: -1, maxCharge: 2, precision: 1000, allowNeutral: true });
        expect(cache).toEqual({
            minCharge: 0,
            maxCharge: 0,
            data: [{ charge: 0, minMass: 99.9, maxMass: 100.1 }]
        });
    });

    it('check the result with simple charge', () => {
        let possibilities = preprocessRanges(
            [
                { mf: 'C+', min: 0, max: 2 },
            ]
        );
        let cache = getTargetMassCache(100, possibilities, { minCharge: -1, maxCharge: 2, precision: 1000 });
        expect(cache).toEqual({
            minCharge: 0,
            maxCharge: 2,
            data: [
                { charge: 0, minMass: 0, maxMass: 0 },
                { charge: 1, minMass: 99.90054857990907, maxMass: 100.10054857990906 },
                { charge: 2, minMass: 199.80109715981814, maxMass: 200.20109715981812 }
            ]
        });
    });

    it('check the result positive and negative charge', () => {
        let possibilities = preprocessRanges(
            [
                { mf: 'C+', min: -1, max: 1 },
            ]
        );
        let cache = getTargetMassCache(100, possibilities, { minCharge: -1, maxCharge: 1, allowNeutral: false, precision: 1e6 });
        expect(cache).toEqual({
            minCharge: -1,
            maxCharge: 1,
            data: [
                { charge: -1, minMass: -0.00054857990907, maxMass: 199.99945142009094 },
                { charge: 0, minMass: 0, maxMass: 0 },
                { charge: 1, minMass: 0.00054857990907, maxMass: 200.00054857990906 }
            ]
        });
    });

});
