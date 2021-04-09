export default `import BaseReduxReducer from '$base$/ReduxStore/BaseReduxReducer';
import $actionTypes$ from './constants/$actionTypes$';

import {MappingPropsType} from './constants/$types$';

type State = ImmutableMap<MappingPropsType> & Immutable.Map<string, any>;

class $reducer$ extends BaseReduxReducer {
  getInitialState(): State {
    return Immutable.fromJS({
      isBlockLoading: true,
    });
  }
}

export default new $reducer$($actionTypes$);
`;
