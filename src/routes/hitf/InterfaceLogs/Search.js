/*
 * Search - 接口监控查询
 * @date: 2018/09/17 15:40:00
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input, Row, Col, Select, DatePicker, Icon } from 'hzero-ui';
import { getDateTimeFormat, isTenantRoleLevel } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { map } from 'lodash';

import cacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';

import intl from 'utils/intl';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
  style: { width: '100%' },
};
const promptCode = 'hitf.interfaceLogs';
const { Option } = Select;

const tenantRoleLevel = isTenantRoleLevel();

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hitf/interface-logs/list' })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: true,
    };
  }

  @Bind()
  handleSearch() {
    const { onFilterChange, form } = this.props;
    if (onFilterChange) {
      form.validateFields((err, values) => {
        if (!err) {
          onFilterChange(values);
        }
      });
    }
  }

  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
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

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { display = true } = this.state;
    const enabledFlagArr = [
      { value: 'fail', meaning: '失败' },
      { value: 'success', meaning: '成功' },
    ];
    const dateTimeFormat = getDateTimeFormat();
    return (
      <Fragment>
        <Form layout="inline">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.interfaceLogs.applicationCode`)
                      .d('应用代码')}
                    {...formLayout}
                  >
                    {getFieldDecorator('applicationCode')(
                      <Input typeCase="upper" trim inputChinese={false} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.interfaceLogs.clientId`).d('客户端ID')}
                    {...formLayout}
                  >
                    {getFieldDecorator('clientId')(<Input inputChinese={false} />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.interfaceLogs.invokeKey`).d('请求ID')}
                    {...formLayout}
                  >
                    {getFieldDecorator('invokeKey')(<Input inputChinese={false} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ display: display ? 'none' : 'block' }}>
                <Col span={8}>
                  {!tenantRoleLevel && (
                    <Form.Item
                      {...formLayout}
                      label={intl.get(`${promptCode}.model.interfaceLogs.tenant`).d('所属租户')}
                    >
                      {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
                    </Form.Item>
                  )}
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.interfaceLogs.serverCode`).d('服务代码')}
                    {...formLayout}
                  >
                    {getFieldDecorator('serverCode')(
                      <Input typeCase="upper" trim inputChinese={false} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.interfaceLogs.responseStatus`)
                      .d('请求状态')}
                    {...formLayout}
                  >
                    {getFieldDecorator('responseStatus')(
                      <Select allowClear>
                        {map(enabledFlagArr, e => {
                          return (
                            <Option value={e.value} key={e.value}>
                              {e.meaning}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.interfaceLogs.interfaceRequestTimeStart`)
                      .d('请求时间从')}
                    {...formLayout}
                  >
                    {getFieldDecorator('interfaceRequestTimeStart')(
                      <DatePicker
                        format={dateTimeFormat}
                        disabledDate={currentDate =>
                          getFieldValue('interfaceRequestTimeEnd') &&
                          moment(getFieldValue('interfaceRequestTimeEnd')).isBefore(
                            currentDate,
                            'time'
                          )
                        }
                        style={{ width: '100%' }}
                        showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.interfaceLogs.interfaceRequestTimeEnd`)
                      .d('请求时间至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('interfaceRequestTimeEnd')(
                      <DatePicker
                        format={dateTimeFormat}
                        disabledDate={currentDate =>
                          getFieldValue('interfaceRequestTimeStart') &&
                          moment(getFieldValue('interfaceRequestTimeStart')).isAfter(
                            currentDate,
                            'time'
                          )
                        }
                        style={{ width: '100%' }}
                        showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                      />
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
                  {intl.get(`hzero.common.button.search`).d('查询')}
                </Button>
                <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  {intl.get(`hzero.common.button.reset`).d('重置')}
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
