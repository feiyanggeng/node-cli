export default `import ExtensiblePageTitle from '$base$/components/ExtensiblePageTitle';
import $actions$ from '../$actions$';
import $styleLess$ from '../style/$style$';

import {RootViewPropsType} from '../constants/$types$';

class $rootView$ extends React.PureComponent<RootViewPropsType> {
  public render(): React.ReactNode {
    return (
      <React.Fragment>
        <ExtensiblePageTitle></ExtensiblePageTitle>
      </React.Fragment>
    );
  }
}

export default $rootView$;
`;
