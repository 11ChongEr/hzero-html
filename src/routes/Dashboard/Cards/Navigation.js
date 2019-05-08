import React from 'react';
import { Card } from 'hzero-ui';

export default class Navigation extends React.Component {
  render() {
    return (
      <Card
        style={{ marginBottom: 12 }}
        title="快速开始 / 便捷导航"
        bordered={false}
        bodyStyle={{ padding: 0, height: '100px' }}
      >
        {/* <EditableLinkGroup onAdd={() => {}} links={links} linkElement={Link} /> */}
      </Card>
    );
  }
}
