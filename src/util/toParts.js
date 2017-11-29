'use strict';

const Kind = require('../Kind');
const groups = require('chemical-elements/src/groupsObject.js');
const atomSorter = require('atom-sorter');

module.exports = function toParts(lines) {
    let parts = [];

    let currentPart = createNewPart();
    let previousKind = Kind.BEGIN;
    parts.push(currentPart);

    for (let line of lines) {
        switch (line.kind) {
            case Kind.OPENING_PARENTHESIS:
                openingParenthesis(currentPart);
                break;
            case Kind.CLOSING_PARENTHESIS:
                closingParenthesis(currentPart);
                break;
            case Kind.PRE_MULTIPLIER:
                preMultiplier(currentPart, line);
                break;
            case Kind.MULTIPLIER:
                postMultiplier(currentPart, line.value, previousKind);
                break;
            case Kind.SALT:
                globalPartMultiplier(currentPart);
                currentPart = createNewPart();
                parts.push(currentPart);
                break;
            case Kind.ATOM:
            case Kind.ISOTOPE_RATIO:
            case Kind.ISOTOPE:
            case Kind.CHARGE:
                currentPart.lines.push(
                    Object.assign({}, line, {multiplier: 1})
                );
                break;
            default:
                throw new Error('Can not process mf having ', line.kind);
        }
        previousKind = line.kind;
    }
    globalPartMultiplier(currentPart);
    expandGroups(parts);
    return combineAtomsIsotopesCharges(parts);
};

function createNewPart() {
    let currentMultiplier = {value: 1, fromIndex: 0};
    return {
        lines: [],
        multipliers: [currentMultiplier],
        currentMultiplier
    };
}

function openingParenthesis(currentPart) {
    currentPart.currentMultiplier = {
        value: 1,
        fromIndex: currentPart.lines.length
    };
    currentPart.multipliers.push(currentPart.currentMultiplier);
}

function closingParenthesis(currentPart) {
    currentPart.currentMultiplier = currentPart.multipliers.pop();
    if (currentPart.currentMultiplier !== 1) {
        for (let i = currentPart.currentMultiplier.fromIndex; i < currentPart.lines.length; i++) {
            currentPart.lines[i].multiplier *= currentPart.currentMultiplier.value;
        }
    }
}

function preMultiplier(currentPart, line) {
    currentPart.currentMultiplier.value *= line.value;
}

function globalPartMultiplier(currentPart) {
    for (let i = currentPart.multipliers[0].fromIndex; i < currentPart.lines.length; i++) {
        currentPart.lines[i].multiplier *= currentPart.multipliers[0].value;
    }
}

function postMultiplier(currentPart, value, previousKind) {
    if (previousKind === Kind.CLOSING_PARENTHESIS) {
        // need to apply to everything till the previous parenthesis
        for (let i = currentPart.currentMultiplier.fromIndex; i < currentPart.lines.length; i++) {
            currentPart.lines[i].multiplier *= value;
        }
    } else { // just applies to the previous element
        currentPart.lines[currentPart.lines.length - 1].multiplier *= value;
    }
}

function expandGroups(parts) {
    for (let part of parts) {
        let expanded = false;
        for (let i = 0; i < part.lines.length; i++) {
            let line = part.lines[i];
            if (line.kind === Kind.ATOM) {
                let group = groups[line.value];
                if (group) {
                    expanded = true;
                    for (let element of group.elements) {
                        part.lines.push({
                            kind: 'atom',
                            value: element.symbol,
                            multiplier: line.multiplier * element.number
                        });
                    }
                    part.lines[i] = undefined;
                }
            }
        }
        if (expanded) part.lines = part.lines.filter((a) => a);
    }
}

function combineAtomsIsotopesCharges(parts) {
    let results = [];
    for (let part of parts) {
        let result = [];
        results.push(result);
        calculateAndSortKeys(part);

        let currentKey = '';
        for (let key of part.keys) {
            if (key.key === Kind.CHARGE) {
                if (currentKey !== key.key) {
                    result.push({
                        kind: Kind.CHARGE,
                        value: key.value.value * key.value.multiplier
                    });
                } else {
                    result[result.length - 1].value += key.value.value * key.value.multiplier;
                }
            } else {
                if (currentKey !== key.key) {
                    result.push(key.value);
                } else {
                    result[result.length - 1].multiplier += key.value.multiplier;
                }
            }
            currentKey = key.key;
        }
        console.log(result);
        result.sort((a, b) => {
            if (a.kind === Kind.CHARGE) return 1;
            if (b.kind === Kind.CHARGE) return -1;

            let indexA = a.kind === Kind.ATOM ? a.value : a.value.atom + a.value.isotope;
            let indexB = b.kind === Kind.ATOM ? b.value : b.value.atom + b.value.isotope;
            console.log(indexA, indexB);
            return atomSorter(indexA, indexB);
        });
    }
    return results;
}

function calculateAndSortKeys(part) {
    part.keys = [];
    for (var line of part.lines) {
        part.keys.push({
            key: getKey(line),
            value: line
        });
    }
    part.keys.sort((a, b) => stringComparator(a.key, b.key));
}

function getKey(line) {
    let key = [line.kind];

    switch (line.kind) {
        case (Kind.CHARGE):
            break;
        default:
            if (typeof line.value === 'string') {
                key.push(line.value);
            } else {
                for (let prop of Object.keys(line.value).sort()) {
                    key.push(line.value[prop]);
                }
            }
    }
    return key.join('-');
}

function stringComparator(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

