import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input, DatePicker, Select, Icon, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import cacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants';
import { getDateFormat } from 'utils/utils';

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
/**
 * 查询表单-数据初始化
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} search - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: 'hdtt.initialProcess' })
export default class FilterForm extends PureComponent {
  /**
   * state初始化
   */
  state = {
    display: true,
    filterTenanName: '',
  };

  /**
   * 表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    const { filterTenanName } = this.state;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          const { processDate, ...otherValue } = values;
          // 如果验证成功,则执行search
          onSearch({
            ...otherValue,
            tenantName: filterTenanName,
            processDate: processDate ? processDate.format(DATETIME_MIN) : undefined,
          });
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
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  @Bind()
  changeTenantName(text, record) {
    this.setState({ filterTenanName: record.tenantName });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      processStatus,
      form: { getFieldDecorator },
    } = this.props;
    const { display = true } = this.state;
    return (
      <Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <Form.Item
                    label={intl.get('hdtt.initProcess.model.initProcess.createTable').d('分发表')}
                    {...formlayout}
                  >
                    {getFieldDecorator('createTable', {})(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get('hdtt.initProcess.model.initProcess.consumerService')
                      .d('服务编码')}
                    {...formlayout}
                  >
                    {getFieldDecorator('consumerService', {})(
                      <Lov
                        // textValue={query.consumerService}
                        code="HDTT.SERVICE"
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get('hdtt.initProcess.model.initProcess.tenantId').d('租户')}
                    {...formlayout}
                  >
                    {getFieldDecorator('tenantId', {})(
                      <Lov
                        // textValue={query.tenantName}
                        code="HPFM.TENANT"
                        onChange={(text, record) => {
                          this.changeTenantName(text, record);
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ display: display ? 'none' : 'block' }}>
                <Col span={8}>
                  <Form.Item
                    label={intl.get('hdtt.initProcess.model.initProcess.processDate').d('处理日期')}
                    {...formlayout}
                  >
                    {getFieldDecorator('processDate', {
                      initialValue: '',
                    })(<DatePicker format={getDateFormat()} placeholder="" />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get('hdtt.initProcess.model.initProcess.processStatus')
                      .d('处理状态')}
                    {...formlayout}
                  >
                    {getFieldDecorator('processStatus', {})(
                      <Select allowClear>
                        {processStatus.map(item => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
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
                <a
                  style={{ marginLeft: 8, display: display ? 'inline-block' : 'none' }}
                  onClick={this.toggleForm}
                >
                  {intl.get(`hzero.common.button.expand`).d('展开')} <Icon type="down" />
                </a>
                <a
                  style={{ marginLeft: 8, display: display ? 'none' : 'inline-block' }}
                  onClick={this.toggleForm}
                >
                  {intl.get(`hzero.common.button.up`).d('收起')} <Icon type="up" />
                </a>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Fragment>
    );
  }
}
