module.exports = `import BaseActionTypesCreator from '$base$/ReduxStore/BaseActionTypesCreator';
import {STORE_PATH} from './$status$';

const types = {
};
const $actionTypes$ = BaseActionTypesCreator(_.last(STORE_PATH), types);

export default $actionTypes$;`;
