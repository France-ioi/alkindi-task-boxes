
import update from 'immutability-helper';


export function selectTaskData (state) {
  const {taskData: {alphabet, config: {numMessages}, messages}, messageIndex} = state;
  const {cipherText, hints, frequencies} = messages[messageIndex];
  return {alphabet, numMessages, messageIndex, cipherText, hints, frequencies};
}



/* SUBSTITUTION functions */


export function makeSubstitution (alphabet) {
  const size = alphabet.length;
  const cells = alphabet.split('').map(function (c, rank) {
    return {rank, rotating: c, editable: null, locked: false, conflict: false};
  });
  const nullPerm = new Array(size).fill(-1);
  return {alphabet, size, cells, forward: nullPerm, backward: nullPerm};
}

export function dumpSubstitutions (alphabet, substitutions) {
  return substitutions.map(substitution =>
    substitution.cells.map(({editable, locked}) =>
      [alphabet.indexOf(editable), locked ? 1 : 0]));
}

export function loadSubstitutions (alphabet, hints, substitutionDumps) {
  const allHints = hints.filter(hint => hint.type === 'type_3');
  return substitutionDumps.map((cells, substitutionIndex) => {
    const $cells = [];
    cells.forEach((cell, cellIndex) => {
      /* Locking information is not included in the answer. */
      if (typeof cell === 'number') cell = [cell, 0];
      const [rank, locked] = cell;
      $cells[cellIndex] = {
        editable: {$set: rank === -1 ? null : alphabet[rank]},
        locked: {$set: locked !== 0},
      };
    });
    hints.forEach(({messageIndex: i, cellRank: j, symbol, type}) => {
      if (substitutionIndex === i && type !== 'type_3') {
        $cells[j] = {
          editable: {$set: symbol},
          hint: {$set: true},
        };
      }
    });
    allHints.forEach(({messageIndex: i, key}) => {
      if (substitutionIndex === i) {
        key.split('').forEach((symbol, j) => {
          $cells[j] = {
            editable: {$set: symbol},
            hint: {$set: true},
          };
        });
      }
    });
    let substitution = makeSubstitution(alphabet);
    substitution = update(substitution, {cells: $cells});
    substitution = markSubstitutionConflicts(updatePerms(substitution));
    return substitution;
  });
}

export function editSubstitutionCell (substitution, rank, symbol) {
  substitution = update(substitution, {cells: {[rank]: {editable: {$set: symbol}}}});
  return updatePerms(markSubstitutionConflicts(substitution));
}

export function lockSubstitutionCell (substitution, rank, locked) {
  return update(substitution, {cells: {[rank]: {locked: {$set: locked}}}});
}

function markSubstitutionConflicts (substitution) {
  const counts = new Map();
  const changes = {};
  for (let {rank, editable, conflict} of substitution.cells) {
    if (conflict) {
      changes[rank] = {conflict: {$set: false}};
    }
    if (editable !== null) {
      if (!counts.has(editable)) {
        counts.set(editable, [rank]);
      } else {
        counts.get(editable).push(rank);
      }
    }
  }
  for (let ranks of counts.values()) {
    if (ranks.length > 1) {
      for (let rank of ranks) {
        changes[rank] = {conflict: {$set: true}};
      }
    }
  }
  return update(substitution, {cells: changes});
}

export function updatePerms (substitution) {
  const {size, alphabet, cells} = substitution;
  const backward = new Array(size).fill(-1);
  for (let cell of cells) {
    if (cell.editable !== null && !cell.conflict) {
      const source = alphabet.indexOf(cell.editable);
      backward[cell.rank] = source;
    }
  }
  return {...substitution, backward};
}

export function applySubstitutions (substitutions, position, rank) {
  const result = {rank, locks: 0, trace: []};
  applySubstitution(substitutions[position], result);
  return result;
}

export function wrapAround (value, mod) {
  return ((value % mod) + mod) % mod;
}

export function applySubstitution (substitution, result) {
  let rank = result.rank, cell;
  cell = substitution.cells[rank];
  rank = substitution.backward[rank];
  result.rank = rank;
  if (cell) {
    result.trace.push(cell);
    if (cell.locked) {
      result.locked = true;
    }
    if (cell.hint) {
      result.isHint = true;
    }
    if (cell.collision) {
      result.collision = true;
    }
  }
}
