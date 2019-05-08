import React, { PureComponent } from 'react';
import { Modal, Form, Input, Select, Button, Table } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { valueMapMeaning } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const { Option } = Select;

@Form.create({ fieldNameProp: null })
export default class TemplateDrawer extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * state初始化
   */
  state = {};

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { templateListRowSelection, onCancel, onOk } = this.props;
    if (isEmpty(templateListRowSelection)) {
      onCancel();
    } else {
      onOk();
    }
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (isEmpty(err)) {
          // 如果验证成功,则执行search
          onSearch();
        }
      });
    }
  }

  renderSearchForm() {
    const {
      form: { getFieldDecorator },
      templateTypeCode = [],
    } = this.props;
    return (
      <Form layout="inline">
        <Form.Item label={intl.get('entity.template.code').d('模板代码')}>
          {getFieldDecorator('templateCode', {})(
            <Input typeCase="upper" trim inputChinese={false} style={{ width: '130px' }} />
          )}
        </Form.Item>
        <Form.Item label={intl.get('entity.template.name').d('模板名称')}>
          {getFieldDecorator('templateName', {})(<Input style={{ width: '130px' }} />)}
        </Form.Item>
        <Form.Item label={intl.get('entity.template.type').d('模板类型')}>
          {getFieldDecorator('templateTypeCode', {})(
            <Select allowClear style={{ width: '130px' }}>
              {templateTypeCode &&
                templateTypeCode.map(item => (
                  <Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Option>
                ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Button data-code="search" type="primary" htmlType="submit" onClick={this.handleSearch}>
            {intl.get('hzero.common.status.search').d('查询')}
          </Button>
        </Form.Item>
      </Form>
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      confirmLoading,
      dataSource,
      onChange,
      visible,
      onCancel,
      templateListRowSelection,
      templateListPagination,
      templateTypeCode = [],
    } = this.props;
    const columns = [
      {
        title: intl.get('hrpt.reportDefinition.model.reportDefinition.templateCode').d('模板代码'),
        dataIndex: 'templateCode',
        width: 150,
      },
      {
        title: intl.get('hrpt.reportDefinition.modal.reportDefinition.templateName').d('模板名称'),
        dataIndex: 'templateName',
      },
      {
        title: intl
          .get('hrpt.reportDefinition.modal.reportDefinition.templateTypeCode')
          .d('模板类型'),
        dataIndex: 'templateTypeCode',
        width: 100,
        render: val => valueMapMeaning(templateTypeCode, val),
      },
    ];
    return (
      <Modal
        destroyOnClose
        width={750}
        title={intl.get('hrpt.reportDefinition.view.message.templateTitle').d('添加模板')}
        visible={visible}
        onOk={this.saveBtn}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
      >
        {this.renderSearchForm()}
        <Table
          bordered
          rowKey="templateId"
          loading={loading}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={dataSource}
          pagination={templateListPagination}
          rowSelection={templateListRowSelection}
          onChange={page => onChange(page)}
        />
      </Modal>
    );
  }
}
