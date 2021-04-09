module.exports = `import BaseReduxActions from '$base$/ReduxStore/BaseReduxActions';
import $actionTypes$ from './constants/$actionTypes$';
import {STORE_PATH} from './constants/$status$';

class $actions$ extends BaseReduxActions {
}

export default new $actions$($actionTypes$, STORE_PATH);`;
