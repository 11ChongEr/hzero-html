import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import intl from 'utils/intl';

/**
 * 表单管理查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} search - 查询
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
   * 查询
   */
  @Bind()
  handleSearch() {
    const { form, onSearch, onStore } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          // 如果验证成功,则执行search
          onSearch();
          onStore(values);
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
    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <Form layout="inline">
          <Form.Item label={intl.get('hwfl.interfaceMap.model.interfaceMap.code').d('接口编码')}>
            {getFieldDecorator('code', {})(<Input typeCase="upper" trim inputChinese={false} />)}
          </Form.Item>
          <Form.Item label={intl.get('hwfl.interfaceMap.model.interfaceMap.serviceId').d('服务Id')}>
            {getFieldDecorator('serviceId', {})(<Lov code="HCNF.ROUTE.SERVICE_CODE.ORG" />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.interfaceMap.model.interfaceMap.description').d('接口说明')}
          >
            {getFieldDecorator('description', {})(<Input />)}
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
