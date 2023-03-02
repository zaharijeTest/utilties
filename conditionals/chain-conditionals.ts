type ChainConditionCallback = (value: boolean) => boolean | undefined | void;
type ChainConditionValue = () => boolean;

type ChainCondition = {
  /** Method for getting the current value of condition */
  value: ChainConditionValue;
  /** Method for attaching additional condition check */
  next: (callback: ChainConditionCallback) => ChainCondition;
  /** Method for attaching callback upon truthy return */
  ifTrue: (callback: ChainConditionCallback) => ChainCondition;
  /** Method for attaching callback upon falsy return */
  ifFalse: (callback: ChainConditionCallback) => ChainCondition;
  /** Attach logical OR operator on previous value */
  or: (secondCondition: boolean) => ChainCondition;
  /** Attach logical AND operator on previous value */
  and: (secondCondition: boolean) => ChainCondition;
  /** Get all previous values on chaining */
  getPreviousValues: () => boolean[];
};

const createChainCondition: (
  value: boolean,
  _previousValues: boolean[]
) => ChainCondition = (value: boolean, _previousValues: boolean[]) => {
  const callbackWrapper = (newValue: boolean) => {
    _previousValues.push(newValue);
    return newValue;
  };

  const executeCallback = (callback: ChainConditionCallback, value: boolean) =>
    createChainCondition(callbackWrapper(!!callback(value)), _previousValues);

  return {
    value: () => value,
    getPreviousValues: () => _previousValues,
    next: (callback: ChainConditionCallback) =>
      executeCallback(callback, value),
    ifTrue: (callback: ChainConditionCallback) => {
      if (!!value) return executeCallback(callback, value);
      return createChainCondition(value, _previousValues);
    },
    ifFalse: (callback: ChainConditionCallback) => {
      if (!value) return executeCallback(callback, value);
      return createChainCondition(value, _previousValues);
    },
    or: (secondCondition: boolean) =>
      createChainCondition(value || secondCondition, _previousValues),
    and: (secondCondition: boolean) =>
      createChainCondition(value && secondCondition, _previousValues),
  };
};

/** Creates a system for checking multiple conditions with provided initial condition. Returned object
 * has next() method which accepts callback which will receive initialCondition value and so on.
 * @returns ChainConditionValue
 */
export const ChainCondition = (initialCondition: boolean) => {
  const _previousValues = [initialCondition];
  return createChainCondition(initialCondition, _previousValues);
};
