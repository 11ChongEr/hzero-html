/**
 * PreviewModal - lov预览
 * @date: 2018-7-9
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Row, Col, Form, Modal } from 'hzero-ui';

import Lov from 'components/Lov';

import intl from 'utils/intl';

@Form.create({ fieldNameProp: null })
export default class PreviewModal extends PureComponent {
  render() {
    const { showLovComponent, previeVisible, viewCode } = this.props;
    return (
      <Modal
        title={intl.get('hpfm.lov.view.title.model.preview').d('值集视图预览')}
        visible={previeVisible}
        width={500}
        footer={null}
        onCancel={() => showLovComponent(false)}
      >
        <React.Fragment>
          <Row gutter={24}>
            <Col span={6}>
              <Lov code={viewCode} style={{ width: '400px' }} />
            </Col>
          </Row>
        </React.Fragment>
      </Modal>
    );
  }
}
