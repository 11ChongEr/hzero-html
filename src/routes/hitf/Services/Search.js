/*
 * Search - 服务注册查找
 * @date: 2018/10/29 14:03:38
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, Button, Select, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import Lov from 'components/Lov';

const FormItem = Form.Item;
const { Option } = Select;

const modelPrompt = 'hitf.services.model.services';
const commonPrompt = 'hzero.common';
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 查询
   */
  onClick() {
    const { fetchList = e => e } = this.props;
    fetchList();
  }

  /**
   * 重置表单
   */
  onReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  render() {
    const { form = {}, serviceTypes = [], tenantRoleLevel } = this.props;
    const { getFieldDecorator = e => e } = form;
    const enabledFlagList = [
      { value: 0, meaning: intl.get(`hzero.common.status.disable`).d('禁用') },
      { value: 1, meaning: intl.get(`hzero.common.status.enable`).d('启用') },
    ];
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              {!tenantRoleLevel && (
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`${modelPrompt}.tenant`).d('所属租户')}
                  >
                    {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
                  </FormItem>
                </Col>
              )}
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.code`).d('服务代码')}>
                  {getFieldDecorator('serverCode')(<Input typeCase="upper" inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.name`).d('服务名称')}>
                  {getFieldDecorator('serverName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.type`).d('服务类型')}>
                  {getFieldDecorator('serviceType')(
                    <Select allowClear>
                      {serviceTypes.map(item => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`${commonPrompt}.status`).d('状态')}>
                  {getFieldDecorator('enabledFlag')(
                    <Select allowClear>
                      {enabledFlagList.map(n => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button type="primary" htmlType="submit" onClick={this.onClick.bind(this)}>
                {intl.get(`${commonPrompt}.button.search`).d('查询')}
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.onReset.bind(this)}>
                {intl.get(`${commonPrompt}.button.reset`).d('重置')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
