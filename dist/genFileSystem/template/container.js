"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `import {connect} from 'react-redux';
import {STORE_PATH} from '../constants/$status$';

import $actions$ from '../$actions$';
import $rootView$ from './$rootView$';

import {ContainerPropsType} from '../constants/$types$';

class $container$ extends React.PureComponent<ContainerPropsType> {
  public componentDidMount(): void {}

  public componentWillUnmount(): void {
    $actions$.resetStoreData();
  }

  public render(): React.ReactNode {
    const {
      history,
      match,
      location,
      $stateName$,
    } = this.props;
    return (
      <$rootView$
        history={history}
        match={match}
        location={location}
        isBlockLoading={$stateName$.get('isBlockLoading')}
      />
    );
  }
}

export default connect((state: Immutable.Map<string, any>) => ({
  $stateName$: state.getIn(STORE_PATH) || Immutable.Map(),
}))($container$);
`;
//# sourceMappingURL=container.js.map