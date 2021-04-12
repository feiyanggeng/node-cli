"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `import BaseReduxActions from '$base$/ReduxStore/BaseReduxActions';
import $actionTypes$ from './constants/$actionTypes$';
import {STORE_PATH} from './constants/$status$';

class $actions$ extends BaseReduxActions {
}

export default new $actions$($actionTypes$, STORE_PATH);`;
//# sourceMappingURL=actions.js.map