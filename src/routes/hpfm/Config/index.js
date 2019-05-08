import React, { Component } from 'react';
import { connect } from 'dva';

import { isTenantRoleLevel } from 'utils/utils';

import ConfigDetail from './ConfigDetail';

@connect(({ routing }) => ({
  routing,
}))
export default class Config extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSite: !isTenantRoleLevel(),
    };
  }

  render() {
    const { isSite } = this.state;
    return <ConfigDetail isSite={isSite} />;
  }
}
