import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';

import intl from 'utils/intl';

/**
 * 查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch - 查询
 * @return React.element
 */
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator },
      tenantRoleLevel,
    } = this.props;
    return (
      <Fragment>
        <Form layout="inline">
          {!tenantRoleLevel && (
            <Form.Item label={intl.get('entity.tenant.tag').d('租户')}>
              {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
            </Form.Item>
          )}
          <Form.Item label={intl.get('hmsg.sendConfig.model.sendConfig.messageCode').d('消息代码')}>
            {getFieldDecorator('messageCode')(<Input />)}
          </Form.Item>
          <Form.Item label={intl.get('hmsg.sendConfig.model.sendConfig.messageName').d('消息名称')}>
            {getFieldDecorator('messageName')(<Input />)}
          </Form.Item>
          <Form.Item>
            <Button data-code="search" type="primary" htmlType="submit" onClick={this.handleSearch}>
              {intl.get('hzero.common.status.search').d('查询')}
            </Button>
            <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              {intl.get('hzero.common.status.reset').d('重置')}
            </Button>
          </Form.Item>
        </Form>
      </Fragment>
    );
  }
}
