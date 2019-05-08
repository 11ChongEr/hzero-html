/**
 * InventoryOrg -库存组织页面 -查询条件
 * @date: 2018-11-5
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.3
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  componentDidMount() {
    this.props.onHandleBindRef(this);
  }

  @Bind()
  queryByconditon() {
    const { form, onFetchOrg } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (isEmpty(err)) {
        onFetchOrg(fieldsValue);
      }
    });
  }

  @Bind()
  resetCondition() {
    this.props.form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
      getOrganizationId,
    } = this.props;
    return (
      <Form layout="inline">
        <Form.Item
          label={intl.get('hpfm.inventoryOrg.model.inventoryOrg.headerTitle').d('库存组织编码')}
        >
          {getFieldDecorator('organizationCode')(
            <Input trim typeCase="upper" inputChinese={false} style={{ width: 150 }} />
          )}
        </Form.Item>
        <Form.Item
          label={intl
            .get('hpfm.inventoryOrg.model.inventoryOrg.organizationName')
            .d('库存组织名称')}
        >
          {getFieldDecorator('organizationName')(<Input style={{ width: 150 }} />)}
        </Form.Item>
        <Form.Item label={intl.get('hpfm.inventoryOrg.model.inventoryOrg.ouId').d('业务实体')}>
          {getFieldDecorator('ouId')(
            <Lov
              code="HPFM.OU"
              queryParams={{ organizationId: getOrganizationId, enabledFlag: 1 }}
              style={{ width: 150 }}
            />
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" onClick={this.queryByconditon}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.resetCondition}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
