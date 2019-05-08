import * as React from 'react';
import {RouteProps} from 'dva/router';

type authorityFN = (currentAuthority?: string) => boolean;

type authority = string | Array<string> | authorityFN | Promise<any>;

export type IReactComponent<P = any> =
  | React.StatelessComponent<P>
  | React.ComponentClass<P>
  | React.ClassicComponentClass<P>;

// FIXME: eslint 报错
// interface Secured {
//   (authority: authority, error?: React.ReactNode): <T extends IReactComponent>(target: T) => T;
// }

export interface AuthorizedRouteProps extends RouteProps {
  authority: authority;
}

export class AuthorizedRoute extends React.Component<AuthorizedRouteProps, any> {
}

// FIXME: eslint 报错
// interface check {
//   <T extends IReactComponent, S extends IReactComponent>(
//     authority: authority,
//     target: T,
//     Exception: S
//   ): T | S;
// }

interface AuthorizedProps {
  authority: authority;
  noMatch?: React.ReactNode;
}

/* eslint-disable */

// FIXME: eslint 报错
export class Authorized extends React.Component<AuthorizedProps, any> {
  static Secured: any; // Secured;
  static AuthorizedRoute: typeof AuthorizedRoute;
  static check: any; // check;
}

declare function renderAuthorize(currentAuthority: string): typeof Authorized;

export default renderAuthorize;

/* eslint-enable */
