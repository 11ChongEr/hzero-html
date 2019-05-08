import React, { PureComponent } from 'react';
import { Input, Icon } from 'hzero-ui';

export default class ParentDirInput extends PureComponent {
  render() {
    const { textValue, onClick = e => e } = this.props;
    return (
      <Input
        readOnly
        value={textValue}
        onClick={onClick}
        style={{
          verticalAlign: 'middle',
          position: 'relative',
          top: -1,
        }}
        addonAfter={<Icon type="search" onClick={onClick} style={{ cursor: 'pointer' }} />}
      />
    );
  }
}
