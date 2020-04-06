'use strict';

const IsotopicDistribution = require('../IsotopicDistribution.js');

describe('test isotopicDistribution', () => {
  it('create distribution of C1 with default options', () => {
    let isotopicDistribution = new IsotopicDistribution('C', { fwhm: 0.1 });
    let gaussian = isotopicDistribution.getGaussian();

    expect(gaussian.x).toHaveLength(73);
    expect(Math.min(...gaussian.x)).toBeCloseTo(11.82, 1);
    expect(Math.max(...gaussian.x)).toBeCloseTo(13.13, 1);
    expect(Math.min(...gaussian.y)).toBeCloseTo(0, 3);
    expect(Math.max(...gaussian.y)).toBeCloseTo(0.9893, 2);
  });
  it('create distribution of C1 and getGaussian', () => {
    let isotopicDistribution = new IsotopicDistribution('C', { fwhm: 0.1 });
    let gaussian = isotopicDistribution.getGaussian({
      from: 11.0,
      to: 13.0,
    });

    expect(gaussian.x).toHaveLength(57);
    expect(Math.min(...gaussian.x)).toBeCloseTo(11.82, 1);
    expect(Math.max(...gaussian.x)).toBeCloseTo(13, 1);
    expect(Math.min(...gaussian.y)).toBeCloseTo(0, 3);
    expect(Math.max(...gaussian.y)).toBeCloseTo(0.9893);
  });

  it('create distribution of C1 and getGaussian with maxValue', () => {
    let isotopicDistribution = new IsotopicDistribution('C', { fwhm: 0.1 });
    let gaussian = isotopicDistribution.getGaussian({
      from: 11.0,
      to: 13.0,
      maxValue: 100,
    });

    expect(gaussian.x).toHaveLength(57);
    expect(Math.min(...gaussian.x)).toBeCloseTo(11.82, 1);
    expect(Math.max(...gaussian.x)).toBeCloseTo(13, 1);
    expect(Math.min(...gaussian.y)).toBeCloseTo(0, 2);
    expect(Math.max(...gaussian.y)).toBe(100);
  });

  it.only('create distribution of C10000 and getGaussian with maxValue', () => {
    let isotopicDistribution = new IsotopicDistribution('C10000', {
      fwhm: 0.001,
    });
    let gaussian = isotopicDistribution.getGaussian({
      maxValue: 100,
      maxLength: 1e7,
    });

    expect(Math.max(...gaussian.x)).toBeCloseTo(120159.5334, 1);
    expect(Math.max(...gaussian.y)).toBeCloseTo(100, 0);
  });

  it('create distribution of C10000 and getGaussian too big', () => {
    let isotopicDistribution = new IsotopicDistribution('C10000', {
      fwhm: 0.001,
    });
    expect(() => {
      isotopicDistribution.getGaussian({});
    }).toThrow('Number of points is over the maxLength');
  });
});
