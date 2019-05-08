/*
 * FilterForm - 库房查询表单
 * @date: 2018/08/07 14:48:29
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 计量单位查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch // 搜索
 * @reactProps {Function} handleFormReset // 重置表单
 * @return React.element
 */
const FormItem = Form.Item;
const modelPrompt = 'hpfm.storeRoom.model.storeRoom';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (isFunction(onSearch)) {
      form.validateFields(err => {
        if (!err) {
          onSearch();
        }
      });
    }
  }

  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Fragment>
          <Form layout="inline">
            <FormItem label={intl.get(`${modelPrompt}.inventoryCode`).d('库房编码')}>
              {getFieldDecorator('inventoryCode')(
                <Input trim typeCase="upper" inputChinese={false} style={{ width: 150 }} />
              )}
            </FormItem>
            <FormItem label={intl.get(`${modelPrompt}.inventoryName`).d('库房名称')}>
              {getFieldDecorator('inventoryName')(<Input style={{ width: 150 }} />)}
            </FormItem>
            <FormItem label={intl.get(`${modelPrompt}.ouId`).d('业务实体')}>
              {getFieldDecorator('ouId')(
                <Lov
                  code="HPFM.OU"
                  style={{ width: 150 }}
                  queryParams={{ organizationId: getCurrentOrganizationId(), enabledFlag: 1 }}
                />
              )}
            </FormItem>
            <FormItem>
              <Button
                data-code="search"
                htmlType="submit"
                type="primary"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </FormItem>
          </Form>
        </Fragment>
      </div>
    );
  }
}
