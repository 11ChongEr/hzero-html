import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
/**
 * 流程监控查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 查询
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
      statusList = [],
    } = this.props;

    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hsdr.concRequest.model.concRequest.jobId').d('任务ID')}
                  {...formLayout}
                >
                  {getFieldDecorator('jobId', {
                    rules: [
                      {
                        pattern: /^[0-9]*$/,
                        message: intl.get('hsdr.concRequest.validation.digital').d('只能输入数字'),
                      },
                    ],
                  })(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
              {!tenantRoleLevel && (
                <Col span={8}>
                  <Form.Item label={intl.get('entity.tenant.tag').d('租户')} {...formLayout}>
                    {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
                  </Form.Item>
                </Col>
              )}
              <Col span={8}>
                <Form.Item
                  label={intl.get('hsdr.concRequest.model.concRequest.concCode').d('请求编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('concCode')(
                    <Input trim inputChinese={false} typeCase="upper" />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hsdr.concRequest.model.concRequest.concName').d('请求名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('concName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hsdr.concRequest.model.concRequest.jobStatus').d('状态')}
                  {...formLayout}
                >
                  {getFieldDecorator('jobStatus')(
                    <Select allowClear>
                      {statusList.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hsdr.concRequest.model.concRequest.cycleFlag').d('是否周期性')}
                  {...formLayout}
                >
                  {getFieldDecorator('cycleFlag')(
                    <Select allowClear>
                      <Select.Option value={1} key="1">
                        {intl.get('hsdr.concRequest.model.concRequest.flagY').d('是')}
                      </Select.Option>
                      <Select.Option value={0} key="0">
                        {intl.get('hsdr.concRequest.model.concRequest.flagN').d('否')}
                      </Select.Option>
                    </Select>
                  )}
                </Form.Item>
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
    );
  }
}
