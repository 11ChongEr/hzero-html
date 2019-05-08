/**
 * UserGroupManagement 用户组管理
 * @date: 2019-1-14
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class FilterForm extends React.PureComponent {
  /**
   * 查询表单
   */
  @Bind()
  handleSearch() {
    const { form, search } = this.props;
    search(form);
  }

  /**
   * 重置表单
   */
  @Bind()
  handleReset() {
    const { form, reset } = this.props;
    reset(form);
  }

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={!isTenantRoleLevel() ? 18 : 12}>
            <Row>
              {!isTenantRoleLevel() && (
                <Col span={8}>
                  <FormItem
                    label={intl.get('hpfm.database.model.database.tenantName').d('租户名称')}
                    {...formLayout}
                  >
                    {getFieldDecorator('tenantId')(<Lov allowClear={false} code="HPFM.TENANT" />)}
                  </FormItem>
                </Col>
              )}
              <Col span={!isTenantRoleLevel() ? 8 : 12}>
                <FormItem
                  label={intl
                    .get('hiam.userGroupManagement.model.userGroupManagement.groupCode')
                    .d('用户组编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('groupCode')(
                    <Input trim inputChinese={false} dbc2sbc={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={!isTenantRoleLevel() ? 8 : 12}>
                <FormItem
                  label={intl
                    .get('hiam.userGroupManagement.model.userGroupManagement.groupName')
                    .d('用户组名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('groupName')(<Input dbc2sbc={false} />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
