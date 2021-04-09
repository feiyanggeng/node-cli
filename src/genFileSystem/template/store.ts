export default `import $actions$ from './$actions$';
import $actionTypes$ from './constants/$actionTypes$';
import FluxBaseStore from 'common/fluxUtils/FluxBaseStore';
import Dispatcher from 'common/fluxUtils/Dispatcher';
import StoreNames from '$base$/constants/StoreNames';

type State = ImmutableMap<string, any>;

class $store$ extends FluxBaseStore {

  getName(): string {
    return StoreNames.;
  }

  getInitialState(): State {
    return Immutable({
      isBlockLoading: false,
      isLoading: false,
    });
  }

  flux(state: State, action: Object): State {
    switch (action.type) {
      
      default:
        return state;
    }
  }

  _handleError = (err: Object, customFn?: Function): void => {
    this._globalHandleError(err, this.getName());
  }
}

export default new $store$(Dispatcher);
`;
