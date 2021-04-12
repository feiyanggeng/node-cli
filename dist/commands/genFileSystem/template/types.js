"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `import { RouteComponentProps } from 'react-router-dom';

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
//# sourceMappingURL=types.js.map