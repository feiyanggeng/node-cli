export default `import { RouteComponentProps } from 'react-router-dom';

export interface RoutePropsType {
  history: RouteComponentProps['history'];
  match: RouteComponentProps['match'];
  location: RouteComponentProps['location'];
}

export interface MappingPropsType {
  isBlockLoading: boolean;
}

export interface ContainerPropsType extends RoutePropsType {
  $stateName$: ImmutableMap<MappingPropsType>;
}

export interface RootViewPropsType extends RoutePropsType {
  isBlockLoading: boolean;
}
`;