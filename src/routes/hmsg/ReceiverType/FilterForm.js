import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

/**
 * 接收者类型维护-数据查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          onSearch();
        }
      });
    }
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <Form layout="inline">
          {!isTenantRoleLevel() && (
            <Form.Item label={intl.get('entity.tenant.tag').d('租户')}>
              {getFieldDecorator('tenantId', {})(<Lov code="HPFM.TENANT" />)}
            </Form.Item>
          )}
          <Form.Item
            label={intl.get('hmsg.receiverType.model.receiverType.typeCode').d('接收者类型编码')}
          >
            {getFieldDecorator('typeCode', {})(
              <Input typeCase="upper" trim inputChinese={false} />
            )}
          </Form.Item>
          <Form.Item label={intl.get('hmsg.receiverType.model.receiverType.typeName').d('描述')}>
            {getFieldDecorator('typeName', {})(<Input />)}
          </Form.Item>
          <Form.Item>
            <Button data-code="search" type="primary" htmlType="submit" onClick={this.handleSearch}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
            <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
          </Form.Item>
        </Form>
      </Fragment>
    );
  }
}
