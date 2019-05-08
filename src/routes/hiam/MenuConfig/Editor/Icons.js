import React, { PureComponent } from 'react';
import { Modal, Row, Col, Pagination, Tooltip, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isNumber } from 'lodash';

import LazyLoadMenuIcon from 'components/LazyLoadMenuIcon';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';

import { svnIconQueryPages } from '../../../../services/hiam/menuConfigService';

const viewMessagePrompt = 'hiam.menuConfig.view.message';

const colItemStyle = { marginBottom: 12, textAlign: 'center' };
const rowStyle = {
  height: '96px',
};

export default class IconList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dynamicImportLoading: true,
      currentMenus: [],
      page: 0, // 当前分页
    };
  }

  componentDidMount() {
    this.dynamicImport();
  }

  dynamicImport(page = 0) {
    this.setState({
      dynamicImportLoading: true,
    });
    svnIconQueryPages({ page, size: 12 }).then(res => {
      const safeRes = getResponse(res);
      if (safeRes) {
        this.setState({
          page: isNumber(safeRes.number) ? safeRes.number : safeRes.start,
          dynamicImportLoading: false,
          currentMenus: safeRes.content.map(r => r.code),
          total: isNumber(safeRes.totalElements) ? safeRes.totalElements : safeRes.total,
        });
      }
    });
  }

  @Bind()
  cancel() {
    const { onCancel = e => e } = this.props;
    onCancel();
  }

  @Bind()
  select(selectedIcon) {
    const { onSelect = e => e } = this.props;
    onSelect(selectedIcon);
  }

  @Bind()
  onPaginationChange(current) {
    this.dynamicImport(current - 1);
  }

  render() {
    const { visible, onCancel = e => e } = this.props;
    const { page = 0, total = 0, currentMenus = [], dynamicImportLoading = false } = this.state;
    const paginationProps = {
      size: 'small',
      current: page + 1,
      total,
      pageSize: 12,
      showSizeChanger: false,
      onChange: this.onPaginationChange,
    };
    return (
      <Modal
        title={intl.get(`${viewMessagePrompt}.title.selectIcons`).d('选择图标')}
        visible={visible}
        onCancel={onCancel}
        width={600}
        destroyOnClose
        footer={null}
      >
        <Spin spinning={dynamicImportLoading}>
          <Row type="flex" justify="start" gutter={12} style={rowStyle}>
            {currentMenus.map(n => (
              <Col key={n} span={4} style={colItemStyle}>
                <Tooltip title={n}>
                  <LazyLoadMenuIcon onClick={this.select.bind(this, n)} code={n} />
                </Tooltip>
              </Col>
            ))}
          </Row>
          <br />
          <span style={{ textAlign: 'right' }}>
            <Pagination {...paginationProps} />
          </span>
        </Spin>
      </Modal>
    );
  }
}
