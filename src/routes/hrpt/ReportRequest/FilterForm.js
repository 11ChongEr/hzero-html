import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input, Select, Row, Col, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { getDateTimeFormat } from 'utils/utils';
import { DEFAULT_TIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import Lov from 'components/Lov';

const { Option } = Select;

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const dateTimeFormat = getDateTimeFormat();
/**
 * 数据集查询表单
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
          // 如果验证成功,则执行search
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
      form: { getFieldDecorator, getFieldValue },
      requestStatusList = [],
      tenantRoleLevel,
    } = this.props;
    return (
      <Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                {!tenantRoleLevel && (
                  <Col span={8}>
                    <Form.Item label={intl.get('entity.tenant.tag').d('租户')} {...formLayout}>
                      {getFieldDecorator('tenantId', {})(
                        <Lov code="HPFM.TENANT" textField="tenantName" />
                      )}
                    </Form.Item>
                  </Col>
                )}
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get('hmsg.reportRequest.model.reportRequest.reportName')
                      .d('报表名称')}
                    {...formLayout}
                  >
                    {getFieldDecorator('reportName', {})(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get('hrpt.reportRequest.model.reportRequest.requestStatus')
                      .d('运行状态')}
                    {...formLayout}
                  >
                    {getFieldDecorator('requestStatus', {})(
                      <Select allowClear style={{ width: 150 }}>
                        {requestStatusList.map(item => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get('hrpt.reportRequest.model.reportRequest.startDate')
                      .d('开始时间')}
                    {...formLayout}
                  >
                    {getFieldDecorator('startDate')(
                      <DatePicker
                        format={dateTimeFormat}
                        showTime={{ format: DEFAULT_TIME_FORMAT }}
                        placeholder=""
                        disabledDate={currentDate =>
                          getFieldValue('endDate') &&
                          moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                        }
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get('hrpt.reportRequest.model.reportRequest.endDate').d('结束时间')}
                    {...formLayout}
                  >
                    {getFieldDecorator('endDate')(
                      <DatePicker
                        format={dateTimeFormat}
                        showTime={{ format: DEFAULT_TIME_FORMAT }}
                        placeholder=""
                        disabledDate={currentDate =>
                          getFieldValue('startDate') &&
                          moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                        }
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
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
                <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Fragment>
    );
  }
}
