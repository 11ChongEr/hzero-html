import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, Row, Col } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;

/**
 * 查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Function} onStoreFormValues - 存储表单值
 * @return React.element
 */

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  // 提交查询表单
  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    form.validateFields(err => {
      if (isEmpty(err)) {
        onSearch();
      }
    });
  }

  // 重置表单
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { serverTypeList, tenantRoleLevel } = this.props;
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                {!tenantRoleLevel && (
                  <Col span={8}>
                    <FormItem
                      label={intl.get('hmsg.smsConfig.model.smsConfig.tenant').d('租户')}
                      {...formlayout}
                    >
                      {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
                    </FormItem>
                  </Col>
                )}
                <Col span={8}>
                  <FormItem
                    label={intl.get('hmsg.smsConfig.model.smsConfig.serverTypeCode').d('服务类型')}
                    {...formlayout}
                  >
                    {getFieldDecorator('serverTypeCode')(
                      <Select allowClear>
                        {serverTypeList &&
                          serverTypeList.map(item => (
                            <Option value={item.value} key={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('hmsg.smsConfig.model.smsConfig.serverCode').d('账户代码')}
                    {...formlayout}
                  >
                    {getFieldDecorator('serverCode')(
                      <Input typeCase="upper" trim inputChinese={false} />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('hmsg.smsConfig.model.smsConfig.serverName').d('账户名称')}
                    {...formlayout}
                  >
                    {getFieldDecorator('serverName')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
                <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }
}
